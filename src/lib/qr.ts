import "server-only";
import QRCode from "qrcode";
import { siteUrl } from "./site";

const options = {
  errorCorrectionLevel: "M",
  margin: 2,
  color: { dark: "#1b1714", light: "#ffffff" },
} as const;

export const menuQrSvg = () => QRCode.toString(siteUrl, { ...options, type: "svg" });
export const menuQrPng = () => QRCode.toBuffer(siteUrl, { ...options, type: "png", width: 1200 });
