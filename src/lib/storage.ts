import "server-only";
import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";

const EXT: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/avif": "avif",
};

/** Uploads a photo to Vercel Blob and returns its public URL (written into the sheet's photo column). */
export async function uploadImage(file: File, folder: string) {
  if (!file.type.startsWith("image/")) throw new Error("الملف ليس صورة");
  if (file.size > 4 * 1024 * 1024) throw new Error("حجم الصورة كبير جداً (الحد 4MB)");
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("لم يتم ربط Vercel Blob بعد (BLOB_READ_WRITE_TOKEN مفقود)");
  }
  const blob = await put(`${folder}/${randomUUID()}.${EXT[file.type] ?? "jpg"}`, file, {
    access: "public",
    contentType: file.type,
  });
  return blob.url;
}
