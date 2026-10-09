import type { Settings } from "./types";

const toLatinDigits = (s: string) => s.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));

/** "71 819 311" → "tel:+96171819311" (Lebanese numbers without a country code get +961). */
export function telHref(phone: string) {
  let digits = toLatinDigits(phone).replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (!digits.startsWith("961")) digits = `961${digits.replace(/^0/, "")}`;
  return `tel:+${digits}`;
}

/** Accepts a profile URL or a bare handle. */
export function instagramLink(value: string) {
  const v = value.trim();
  if (!v) return null;
  const handle = /^https?:\/\//i.test(v) ? new URL(v).pathname.split("/").filter(Boolean)[0] ?? "" : v.replace(/^@/, "");
  return handle ? { href: `https://www.instagram.com/${handle}`, handle } : null;
}

export const isUrl = (v: string) => /^https?:\/\//i.test(v.trim());

/** Contact/social links present in the settings, in display order. */
export function contactLinks(s: Settings) {
  const insta = instagramLink(s.instagram);
  return {
    tel: telHref(s.phone),
    whatsapp: s.whatsapp_number ? `https://wa.me/${s.whatsapp_number}` : null,
    maps: isUrl(s.maps_url) ? s.maps_url.trim() : null,
    instagram: insta?.href ?? null,
    facebook: isUrl(s.facebook) ? s.facebook.trim() : null,
  };
}
