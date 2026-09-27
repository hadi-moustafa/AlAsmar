"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, createSession, destroySession, requireAdmin } from "@/lib/auth";
import { ensureSchema, sql } from "@/lib/db";
import { deleteImage, uploadImage } from "@/lib/storage";
import { DEFAULT_SETTINGS, type ItemOption } from "@/lib/types";

export type FormState = { error?: string; ok?: boolean } | undefined;

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const bool = (fd: FormData, key: string) => fd.get(key) === "on" || fd.get(key) === "true";
const int = (fd: FormData, key: string) => Number.parseInt(str(fd, key), 10) || 0;
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
  revalidatePath("/");
  revalidatePath("/admin", "layout");
}
function message(err: unknown) {
  return err instanceof Error ? err.message : "حدث خطأ غير متوقع";
}

/* ---------- Auth ---------- */

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  if (!process.env.ADMIN_PASSWORD) {
    return { error: "لم يتم ضبط كلمة مرور المدير (ADMIN_PASSWORD) في إعدادات Vercel" };
  }
  if (!checkPassword(str(fd, "password"))) {
    await new Promise((r) => setTimeout(r, 800)); // slow down guessing
    return { error: "كلمة المرور غير صحيحة" };
  }
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

/* ---------- Categories ---------- */

export async function saveCategory(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = int(fd, "id");
  const name = str(fd, "name");
  const icon = str(fd, "icon") || "☕";
  const sort = int(fd, "sort_order");
  if (!name) return { error: "اسم القسم مطلوب" };
  try {
    await ensureSchema();
    if (id) {
      await sql()`UPDATE categories SET name=${name}, icon=${icon}, sort_order=${sort} WHERE id=${id}`;
    } else {
      await sql()`INSERT INTO categories (name, icon, sort_order) VALUES (${name}, ${icon}, ${sort})`;
    }
  } catch (err) {
    return { error: message(err) };
  }
  refresh();
  return { ok: true };
}

export async function deleteCategory(id: number) {
  await requireAdmin();
  const images = await sql()`SELECT image_url FROM menu_items WHERE category_id=${id}`;
  await sql()`DELETE FROM categories WHERE id=${id}`;
  await Promise.all(images.map((r) => deleteImage(r.image_url as string)));
  refresh();
}

/* ---------- Menu items ---------- */

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
      if (!Number.isFinite(p) || p < 0) return `سعر غير صالح للخيار "${name}"`;
      out.push({ name, price: p });
    }
    return out;
  } catch {
    return "صيغة الخيارات غير صالحة";
  }
}

export async function saveItem(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = int(fd, "id");
  const categoryId = int(fd, "category_id");
  const name = str(fd, "name");
  const description = str(fd, "description");
  const options = parseOptions(str(fd, "options"));
  const p = price(fd, "price");
  const isAvailable = bool(fd, "is_available");
  const isFeatured = bool(fd, "is_featured");
  const sort = int(fd, "sort_order");
  const removeImage = bool(fd, "remove_image");
  const file = imageFile(fd);

  if (!name) return { error: "اسم الصنف مطلوب" };
  if (!categoryId) return { error: "اختر القسم" };
  if (typeof options === "string") return { error: options };
  if (p === null && options.length === 0) return { error: "السعر مطلوب" };
  if (Number.isNaN(p)) return { error: "السعر غير صالح" };
  // With sizes, the base price shown is the cheapest option.
  const basePrice = options.length ? Math.min(...options.map((o) => o.price)) : (p ?? 0);

  try {
    await ensureSchema();
    const [existing] = id
      ? await sql()`SELECT image_url FROM menu_items WHERE id=${id}`
      : [undefined];
    let imageUrl: string | null = (existing?.image_url as string) ?? null;
    if (file) {
      const uploaded = await uploadImage(file, "items");
      await deleteImage(imageUrl);
      imageUrl = uploaded;
    } else if (removeImage) {
      await deleteImage(imageUrl);
      imageUrl = null;
    }

    const optionsJson = sql().json(options);
    if (id) {
      await sql()`
        UPDATE menu_items SET category_id=${categoryId}, name=${name}, description=${description},
          price=${basePrice}, options=${optionsJson}, image_url=${imageUrl},
          is_available=${isAvailable}, is_featured=${isFeatured}, sort_order=${sort}
        WHERE id=${id}`;
    } else {
      await sql()`
        INSERT INTO menu_items (category_id, name, description, price, options, image_url,
          is_available, is_featured, sort_order)
        VALUES (${categoryId}, ${name}, ${description}, ${basePrice}, ${optionsJson}, ${imageUrl},
          ${isAvailable}, ${isFeatured}, ${sort})`;
    }
  } catch (err) {
    return { error: message(err) };
  }
  refresh();
  redirect("/admin");
}

