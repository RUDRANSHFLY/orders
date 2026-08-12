"use client";

import { useCallback, useEffect, useState } from "react";
import { CreateOrderDialog } from "@/components/orders/create-order-dialog";
import { OrdersTable } from "@/components/orders/orders-table";
import {
  orderStatuses,
  type Order,
  type OrderStatus,
} from "@/components/orders/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const labels: Record<"ALL" | OrderStatus, string> = {
  ALL: "All",
  PENDING: "Pending",
  PARTIALLY_PAID: "Partially Paid",
  PAID: "Paid",
  OVERDUE: "Overdue",
};

export function OrdersDashboard() {
  const [status, setStatus] = useState<"ALL" | OrderStatus>("ALL");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/orders${status === "ALL" ? "" : `?order=${status}`}`,
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result?.error?.message ?? "Unable to load orders.");
      setOrders(
        Array.isArray(result.data) ? result.data : (result.data?.data ?? []),
      );
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadOrders(), 0);
    return () => window.clearTimeout(timer);
  }, [loadOrders]);

  const filterOptions: Array<"ALL" | OrderStatus> = ["ALL", ...orderStatuses];
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground">
            Track customer orders and outstanding balances.
          </p>
        </div>
        <CreateOrderDialog onCreated={loadOrders} />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Status</span>
        <Select
          value={status}
          onValueChange={(value) => setStatus(value as "ALL" | OrderStatus)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.map((value) => (
              <SelectItem key={value} value={value}>
                {labels[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {loading ? (
        <OrdersSkeleton />
      ) : orders.length ? (
        <OrdersTable orders={orders} />
      ) : (
        <div className="rounded-md border border-dashed py-16 text-center text-sm text-muted-foreground">
          No orders yet — create your first order
        </div>
      )}
    </main>
  );
}
function OrdersSkeleton() {
  return (
    <div className="space-y-3 rounded-md border p-4">
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}
