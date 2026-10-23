import { notFound } from "next/navigation";
import { getAdminOffers } from "@/lib/admin-data";
import { SetupNotice } from "../../SetupNotice";
import { OfferForm } from "../OfferForm";

export default async function EditOfferPage({ params }: { params: Promise<{ row: string }> }) {
  const { row } = await params;
  let offers;
  try {
    offers = await getAdminOffers();
  } catch (err) {
    return <SetupNotice error={err} />;
  }
  const offer = offers.find((o) => o.row === Number(row));
  if (!offer) notFound();
  return (
    <div>
      <h1 className="mb-4 font-display text-2xl font-bold">تعديل: {offer.title}</h1>
      <OfferForm key={offer.row} offer={offer} />
    </div>
  );
}
