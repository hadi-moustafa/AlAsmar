import { notFound } from "next/navigation";
import { categoryNames, getAdminCategories, getAdminItems } from "@/lib/admin-data";
import { SetupNotice } from "../../SetupNotice";
import { ItemForm } from "../ItemForm";

export default async function EditItemPage({ params }: { params: Promise<{ row: string }> }) {
  const { row } = await params;
  let data;
  try {
    data = await Promise.all([getAdminCategories(), getAdminItems()]);
  } catch (err) {
    return <SetupNotice error={err} />;
  }
  const item = data[1].find((i) => i.row === Number(row));
  if (!item) notFound();
  return (
    <div>
      <h1 className="mb-4 font-display text-2xl font-bold">تعديل: {item.name}</h1>
      <ItemForm key={item.row} item={item} categories={categoryNames(...data)} />
    </div>
  );
}
