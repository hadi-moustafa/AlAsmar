import { categoryNames, getAdminCategories, getAdminItems } from "@/lib/admin-data";
import { SetupNotice } from "../../SetupNotice";
import { ItemForm } from "../ItemForm";

export default async function NewItemPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  let data;
  try {
    data = await Promise.all([getAdminCategories(), getAdminItems()]);
  } catch (err) {
    return <SetupNotice error={err} />;
  }
  const { category } = await searchParams;
  return (
    <div>
      <h1 className="mb-4 font-display text-2xl font-bold">صنف جديد</h1>
      <ItemForm categories={categoryNames(...data)} defaultCategory={category} />
    </div>
  );
}
