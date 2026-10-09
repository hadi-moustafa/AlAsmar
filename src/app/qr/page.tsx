import type { Metadata } from "next";
import Image from "next/image";
import { menuQrSvg } from "@/lib/qr";
import { siteUrl } from "@/lib/site";
import { PrintButton } from "./PrintButton";

export const metadata: Metadata = {
  title: "رمز QR | الأسمر",
  robots: { index: false },
};

export default async function QrPage() {
  const svg = await menuQrSvg();
  return (
    <main className="grid min-h-dvh place-items-center bg-crema px-4 py-8 print:bg-white print:p-0">
      <div className="w-full max-w-sm">
        <div className="rounded-3xl bg-foam p-6 text-center shadow-lg ring-1 ring-latte print:shadow-none print:ring-2 print:ring-espresso">
          <div className="relative mx-auto size-20 overflow-hidden rounded-full ring-2 ring-caramel">
            <Image src="/logo.jpg" alt="شعار الأسمر" fill sizes="80px" className="scale-[1.32] object-cover" />
          </div>
          <h1 className="mt-3 font-display text-3xl text-espresso">الأسمر</h1>
          <p className="mt-1 text-lg font-bold text-mocha">امسح الرمز لتصفّح القائمة واطلب عبر واتساب</p>
          <div className="mx-auto mt-4 w-full max-w-64 [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
          <p dir="ltr" className="mt-3 break-all text-sm text-mocha/70">
            {siteUrl.replace(/^https?:\/\//, "")}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
          <PrintButton />
          <a href="/qr.png" download className="rounded-full bg-caramel px-6 py-3 font-bold text-espresso">
            تحميل PNG
          </a>
          <a href="/qr.svg" download className="rounded-full bg-foam px-6 py-3 font-bold text-mocha ring-1 ring-latte">
            تحميل SVG
          </a>
        </div>
      </div>
    </main>
  );
}
