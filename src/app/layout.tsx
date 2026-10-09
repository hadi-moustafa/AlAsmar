import type { Metadata, Viewport } from "next";
import { Alexandria, Readex_Pro } from "next/font/google";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const body = Readex_Pro({ subsets: ["arabic", "latin"], variable: "--font-body" });
const display = Alexandria({ subsets: ["arabic", "latin"], variable: "--font-display-face" });

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
  themeColor: "#110e0c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={`${body.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
