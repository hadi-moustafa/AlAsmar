import { menuQrPng } from "@/lib/qr";

export async function GET() {
  return new Response(new Uint8Array(await menuQrPng()), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": 'attachment; filename="al-asmar-menu-qr.png"',
    },
  });
}
