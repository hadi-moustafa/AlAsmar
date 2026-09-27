# الأسمر — Barista Al-Asmar

Mobile-first Arabic (RTL) menu for Al-Asmar coffee & crepe shop. Customers pick items, see a running total, and send the order to the barista over WhatsApp. An admin panel (`/admin`) manages categories, items (with photos, prices, sizes), special offers and shop settings.

**Stack:** Next.js 16 (App Router, Server Actions) · Tailwind CSS 4 · Postgres (Neon) · Vercel Blob for images.

## Deploy on Vercel

1. **Database** — Vercel dashboard → project → *Storage* → *Create* → **Neon (Postgres)** → connect to the project. This sets `DATABASE_URL`.
2. **Images** — *Storage* → *Create* → **Blob** → connect to the project. This sets `BLOB_READ_WRITE_TOKEN`.
3. **Admin password** — *Settings → Environment Variables* → add `ADMIN_PASSWORD` (a long password). Optionally add `ADMIN_SESSION_SECRET` (random string) so changing the password doesn't have to log everyone out and vice-versa.
4. Redeploy. Tables are created automatically on the first request and seeded with a starter menu.
5. Open `/admin`, log in, go to **الإعدادات** and set the barista's WhatsApp number (country code, digits only, e.g. `96170123456`).

## Local development

```bash
cp .env.example .env.local   # fill in DATABASE_URL + ADMIN_PASSWORD
npm install
npm run dev
```

Quick local Postgres: `podman run -d -p 54329:5432 -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=alasmar postgres:17-alpine`
→ `DATABASE_URL=postgres://postgres:dev@localhost:54329/alasmar`.

Without `BLOB_READ_WRITE_TOKEN`, uploads in `next dev` are saved to `public/uploads/` (git-ignored). You can instead run `vercel env pull .env.local` to use the real stores.

## Structure

- `src/app/page.tsx` — public menu (server) → `src/components/menu/*` (client: cart, sheets, WhatsApp)
- `src/app/admin/actions.ts` — all admin Server Actions (each checks the session)
- `src/app/admin/(panel)/*` — admin pages: items, categories, offers, settings
- `src/lib/db.ts` — Postgres client, schema & seed · `src/lib/data.ts` — queries · `src/lib/auth.ts` — signed-cookie admin session · `src/lib/storage.ts` — image upload/delete
