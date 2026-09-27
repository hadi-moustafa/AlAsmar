import "server-only";
import { ensureSchema, sql } from "./db";
import {
  DEFAULT_SETTINGS,
  type Category,
  type ItemOption,
  type MenuItem,
  type Offer,
  type Settings,
} from "./types";

type Row = Record<string, unknown>;

const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));

function toItem(r: Row): MenuItem {
  return {
    id: r.id as number,
    category_id: r.category_id as number,
    name: r.name as string,
    description: r.description as string,
    price: Number(r.price),
    options: ((r.options as ItemOption[]) ?? []).map((o) => ({
      name: o.name,
      price: Number(o.price),
    })),
    image_url: (r.image_url as string) ?? null,
    is_available: r.is_available as boolean,
    is_featured: r.is_featured as boolean,
    sort_order: r.sort_order as number,
  };
}

function toOffer(r: Row): Offer {
  return {
    id: r.id as number,
    title: r.title as string,
    description: r.description as string,
    price: Number(r.price),
    old_price: num(r.old_price),
    image_url: (r.image_url as string) ?? null,
    is_active: r.is_active as boolean,
    sort_order: r.sort_order as number,
  };
}

export async function getCategories(): Promise<Category[]> {
  await ensureSchema();
  const rows = await sql()`
    SELECT id, name, icon, sort_order FROM categories ORDER BY sort_order, id`;
  return rows as unknown as Category[];
}

export async function getItems(): Promise<MenuItem[]> {
  await ensureSchema();
  const rows = await sql()`SELECT * FROM menu_items ORDER BY sort_order, id`;
  return rows.map(toItem);
}

export async function getItem(id: number): Promise<MenuItem | null> {
  await ensureSchema();
  const [row] = await sql()`SELECT * FROM menu_items WHERE id = ${id}`;
  return row ? toItem(row) : null;
}

export async function getOffers({ activeOnly = false } = {}): Promise<Offer[]> {
  await ensureSchema();
  const rows = activeOnly
    ? await sql()`SELECT * FROM offers WHERE is_active ORDER BY sort_order, id`
    : await sql()`SELECT * FROM offers ORDER BY sort_order, id`;
  return rows.map(toOffer);
}

export async function getOffer(id: number): Promise<Offer | null> {
  await ensureSchema();
  const [row] = await sql()`SELECT * FROM offers WHERE id = ${id}`;
  return row ? toOffer(row) : null;
}

export async function getSettings(): Promise<Settings> {
  await ensureSchema();
  const rows = await sql()`SELECT key, value FROM settings`;
  const settings: Settings = { ...DEFAULT_SETTINGS };
  for (const { key, value } of rows) {
    if (key in settings) (settings as Record<string, string>)[key] = value;
  }
  return settings;
}

/** Everything the public menu page needs, fetched in parallel. */
export async function getPublicMenu() {
  await ensureSchema();
  const [categories, items, offers, settings] = await Promise.all([
    getCategories(),
    getItems(),
    getOffers({ activeOnly: true }),
    getSettings(),
  ]);
  return { categories, items, offers, settings };
}
