"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { COLS } from "@/lib/admin-data";
import { checkCredentials, createSession, destroySession, isAuthConfigured, requireAdmin } from "@/lib/auth";
import { flag, MENU_TAG, SETTING_LABELS, TABS } from "@/lib/data";
import { appendRow, deleteRow, readSheet, updateCells, updateRow } from "@/lib/sheets";
import { uploadImage } from "@/lib/storage";
import type { ItemOption } from "@/lib/types";

export type FormState = { error?: string; ok?: boolean } | undefined;

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const bool = (fd: FormData, key: string) => fd.get(key) === "on" || fd.get(key) === "true";
const int = (fd: FormData, key: string) => Number.parseInt(str(fd, key), 10) || 0;
const yes = (b: boolean) => (b ? "نعم" : "لا");
function price(fd: FormData, key: string) {
  const raw = str(fd, key).replace(/,/g, "");
  if (raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : NaN;
}
function imageFile(fd: FormData) {
  const f = fd.get("image");
  return f instanceof File && f.size > 0 ? f : null;
}
function refresh() {
  updateTag(MENU_TAG);
  revalidatePath("/");
  revalidatePath("/admin", "layout");
}
function message(err: unknown) {
  return err instanceof Error ? err.message : "حدث خطأ غير متوقع";
}

const STALE = "تغيّر الجدول منذ فتح هذه الصفحة. أعد تحميل الصفحة وحاول مجدداً.";

/** Re-reads the tab and returns the row, making sure it still holds what the form was opened on. */
async function locate(tab: string, columns: readonly string[], row: number, keyCol: string, expected: string) {
  const sheet = await readSheet(tab, columns);
  const found = sheet.rows.find((r) => r.row === row);
  if (!found || found.values[keyCol] !== expected) throw new Error(STALE);
  return { ...sheet, found };
}

/** Photo column value after an upload, a removal, or no change. */
async function nextImage(fd: FormData, current: string, folder: string) {
  const file = imageFile(fd);
  if (file) return uploadImage(file, folder);
  if (bool(fd, "remove_image")) return "";
  return current;
}

/* ---------- Auth ---------- */

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  if (!isAuthConfigured()) {
    return { error: "لم يتم ضبط بريد وكلمة مرور المدير (ADMIN_EMAIL و ADMIN_PASSWORD) في إعدادات Vercel" };
  }
  if (!checkCredentials(str(fd, "email"), String(fd.get("password") ?? ""))) {
    await new Promise((r) => setTimeout(r, 800)); // slow down guessing
    return { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
  }
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

/* ---------- Menu items ---------- */
// Quick actions (toggle/delete) return an error message for the button to show.

function parseOptions(raw: string): ItemOption[] | string {
  if (!raw) return [];
  try {
    const list = JSON.parse(raw) as { name?: string; price?: string | number }[];
    const out: ItemOption[] = [];
    for (const o of list) {
      const name = String(o.name ?? "").trim();
      const p = Number(String(o.price ?? "").replace(/,/g, ""));
      if (!name && (o.price === "" || o.price === undefined)) continue;
      if (!name) return "اسم الحجم/الخيار مطلوب";
      if (/[:=|]/.test(name)) return `اسم الخيار "${name}" يحتوي على رمز غير مسموح (: = |)`;
      if (String(o.price ?? "").trim() === "" || !Number.isFinite(p) || p < 0) return `سعر غير صالح للخيار "${name}"`;
      out.push({ name, price: p });
    }
    return out;
  } catch {
    return "صيغة الخيارات غير صالحة";
  }
}

export async function saveItem(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const row = int(fd, "row");
  const name = str(fd, "name");
  const category = str(fd, "category");
  const options = parseOptions(str(fd, "options"));
  const p = price(fd, "price");

  if (!name) return { error: "اسم الصنف مطلوب" };
  if (!category) return { error: "اختر القسم أو اكتب قسماً جديداً" };
  if (typeof options === "string") return { error: options };
  if (Number.isNaN(p)) return { error: "السعر غير صالح" };
  // With sizes, the price column holds the cheapest one.
  const basePrice = options.length ? Math.min(...options.map((o) => o.price)) : p;

  try {
    const values = {
      "القسم": category,
      "الاسم": name,
      "الوصف": str(fd, "description"),
      "السعر": basePrice ?? "",
      "الخيارات": options.map((o) => `${o.name}:${o.price}`).join("|"),
      "متوفر": yes(bool(fd, "available")),
      "مميز": bool(fd, "featured") ? "نعم" : "",
    };
    if (row) {
      const { header, found } = await locate(TABS.items, COLS.items, row, "الاسم", str(fd, "expected"));
      await updateRow(TABS.items, header, found, {
        ...values,
        "الصورة": await nextImage(fd, found.values["الصورة"], "items"),
      });
    } else {
      const { header } = await readSheet(TABS.items, COLS.items);
      await appendRow(TABS.items, header, { ...values, "الصورة": await nextImage(fd, "", "items") });
    }
  } catch (err) {
    return { error: message(err) };
  }
  refresh();
  redirect("/admin");
}

export async function toggleItem(row: number, name: string): Promise<string | void> {
  await requireAdmin();
  try {
    const { header, found } = await locate(TABS.items, COLS.items, row, "الاسم", name);
    await updateRow(TABS.items, header, found, { "متوفر": yes(!flag(found.values["متوفر"], true)) });
  } catch (err) {
    return message(err);
  }
  refresh();
}

export async function deleteItem(row: number, name: string): Promise<string | void> {
  await requireAdmin();
  try {
    await locate(TABS.items, COLS.items, row, "الاسم", name);
    await deleteRow(TABS.items, row);
  } catch (err) {
    return message(err);
  }
  refresh();
}

/* ---------- Categories ---------- */

export async function saveCategory(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const row = int(fd, "row");
  const expected = str(fd, "expected");
  const name = str(fd, "name");
  const icon = str(fd, "icon") || "☕";
  if (!name) return { error: "اسم القسم مطلوب" };

  try {
    if (row) {
      const { header, found } = await locate(TABS.categories, COLS.categories, row, "القسم", expected);
      await updateRow(TABS.categories, header, found, { "القسم": name, "الأيقونة": icon });
      // Renaming moves the category's items along with it.
      if (name !== expected) {
        const items = await readSheet(TABS.items, COLS.items);
        await updateCells(
          TABS.items,
          items.header,
          items.rows.filter((r) => r.values["القسم"] === expected).map((r) => ({ row: r.row, col: "القسم", value: name })),
        );
      }
    } else {
      const sheet = await readSheet(TABS.categories, COLS.categories);
      if (sheet.rows.some((r) => r.values["القسم"] === name)) return { error: "هذا القسم موجود مسبقاً" };
      await appendRow(TABS.categories, sheet.header, { "القسم": name, "الأيقونة": icon });
    }
  } catch (err) {
    return { error: message(err) };
  }
  refresh();
  return { ok: true };
}

export async function deleteCategory(row: number, name: string): Promise<string | void> {
  await requireAdmin();
  try {
    await locate(TABS.categories, COLS.categories, row, "القسم", name);
    await deleteRow(TABS.categories, row);
  } catch (err) {
    return message(err);
  }
  refresh();
}

/* ---------- Offers ---------- */

export async function saveOffer(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const row = int(fd, "row");
  const title = str(fd, "title");
  const p = price(fd, "price");
  const oldPrice = price(fd, "old_price");

  if (!title) return { error: "عنوان العرض مطلوب" };
  if (p === null || Number.isNaN(p)) return { error: "سعر العرض غير صالح" };
  if (Number.isNaN(oldPrice)) return { error: "السعر القديم غير صالح" };

  try {
    const values = {
      "العنوان": title,
      "الوصف": str(fd, "description"),
      "السعر": p,
      "السعر القديم": oldPrice ?? "",
      "فعّال": yes(bool(fd, "active")),
    };
    if (row) {
      const { header, found } = await locate(TABS.offers, COLS.offers, row, "العنوان", str(fd, "expected"));
      await updateRow(TABS.offers, header, found, {
        ...values,
        "الصورة": await nextImage(fd, found.values["الصورة"], "offers"),
      });
    } else {
      const { header } = await readSheet(TABS.offers, COLS.offers);
      await appendRow(TABS.offers, header, { ...values, "الصورة": await nextImage(fd, "", "offers") });
    }
  } catch (err) {
    return { error: message(err) };
  }
  refresh();
  redirect("/admin/offers");
}

export async function deleteOffer(row: number, title: string): Promise<string | void> {
  await requireAdmin();
  try {
    await locate(TABS.offers, COLS.offers, row, "العنوان", title);
    await deleteRow(TABS.offers, row);
  } catch (err) {
    return message(err);
  }
  refresh();
}

/* ---------- Settings ---------- */

export async function saveSettings(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const values: Record<string, string> = {};
  for (const [label, key] of Object.entries(SETTING_LABELS)) values[label] = str(fd, key);
  values["رقم واتساب"] = values["رقم واتساب"].replace(/\D/g, "");
  values["العملة"] = values["العملة"] === "LBP" ? "LBP" : "USD";
  values["التوصيل"] = yes(bool(fd, "delivery_enabled"));
  if (values["رقم واتساب"].length < 8) return { error: "أدخل رقم واتساب مع رمز الدولة، مثال: 96170123456" };

  try {
    const sheet = await readSheet(TABS.settings, COLS.settings);
    const changed = [];
    for (const [label, value] of Object.entries(values)) {
      const existing = sheet.rows.find((r) => r.values["الإعداد"] === label);
      if (!existing) await appendRow(TABS.settings, sheet.header, { "الإعداد": label, "القيمة": value });
      else if (existing.values["القيمة"] !== value) changed.push({ row: existing.row, col: "القيمة", value });
    }
    await updateCells(TABS.settings, sheet.header, changed);
  } catch (err) {
    return { error: message(err) };
  }
  refresh();
  return { ok: true };
}
