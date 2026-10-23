import { get } from "@vercel/blob";

/** Serves admin-uploaded menu photos from a private Vercel Blob store (they're public on the menu anyway). */
export async function GET(_: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const pathname = (await params).path.join("/");
  // Only the folders the admin panel uploads to.
  if (!/^(items|offers)\/[\w-]+\.(webp|jpg|png|avif)$/.test(pathname)) {
    return new Response("Not found", { status: 404 });
  }
  const result = await get(pathname, { access: "private" }).catch(() => null);
  if (result?.statusCode !== 200) return new Response("Not found", { status: 404 });
  return new Response(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType,
      "X-Content-Type-Options": "nosniff",
      // File names are random and never reused, so the photo can be cached for good.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