export async function deleteItem(id: number) {
  await requireAdmin();
  const [row] = await sql()`DELETE FROM menu_items WHERE id=${id} RETURNING image_url`;
  await deleteImage(row?.image_url as string);
  refresh();
}

export async function toggleItemAvailability(id: number) {
  await requireAdmin();
  await sql()`UPDATE menu_items SET is_available = NOT is_available WHERE id=${id}`;
  refresh();
}

/* ---------- Offers ---------- */

export async function saveOffer(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = int(fd, "id");
  const title = str(fd, "title");
  const description = str(fd, "description");
  const p = price(fd, "price");
  const oldPrice = price(fd, "old_price");
  const isActive = bool(fd, "is_active");
  const sort = int(fd, "sort_order");
  const removeImage = bool(fd, "remove_image");
  const file = imageFile(fd);

  if (!title) return { error: "عنوان العرض مطلوب" };
  if (p === null || Number.isNaN(p)) return { error: "سعر العرض غير صالح" };
  if (Number.isNaN(oldPrice)) return { error: "السعر القديم غير صالح" };

  try {
    await ensureSchema();
    const [existing] = id ? await sql()`SELECT image_url FROM offers WHERE id=${id}` : [undefined];
    let imageUrl: string | null = (existing?.image_url as string) ?? null;
    if (file) {
      const uploaded = await uploadImage(file, "offers");
      await deleteImage(imageUrl);
      imageUrl = uploaded;
    } else if (removeImage) {
      await deleteImage(imageUrl);
      imageUrl = null;
    }
    if (id) {
      await sql()`
        UPDATE offers SET title=${title}, description=${description}, price=${p},
          old_price=${oldPrice}, image_url=${imageUrl}, is_active=${isActive}, sort_order=${sort}
        WHERE id=${id}`;
    } else {
      await sql()`
        INSERT INTO offers (title, description, price, old_price, image_url, is_active, sort_order)
        VALUES (${title}, ${description}, ${p}, ${oldPrice}, ${imageUrl}, ${isActive}, ${sort})`;
    }
  } catch (err) {
    return { error: message(err) };
  }
  refresh();
  redirect("/admin/offers");
}

export async function deleteOffer(id: number) {
  await requireAdmin();
  const [row] = await sql()`DELETE FROM offers WHERE id=${id} RETURNING image_url`;
  await deleteImage(row?.image_url as string);
  refresh();
}

export async function toggleOffer(id: number) {
  await requireAdmin();
  await sql()`UPDATE offers SET is_active = NOT is_active WHERE id=${id}`;
  refresh();
}

/* ---------- Settings ---------- */

export async function saveSettings(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const values: Record<string, string> = {};
  for (const key of Object.keys(DEFAULT_SETTINGS)) values[key] = str(fd, key);
  values.whatsapp_number = values.whatsapp_number.replace(/[^\d]/g, "");
  values.currency = values.currency === "LBP" ? "LBP" : "USD";
  values.delivery_enabled = bool(fd, "delivery_enabled") ? "1" : "0";
  if (!values.whatsapp_number) {
    return { error: "رقم واتساب مطلوب لاستقبال الطلبات" };
  }
  if (values.whatsapp_number.length < 8) {
    return { error: "أدخل الرقم مع رمز الدولة، مثال: 96170123456" };
  }
  try {
    await ensureSchema();
    await sql().begin(async (tx) => {
      for (const [key, value] of Object.entries(values)) {
        await tx`
          INSERT INTO settings (key, value) VALUES (${key}, ${value})
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
      }
    });
  } catch (err) {
    return { error: message(err) };
  }
  refresh();
  return { ok: true };
}
