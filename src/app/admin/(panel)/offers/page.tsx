import Image from "next/image";
import Link from "next/link";
import { ActionButton, DeleteButton } from "@/components/admin/ui";
import { EditIcon, PlusIcon } from "@/components/icons";
import { getOffers, getSettings } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { deleteOffer, toggleOffer } from "../../actions";

export default async function OffersPage() {
  const [offers, settings] = await Promise.all([getOffers(), getSettings()]);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl">العروض الخاصة</h1>
          <p className="text-sm text-mocha/70">تظهر العروض المفعّلة في أعلى القائمة.</p>
        </div>
        <Link href="/admin/offers/new" className="flex items-center gap-1 rounded-full bg-caramel px-4 py-2.5 font-bold text-espresso shadow-md hover:bg-honey">
          <PlusIcon width={18} height={18} /> عرض جديد
        </Link>
      </div>

      {offers.length === 0 ? (
        <p className="rounded-2xl bg-foam p-6 text-center text-mocha/70">لا توجد عروض بعد.</p>
      ) : (
        <ul className="divide-y divide-latte overflow-hidden rounded-2xl bg-foam ring-1 ring-latte/60">
          {offers.map((o) => (
            <li key={o.id} className="flex items-center gap-3 p-2.5">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-caramel to-mocha">
                {o.image_url ? (
                  <Image src={o.image_url} alt="" fill sizes="56px" className="object-cover" />
                ) : (
                  <span className="grid h-full place-items-center text-2xl">🎁</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{o.title}</p>
                <p className="text-sm tabular-nums">
                  <span className="text-caramel-dark">{formatPrice(o.price, settings.currency)}</span>
                  {o.old_price && <span className="ms-2 text-mocha/50 line-through">{formatPrice(o.old_price, settings.currency)}</span>}
                </p>
              </div>
              <ActionButton
                action={toggleOffer.bind(null, o.id)}
                label="تفعيل/إيقاف"
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${o.is_active ? "bg-green-100 text-green-800" : "bg-latte text-mocha"}`}
              >
                {o.is_active ? "مفعّل" : "متوقف"}
              </ActionButton>
              <Link href={`/admin/offers/${o.id}`} className="grid size-9 place-items-center rounded-full hover:bg-latte" aria-label="تعديل">
                <EditIcon width={18} height={18} />
              </Link>
              <DeleteButton action={deleteOffer.bind(null, o.id)} what={o.title} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
