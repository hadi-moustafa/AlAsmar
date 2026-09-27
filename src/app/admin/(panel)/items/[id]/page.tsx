import { notFound } from "next/navigation";
import { getCategories, getItem } from "@/lib/data";
import { ItemForm } from "../ItemForm";

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [item, categories] = await Promise.all([getItem(Number(id) || 0), getCategories()]);
  if (!item) notFound();
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 font-display text-2xl">تعديل: {item.name}</h1>
      <ItemForm item={item} categories={categories} />
    </div>
  );
}
