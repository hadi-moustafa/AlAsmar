import "server-only";
import { createSign } from "node:crypto";
import { sheetId } from "./data";

/**
 * Minimal Google Sheets API client authenticated as a service account
 * (GOOGLE_SERVICE_ACCOUNT_KEY = the JSON key file's contents). The sheet must
 * be a native Google Sheet shared with the service account's email as Editor.
 */

type Key = { client_email: string; private_key: string };
type Cell = string | number;
export type SheetRow = { row: number; values: Record<string, string> };

function serviceKey(): Key {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.trim();
  if (!raw) throw new Error("لم يتم ضبط GOOGLE_SERVICE_ACCOUNT_KEY في إعدادات Vercel");
  try {
    const key = JSON.parse(raw) as Key;
    return { client_email: key.client_email, private_key: key.private_key.replace(/\\n/g, "\n") };
  } catch {
    throw new Error("قيمة GOOGLE_SERVICE_ACCOUNT_KEY غير صالحة (يجب لصق ملف JSON كاملاً)");
  }
}

export const serviceAccountEmail = () => {
  try {
    return serviceKey().client_email;
  } catch {
    return null;
  }
};

let token: { value: string; expires: number } | null = null;

async function accessToken() {
  if (token && token.expires > Date.now() + 60_000) return token.value;
  const key = serviceKey();
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
    iss: key.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })}`;
  const signature = createSign("RSA-SHA256").update(unsigned).sign(key.private_key, "base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`تعذّر الاتصال بحساب Google (HTTP ${res.status})`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  token = { value: json.access_token, expires: Date.now() + json.expires_in * 1000 };
  return token.value;
}

async function api<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const id = sheetId();
  if (!id) throw new Error("GOOGLE_SHEET_ID is not set.");
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${id}${path}`, {
    method: init?.method ?? "GET",
    headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" },
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    if (/not supported for this document/i.test(text)) {
      throw new Error("الملف بصيغة Excel. افتحه في Google Sheets واختر: ملف ← حفظ بتنسيق جداول بيانات Google، ثم استخدم الرابط الجديد.");
    }
    if (res.status === 403 || res.status === 404) {
      throw new Error(`لا يمكن تعديل الجدول. شارك الجدول مع ${serviceAccountEmail() ?? "حساب الخدمة"} بصلاحية «محرر».`);
    }
    throw new Error(`Google Sheets error (HTTP ${res.status})`);
  }
  return (await res.json()) as T;
}

const range = (tab: string, a1 = "") => encodeURIComponent(`'${tab.replace(/'/g, "''")}'${a1 ? `!${a1}` : ""}`);

function column(i: number) {
  let s = "";
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
}

/** Reads a tab, adding any of `columns` missing from its header row. Row numbers are 1-based sheet rows. */
export async function readSheet(tab: string, columns: readonly string[]) {
  const data = await api<{ values?: string[][] }>(`/values/${range(tab)}?valueRenderOption=FORMATTED_VALUE`);
  const [rawHeader = [], ...rest] = data.values ?? [];
  const header = rawHeader.map((h) => String(h).trim());
  const missing = columns.filter((c) => !header.includes(c));
  if (missing.length) {
    await api(`/values/${range(tab, `${column(header.length)}1`)}?valueInputOption=RAW`, {
      method: "PUT",
      body: { values: [missing] },
    });
    header.push(...missing);
  }
  const rows: SheetRow[] = rest
    .map((cells, i) => ({
      row: i + 2,
      values: Object.fromEntries(header.map((h, j) => [h, String(cells[j] ?? "").trim()])),
    }))
    .filter((r) => Object.values(r.values).some(Boolean));
  return { header, rows };
}

const toCells = (header: string[], values: Record<string, Cell>, current: Record<string, string> = {}) =>
  header.map((h) => (h in values ? values[h] : (current[h] ?? "")));

/** Overwrites one row, keeping columns not mentioned in `values`. */
export async function updateRow(tab: string, header: string[], row: SheetRow, values: Record<string, Cell>) {
  await api(`/values/${range(tab, `A${row.row}:${column(header.length - 1)}${row.row}`)}?valueInputOption=RAW`, {
    method: "PUT",
    body: { values: [toCells(header, values, row.values)] },
  });
}

export async function appendRow(tab: string, header: string[], values: Record<string, Cell>) {
  await api(`/values/${range(tab, "A1")}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    method: "POST",
    body: { values: [toCells(header, values)] },
  });
}

export async function deleteRow(tab: string, row: number) {
  const meta = await api<{ sheets: { properties: { sheetId: number; title: string } }[] }>(
    "?fields=sheets.properties(sheetId,title)",
  );
  const sheet = meta.sheets.find((s) => s.properties.title === tab);
  if (!sheet) throw new Error(`لم يتم العثور على الورقة «${tab}»`);
  await api(":batchUpdate", {
    method: "POST",
    body: {
      requests: [
        {
          deleteDimension: {
            range: { sheetId: sheet.properties.sheetId, dimension: "ROWS", startIndex: row - 1, endIndex: row },
          },
        },
      ],
    },
  });
}

/** Writes single cells in one request, e.g. renaming a category across many item rows. */
export async function updateCells(tab: string, header: string[], cells: { row: number; col: string; value: Cell }[]) {
  if (!cells.length) return;
  await api("/values:batchUpdate", {
    method: "POST",
    body: {
      valueInputOption: "RAW",
      data: cells.map((c) => ({
        range: decodeURIComponent(range(tab, `${column(header.indexOf(c.col))}${c.row}`)),
        values: [[c.value]],
      })),
    },
  });
}
