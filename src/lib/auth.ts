import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "alasmar_admin";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 days

export const isAuthConfigured = () => Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD);

function secret() {
  // Changing the email or password also signs everyone out.
  const s = process.env.ADMIN_SESSION_SECRET ?? `${process.env.ADMIN_EMAIL}:${process.env.ADMIN_PASSWORD}`;
  if (!isAuthConfigured()) throw new Error("ADMIN_EMAIL / ADMIN_PASSWORD are not set.");
  return s;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function checkCredentials(email: string, password: string) {
  if (!isAuthConfigured()) return false;
  const expected = `${process.env.ADMIN_EMAIL!.trim().toLowerCase()}\n${process.env.ADMIN_PASSWORD}`;
  // Compare HMACs so the comparison is constant-time regardless of length.
  return safeEqual(sign(`login:${email.trim().toLowerCase()}\n${password}`), sign(`login:${expected}`));
}

export async function createSession() {
  const expires = Date.now() + MAX_AGE * 1000;
  const token = `${expires}.${sign(`session:${expires}`)}`;
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  // Read the cookie first so admin pages are always rendered per request.
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || !isAuthConfigured()) return false;
  const [expires, sig] = token.split(".");
  if (!expires || !sig || Number(expires) < Date.now()) return false;
  return safeEqual(sig, sign(`session:${expires}`));
}

/** Call at the top of every admin page and server action. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
