import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth/auth";
import { OrdersHeader } from "@/components/orders/orders-header";
import { OrderDetailView } from "@/components/orders/order-detail";
import { getOrder } from "@/server/order";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/signin");
  }

  const { id } = await params;

  const result = await getOrder(id);

  if (!result) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <OrdersHeader />
      <OrderDetailView order={result} />
    </div>
  );
}
