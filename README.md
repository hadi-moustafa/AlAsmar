# الأسمر — Barista Al-Asmar

Mobile-first Arabic (RTL) menu for Al-Asmar coffee & crepe shop. Customers pick items (and sizes/options), see a running total, and send the order to the barista over WhatsApp. Their cart and details are saved on their own phone.

The menu itself is a **Google Sheet**. The owner edits it either directly or from the admin panel at **`/admin`** (email + password), which writes to the same sheet and uploads photos. Sheet edits appear on the site within about a minute; admin edits right away.

**Stack:** Next.js 16 (App Router) · Tailwind CSS 4 · Google Sheets (read as CSV, written via the Sheets API) · Vercel Blob (photos).

## Set up the Google Sheet

1. Upload `docs/menu-template.xlsx` to Google Drive → open it → **File → Save as Google Sheets**.
2. **Share → General access → Anyone with the link → Viewer.**
3. Copy the sheet's URL.

Tabs (keep the tab names and the header row as they are):

| Tab | Columns |
| --- | --- |
| **الأقسام** | القسم · الأيقونة (emoji) — order of rows = order on the menu |
| **الأصناف** | القسم · الاسم · الوصف · السعر · الخيارات · الصورة · متوفر · مميز |
| **العروض** | العنوان · الوصف · السعر · السعر القديم · الصورة · فعّال |
| **الإعدادات** | الإعداد · القيمة (WhatsApp number, currency, tagline, address, hours, phone, Google Maps link, Instagram, Facebook, announcement, delivery) |

- **الخيارات** (sizes/options): `صغير=3، كبير=4` — each option with its full price. Leave empty for a single price.
- **الصورة**: a link to a photo. For Google Drive: upload the photo, share it as *Anyone with the link*, and paste the share link. Don't use the `IMAGE()` formula or images pasted into cells — they can't be read.
- **متوفر / مميز / فعّال**: `نعم` or `لا` (checkboxes also work). Items are available by default.
- An empty value in الإعدادات keeps the built-in default (the shop's phone, WhatsApp, socials and location are already set in `src/lib/types.ts`).
- Keep the **القيمة** column in الإعدادات formatted as *Plain text* (the template already is) so the WhatsApp number isn't lost.

## Admin panel (`/admin`)

The panel edits items (photos, prices, sizes, availability), categories, offers and settings, all saved straight into the sheet. It needs:

1. **A native Google Sheet** — an uploaded `.xlsx` can be read but not written. If the title bar shows `.xlsx`, use *File → Save as Google Sheets* and point `GOOGLE_SHEET_ID` at the new sheet.
2. **A Google service account** — in [Google Cloud Console](https://console.cloud.google.com/): create a project → enable the **Google Sheets API** → *IAM & Admin → Service accounts* → create one → *Keys → Add key → JSON*. Paste the whole JSON file into `GOOGLE_SERVICE_ACCOUNT_KEY`.
3. **Share the sheet** with the service account's email (`…@….iam.gserviceaccount.com`) as **Editor**.
4. **Vercel Blob** for photos — *Vercel project → Storage → Create → Blob* and connect it (adds `BLOB_READ_WRITE_TOKEN`).
5. `ADMIN_EMAIL` and `ADMIN_PASSWORD` — the login. Changing either signs everyone out.

## Deploy on Vercel

1. Import the repo in Vercel.
2. *Settings → Environment Variables* → add `GOOGLE_SHEET_ID` = the sheet URL (or just its id), plus the admin variables above.
3. Deploy, then open `/qr` on the site to print or download the QR code (it points to the production URL).

## Local development

```bash
cp .env.example .env.local   # paste the sheet URL
npm install
npm run dev
```

## Structure

- `src/app/page.tsx` — public menu (server, revalidated every 60s) → `src/components/menu/*` (client: cart, sheets, WhatsApp)
- `src/lib/data.ts` — reads the Google Sheet tabs and turns them into categories, items, offers and settings
- `src/app/admin` — admin panel (`actions.ts` = server actions) · `src/lib/sheets.ts` — Sheets API client · `src/lib/auth.ts` — login session · `src/lib/storage.ts` — photo uploads
- `docs/menu-template.xlsx` — starter sheet to import into Google Sheets
- `src/app/qr` — printable QR code for the menu (`/qr`, downloads at `/qr.png` and `/qr.svg`)
