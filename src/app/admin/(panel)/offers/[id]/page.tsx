import { notFound } from "next/navigation";
import { getOffer } from "@/lib/data";
import { OfferForm } from "../OfferForm";

export default async function EditOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const offer = await getOffer(Number(id) || 0);
  if (!offer) notFound();
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 font-display text-2xl">تعديل: {offer.title}</h1>
      <OfferForm offer={offer} />
    </div>
  );
}
