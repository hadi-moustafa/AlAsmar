import Link from "next/link";
import { DeleteButton } from "@/components/admin/ui";
import { EditIcon, PlusIcon } from "@/components/icons";
import { Price } from "@/components/menu/Price";
import { getAdminOffers, getAdminSettings } from "@/lib/admin-data";
import { deleteOffer } from "../../actions";
import { currencyOf, SetupNotice } from "../SetupNotice";

export default async function OffersPage() {
  let data;
  try {
    data = await Promise.all([getAdminOffers(), getAdminSettings()]);
  } catch (err) {
    return <SetupNotice error={err} />;
  }
  const [offers, settings] = data;
  const currency = currencyOf(settings);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">العروض</h1>
        <Link href="/admin/offers/new" className="flex shrink-0 items-center gap-1 rounded-full bg-caramel px-4 py-2.5 font-bold text-ink hover:bg-honey">
          <PlusIcon width={18} height={18} /> عرض جديد
        </Link>
      </div>
      {offers.length === 0 ? (
        <p className="rounded-2xl bg-surface p-6 text-center text-muted">لا توجد عروض بعد.</p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-surface ring-1 ring-line">
          {offers.map((o) => (
            <li key={o.row} className="flex items-center gap-3 p-2.5">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                {o.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- any host from the sheet
                  <img src={o.image_url} alt="" className="size-full object-cover" loading="lazy" />
                ) : (
                  <span className="grid h-full place-items-center text-2xl">🎁</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`truncate font-bold ${o.active ? "" : "text-muted line-through"}`}>{o.title}</p>
                <p className="truncate text-sm text-caramel">
                  {o.price !== null && <Price amount={o.price} currency={currency} />}
                  {!o.active && <span className="text-muted"> · غير مفعّل</span>}
                </p>
              </div>
              <Link href={`/admin/offers/${o.row}`} className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-surface-2" aria-label="تعديل">
                <EditIcon width={18} height={18} />
              </Link>
              <DeleteButton action={deleteOffer.bind(null, o.row, o.title)} what={o.title} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
