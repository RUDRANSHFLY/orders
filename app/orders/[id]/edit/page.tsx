import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth/auth";
import { OrdersHeader } from "@/components/orders/orders-header";
import { EditOrderForm } from "@/components/orders/edit-order-form";
import { getOrder } from "@/server/order";

export default async function EditOrderPage({
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
      <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm text-muted-foreground">Editing order</p>
          <h1 className="font-mono text-2xl font-semibold tracking-tight">
            {result.id}
          </h1>
        </div>
        <EditOrderForm order={result} />
      </main>
    </div>
  );
}
