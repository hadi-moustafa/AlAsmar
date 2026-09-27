import { getCategories, getItems } from "@/lib/data";
import { CategoryForm } from "./CategoryForm";

export default async function CategoriesPage() {
  const [categories, items] = await Promise.all([getCategories(), getItems()]);
  const nextOrder = categories.length ? Math.max(...categories.map((c) => c.sort_order)) + 1 : 0;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">الأقسام</h1>
        <p className="text-sm text-mocha/70">نظّم القائمة في أقسام تظهر كأزرار في أعلى الصفحة.</p>
      </div>

      <section className="rounded-2xl bg-foam p-4 ring-2 ring-caramel/40">
        <h2 className="mb-3 font-bold">➕ قسم جديد</h2>
        <CategoryForm nextOrder={nextOrder} />
      </section>

      <ul className="space-y-3">
        {categories.map((c) => (
          <li key={c.id} className="rounded-2xl bg-foam p-4 ring-1 ring-latte/60">
            <CategoryForm category={c} itemCount={items.filter((i) => i.category_id === c.id).length} />
          </li>
        ))}
      </ul>
    </div>
  );
}
