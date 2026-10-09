import { menuQrSvg } from "@/lib/qr";

export async function GET() {
  return new Response(await menuQrSvg(), {
    headers: {
      "Content-Type": "image/svg+xml",
      "Content-Disposition": 'attachment; filename="al-asmar-menu-qr.svg"',
    },
  });
}
