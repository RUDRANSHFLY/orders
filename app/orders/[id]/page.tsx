import { notFound } from "next/navigation";
import { OrderDetailView } from "@/components/orders/order-detail";
import { getOrder } from "@/server/order";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const result = await getOrder(id);

  if (!result) {
    notFound();
  }

  return <OrderDetailView order={result} />;
}
