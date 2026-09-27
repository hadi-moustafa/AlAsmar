import Image from "next/image";
import Link from "next/link";
import { ActionButton, DeleteButton } from "@/components/admin/ui";
import { EditIcon, PlusIcon } from "@/components/icons";
import { getCategories, getItems, getSettings } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { deleteItem, toggleItemAvailability } from "../actions";

export default async function ItemsPage() {
  const [categories, items, settings] = await Promise.all([getCategories(), getItems(), getSettings()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl">أصناف القائمة</h1>
          <p className="text-sm text-mocha/70">{items.length} صنف في {categories.length} أقسام</p>
        </div>
        {categories.length > 0 && (
          <Link href="/admin/items/new" className="flex items-center gap-1 rounded-full bg-caramel px-4 py-2.5 font-bold text-espresso shadow-md hover:bg-honey">
            <PlusIcon width={18} height={18} /> صنف جديد
          </Link>
        )}
      </div>

      {!settings.whatsapp_number && (
        <Link href="/admin/settings" className="block rounded-2xl bg-amber-100 p-4 text-sm font-semibold text-amber-900 ring-1 ring-amber-300">
          ⚠️ لم تقم بإضافة رقم واتساب لاستقبال الطلبات بعد — اضغط هنا لإضافته.
        </Link>
      )}

      {categories.length === 0 && (
        <div className="rounded-2xl bg-foam p-6 text-center">
          <p className="mb-3">ابدأ بإضافة قسم (مثلاً: قهوة ساخنة، كريب حلو)</p>
          <Link href="/admin/categories" className="rounded-full bg-espresso px-4 py-2 font-bold text-crema">إضافة قسم</Link>
        </div>
      )}

      {categories.map((c) => {
        const list = items.filter((i) => i.category_id === c.id);
        return (
          <section key={c.id}>
            <h2 className="mb-2 flex items-center gap-2 font-bold">
              <span>{c.icon}</span> {c.name}
              <span className="rounded-full bg-latte px-2 text-xs">{list.length}</span>
            </h2>
            {list.length === 0 ? (
              <p className="rounded-2xl bg-foam p-4 text-sm text-mocha/60">لا توجد أصناف في هذا القسم.</p>
            ) : (
              <ul className="divide-y divide-latte overflow-hidden rounded-2xl bg-foam ring-1 ring-latte/60">
                {list.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 p-2.5">
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-latte">
                      {item.image_url ? (
                        <Image src={item.image_url} alt="" fill sizes="56px" className="object-cover" />
                      ) : (
                        <span className="grid h-full place-items-center text-2xl">{c.icon}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate font-bold ${item.is_available ? "" : "text-mocha/50 line-through"}`}>
                        {item.is_featured && "⭐ "}
                        {item.name}
                      </p>
                      <p className="text-sm tabular-nums text-caramel-dark">
                        {item.options.length ? (
                          item.options.map((o, i) => (
                            <span key={o.name}>
                              {i > 0 && " · "}
                              {o.name} <bdi>{formatPrice(o.price, settings.currency)}</bdi>
                            </span>
                          ))
                        ) : (
                          <bdi>{formatPrice(item.price, settings.currency)}</bdi>
                        )}
                      </p>
                    </div>
                    <ActionButton
                      action={toggleItemAvailability.bind(null, item.id)}
                      label="تبديل التوفر"
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                        item.is_available ? "bg-green-100 text-green-800" : "bg-latte text-mocha"
                      }`}
                    >
                      {item.is_available ? "متوفر" : "غير متوفر"}
                    </ActionButton>
                    <Link href={`/admin/items/${item.id}`} className="grid size-9 place-items-center rounded-full hover:bg-latte" aria-label="تعديل">
                      <EditIcon width={18} height={18} />
                    </Link>
                    <DeleteButton action={deleteItem.bind(null, item.id)} what={item.name} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
