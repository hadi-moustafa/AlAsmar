import "server-only";
import { del, put } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const hasBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const EXT: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/avif": "avif",
};

/** Uploads an image to Vercel Blob (or public/uploads when running locally without a token). */
export async function uploadImage(file: File, folder: string) {
  if (!file.type.startsWith("image/")) throw new Error("الملف ليس صورة");
  if (file.size > 4 * 1024 * 1024) throw new Error("حجم الصورة كبير جداً (الحد 4MB)");
  const name = `${folder}/${randomUUID()}.${EXT[file.type] ?? "jpg"}`;

  if (hasBlob()) {
    const blob = await put(name, file, { access: "public", contentType: file.type });
    return blob.url;
  }
  if (process.env.VERCEL) {
    throw new Error("لم يتم ربط Vercel Blob بعد (BLOB_READ_WRITE_TOKEN مفقود)");
  }
  const dest = path.join(process.cwd(), "public", "uploads", name);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}

export async function deleteImage(url: string | null | undefined) {
  if (!url) return;
  try {
    if (url.startsWith("/uploads/")) {
      await unlink(path.join(process.cwd(), "public", url));
    } else if (hasBlob() && url.includes(".blob.vercel-storage.com")) {
      await del(url);
    }
  } catch (err) {
    console.warn("Failed to delete image", url, err);
  }
}
