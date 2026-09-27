import { redirect } from "next/navigation";
import { getCategories } from "@/lib/data";
import { ItemForm } from "../ItemForm";

export default async function NewItemPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const [categories, { category }] = await Promise.all([getCategories(), searchParams]);
  if (categories.length === 0) redirect("/admin/categories");
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 font-display text-2xl">صنف جديد</h1>
      <ItemForm categories={categories} defaultCategory={Number(category) || undefined} />
    </div>
  );
}
