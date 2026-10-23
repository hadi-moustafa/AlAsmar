import { getAdminCategories, getAdminItems } from "@/lib/admin-data";
import { SetupNotice } from "../SetupNotice";
import { CategoryForm } from "./CategoryForm";

export default async function CategoriesPage() {
  let data;
  try {
    data = await Promise.all([getAdminCategories(), getAdminItems()]);
  } catch (err) {
    return <SetupNotice error={err} />;
  }
  const [categories, items] = data;
  const known = new Set(categories.map((c) => c.name));
  const orphans = [...new Set(items.map((i) => i.category).filter((c) => !known.has(c)))];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">الأقسام</h1>
        <p className="text-sm text-muted">تغيير اسم القسم ينقل أصنافه معه</p>
      </div>
      <div className="rounded-2xl bg-surface p-4 ring-1 ring-line">
        <h2 className="mb-3 font-bold">قسم جديد</h2>
        <CategoryForm />
      </div>
      {categories.map((c) => (
        <div key={c.row} className="rounded-2xl bg-surface p-4 ring-1 ring-line">
          <CategoryForm key={`${c.row}:${c.name}:${c.icon}`} category={c} itemCount={items.filter((i) => i.category === c.name).length} />
        </div>
      ))}
      {orphans.length > 0 && (
        <p className="rounded-2xl bg-surface p-4 text-sm text-muted ring-1 ring-line">
          أقسام مستخدمة في الأصناف بدون أيقونة: {orphans.join("، ")}. أضفها أعلاه بنفس الاسم لاختيار أيقونة لها.
        </p>
      )}
    </div>
  );
}
