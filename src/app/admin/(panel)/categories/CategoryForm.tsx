"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { DeleteButton, FormMessage, inputCls, SubmitButton } from "@/components/admin/ui";
import type { AdminCategory } from "@/lib/admin-data";
import { deleteCategory, saveCategory } from "../../actions";

const EMOJIS = ["☕", "🧋", "🥤", "🍵", "🧃", "🍹", "🥞", "🧇", "🍫", "🍓", "🧀", "🥪", "🍰", "🍦", "🥐", "🍪"];

export function CategoryForm({ category, itemCount = 0 }: { category?: AdminCategory; itemCount?: number }) {
  const [state, action] = useActionState(saveCategory, undefined);
  const [icon, setIcon] = useState(category?.icon || "☕");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Clear the "new category" form after a successful add.
    if (state?.ok && !category) {
      formRef.current?.reset();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset picker with the form
      setIcon("☕");
    }
  }, [state, category]);

  return (
    <form ref={formRef} action={action} className="space-y-3">
      {category && <input type="hidden" name="row" value={category.row} />}
      {category && <input type="hidden" name="expected" value={category.name} />}
      <input type="hidden" name="icon" value={icon} />
      <div className="flex gap-2">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-surface-2 text-2xl ring-1 ring-line">{icon}</span>
        <input name="name" required defaultValue={category?.name} placeholder="اسم القسم" className={inputCls} />
      </div>
      <div className="no-scrollbar flex gap-1 overflow-x-auto">
        {EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => setIcon(e)}
            className={`grid size-9 shrink-0 place-items-center rounded-lg text-lg ${icon === e ? "bg-caramel/30 ring-2 ring-caramel" : "hover:bg-surface-2"}`}
          >
            {e}
          </button>
        ))}
      </div>
      <FormMessage state={state} />
      <div className="flex items-center gap-2">
        <SubmitButton className="h-10 text-sm">{category ? "حفظ" : "إضافة القسم"}</SubmitButton>
        {category && (
          <>
            <Link href={`/admin/items/new?category=${encodeURIComponent(category.name)}`} className="rounded-full px-3 py-2 text-sm font-bold ring-1 ring-line">
              + صنف
            </Link>
            <span className="flex-1 text-xs text-muted">{itemCount} صنف</span>
            <DeleteButton
              action={deleteCategory.bind(null, category.row, category.name)}
              what={category.name}
              extra={itemCount ? ` أصنافه (${itemCount}) ستبقى في القائمة.` : ""}
            />
          </>
        )}
      </div>
    </form>
  );
}
