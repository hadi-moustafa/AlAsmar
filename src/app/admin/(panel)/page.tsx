import Link from "next/link";
import { ActionButton, DeleteButton } from "@/components/admin/ui";
import { EditIcon, PlusIcon } from "@/components/icons";
import { Price } from "@/components/menu/Price";
import { categoryNames, getAdminCategories, getAdminItems, getAdminSettings } from "@/lib/admin-data";
import { deleteItem, toggleItem } from "../actions";
import { currencyOf, SetupNotice } from "./SetupNotice";

export default async function ItemsPage() {
  let data;
  try {
    data = await Promise.all([getAdminCategories(), getAdminItems(), getAdminSettings()]);
  } catch (err) {
    return <SetupNotice error={err} />;
  }
  const [categories, items, settings] = data;
  const currency = currencyOf(settings);
  const icons = Object.fromEntries(categories.map((c) => [c.name, c.icon]));
  const groups = categoryNames(categories, items).map((name) => ({ name, list: items.filter((i) => i.category === name) }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">أصناف القائمة</h1>
          <p className="text-sm text-muted">{items.length} صنف · التعديلات تُحفظ مباشرة في جدول Google</p>
        </div>
        <Link href="/admin/items/new" className="flex shrink-0 items-center gap-1 rounded-full bg-caramel px-4 py-2.5 font-bold text-ink hover:bg-honey">
          <PlusIcon width={18} height={18} /> صنف جديد
        </Link>
      </div>

      {groups.map(({ name, list }) => (
        <section key={name}>
          <h2 className="mb-2 flex items-center gap-2 font-bold">
            <span>{icons[name] ?? "☕"}</span> {name}
            <span className="rounded-full bg-surface-2 px-2 text-xs text-muted">{list.length}</span>
          </h2>
          {list.length === 0 ? (
            <p className="rounded-2xl bg-surface p-4 text-sm text-muted">لا توجد أصناف في هذا القسم.</p>
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-surface ring-1 ring-line">
              {list.map((item) => (
                <li key={item.row} className="flex items-center gap-3 p-2.5">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element -- any host from the sheet
                      <img src={item.image_url} alt="" className="size-full object-cover" loading="lazy" />
                    ) : (
                      <span className="grid h-full place-items-center text-2xl">{icons[name] ?? "☕"}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate font-bold ${item.available ? "" : "text-muted line-through"}`}>
                      {item.featured && "⭐ "}
                      {item.name}
                    </p>
                    <p className="truncate text-sm text-caramel">
                      {item.options.length ? (
                        item.options.map((o, i) => (
                          <span key={o.name}>
                            {i > 0 && " · "}
                            {o.name} <Price amount={o.price} currency={currency} />
                          </span>
                        ))
                      ) : item.price !== null ? (
                        <Price amount={item.price} currency={currency} />
                      ) : (
                        <span className="text-muted">بدون سعر</span>
                      )}
                    </p>
                  </div>
                  <ActionButton
                    action={toggleItem.bind(null, item.row, item.name)}
                    label="تبديل التوفر"
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                      item.available ? "bg-green-500/15 text-green-300" : "bg-surface-2 text-muted"
                    }`}
                  >
                    {item.available ? "متوفر" : "غير متوفر"}
                  </ActionButton>
                  <Link href={`/admin/items/${item.row}`} className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-surface-2" aria-label="تعديل">
                    <EditIcon width={18} height={18} />
                  </Link>
                  <DeleteButton action={deleteItem.bind(null, item.row, item.name)} what={item.name} />
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
