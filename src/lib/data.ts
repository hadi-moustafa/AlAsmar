import "server-only";
import {
  DEFAULT_SETTINGS,
  type Category,
  type Currency,
  type ItemOption,
  type MenuItem,
  type Offer,
  type Settings,
} from "./types";

/** How often (seconds) the menu is re-read from the Google Sheet. */
export const MENU_REVALIDATE = 60;

const TABS = {
  categories: "الأقسام",
  items: "الأصناف",
  offers: "العروض",
  settings: "الإعدادات",
} as const;

/** Settings-tab labels (Arabic as in the template, English keys also accepted). */
const SETTING_LABELS: Record<string, keyof Settings> = {
  "رقم واتساب": "whatsapp_number",
  "العملة": "currency",
  "الشعار": "tagline",
  "العنوان": "address",
  "أوقات العمل": "hours",
  "انستغرام": "instagram",
  "إعلان": "announcement",
  "التوصيل": "delivery_enabled",
};

type Row = Record<string, string>;

/** Accepts either the bare sheet id or the full Google Sheets URL. */
function sheetId() {
  const raw = process.env.GOOGLE_SHEET_ID?.trim();
  if (!raw) return null;
  return raw.match(/\/d\/([\w-]+)/)?.[1] ?? raw;
}

export const isSheetConfigured = () => sheetId() !== null;

async function readTab(id: string, tab: string, required: string[]): Promise<Row[]> {
  const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(tab)}`;
  const res = await fetch(url, { next: { revalidate: MENU_REVALIDATE } });
  if (!res.ok) {
    throw new Error(`Google Sheet "${tab}" could not be read (HTTP ${res.status}). Is it shared as "Anyone with the link"?`);
  }
  const [header = [], ...rows] = parseCsv(await res.text());
  const keys = header.map((h) => h.trim());
  // gviz silently returns the first tab when a tab name doesn't exist; detect that by its headers.
  if (!required.every((k) => keys.includes(k))) return [];
  return rows
    .map((cells) => Object.fromEntries(keys.map((k, i) => [k, (cells[i] ?? "").trim()])))
    .filter((r) => Object.values(r).some(Boolean));
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const endCell = () => {
    row.push(cell);
    cell = "";
  };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") endCell();
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      endCell();
      rows.push(row);
      row = [];
    } else cell += ch;
  }
  if (cell || row.length) {
    endCell();
    rows.push(row);
  }
  return rows;
}

const toLatinDigits = (s: string) =>
  s.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));

function num(s: string | undefined) {
  const t = toLatinDigits(s ?? "").replace(/٫/g, ".");
  if (!/\d/.test(t)) return null;
  const n = Number(t.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

const YES = new Set(["نعم", "اي", "أي", "ايه", "yes", "y", "true", "1", "✓", "✔"]);
const NO = new Set(["لا", "no", "n", "false", "0", "✗", "✘"]);
function flag(s: string | undefined, fallback: boolean) {
  const v = (s ?? "").trim().toLowerCase();
  if (YES.has(v)) return true;
  if (NO.has(v)) return false;
  return fallback;
}

/** "صغير=3، كبير=4" (also ":" and new lines / commas as separators). */
function parseOptions(s: string | undefined): ItemOption[] {
  if (!s) return [];
  return s
    .split(/[\n,،;؛|]+/)
    .map((part) => {
      const m = part.match(/^(.*?)[=:]\s*([^=:]*)$/);
      const price = num(m?.[2]);
      return m && price !== null ? { name: m[1].trim(), price } : null;
    })
    .filter((o): o is ItemOption => o !== null && o.name !== "");
}

/** Turns Google Drive share links into direct image URLs; other links are used as-is. */
export function imageUrl(s: string | undefined) {
  const v = s?.trim();
  if (!v || !/^https?:\/\//i.test(v)) return null;
  const drive = v.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:.*&)?id=|thumbnail\?(?:.*&)?id=)([\w-]+)/);
  return drive ? `https://lh3.googleusercontent.com/d/${drive[1]}=w800` : v;
}

function currency(s: string | undefined): Currency {
  const v = (s ?? "").trim().toLowerCase();
  return /lbp|ل\.?ل|ليرة/.test(v) ? "LBP" : "USD";
}

export async function getPublicMenu() {
  const id = sheetId();
  if (!id) throw new Error("GOOGLE_SHEET_ID is not set.");

  const [catRows, itemRows, offerRows, settingRows] = await Promise.all([
    readTab(id, TABS.categories, ["القسم"]),
    readTab(id, TABS.items, ["القسم", "الاسم", "السعر"]),
    readTab(id, TABS.offers, ["العنوان", "السعر"]),
    readTab(id, TABS.settings, ["الإعداد", "القيمة"]),
  ]);

  const categories: Category[] = [];
  const categoryId = (name: string, icon?: string) => {
    const existing = categories.find((c) => c.name === name);
    if (existing) return existing.id;
    const id = categories.length + 1;
    categories.push({ id, name, icon: icon || "☕", sort_order: id });
    return id;
  };
  for (const r of catRows) if (r["القسم"]) categoryId(r["القسم"], r["الأيقونة"]);

  const items: MenuItem[] = itemRows
    .filter((r) => r["الاسم"])
    .map((r, i) => ({
      id: i + 1,
      category_id: categoryId(r["القسم"] || "أخرى"),
      name: r["الاسم"],
      description: r["الوصف"] ?? "",
      price: num(r["السعر"]) ?? 0,
      options: parseOptions(r["الخيارات"]),
      image_url: imageUrl(r["الصورة"]),
      is_available: flag(r["متوفر"], true),
      is_featured: flag(r["مميز"], false),
      sort_order: i,
    }));

  const offers: Offer[] = offerRows
    .filter((r) => r["العنوان"] && flag(r["فعال"] ?? r["فعّال"], true))
    .map((r, i) => ({
      id: i + 1,
      title: r["العنوان"],
      description: r["الوصف"] ?? "",
      price: num(r["السعر"]) ?? 0,
      old_price: num(r["السعر القديم"]),
      image_url: imageUrl(r["الصورة"]),
      is_active: true,
      sort_order: i,
    }));

  const settings: Settings = { ...DEFAULT_SETTINGS };
  for (const r of settingRows) {
    const label = r["الإعداد"];
    const key = SETTING_LABELS[label] ?? (label in settings ? (label as keyof Settings) : undefined);
    if (!key) continue;
    const value = r["القيمة"] ?? "";
    if (key === "currency") settings.currency = currency(value);
    else if (key === "delivery_enabled") settings.delivery_enabled = flag(value, true) ? "1" : "0";
    else if (key === "whatsapp_number") settings.whatsapp_number = toLatinDigits(value).replace(/\D/g, "");
    else settings[key] = value;
  }

  return { categories, items, offers, settings };
}
