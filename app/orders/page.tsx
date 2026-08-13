import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth/auth";
import { OrdersHeader } from "@/components/orders/orders-header";
import { OrdersDashboard } from "@/components/orders/orders-dashboard";

export default async function OrdersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <OrdersHeader />
      <OrdersDashboard />
    </div>
  );
}
