import type { Metadata, Viewport } from "next";
import { Cairo, Reem_Kufi_Fun } from "next/font/google";
import "./globals.css";

const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo" });
const kufi = Reem_Kufi_Fun({ subsets: ["arabic", "latin"], variable: "--font-kufi" });

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "الأسمر | قهوة وكريب",
  description: "قائمة مقهى الأسمر — قهوة مختصة وكريب طازج. اطلب مباشرة عبر واتساب.",
  openGraph: {
    title: "الأسمر | قهوة وكريب",
    description: "اطلب قهوتك وكريبك المفضل عبر واتساب",
    images: ["/logo.jpg"],
    locale: "ar_LB",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#1b1714",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${kufi.variable}`}>
      <body>{children}</body>
    </html>
  );
}
