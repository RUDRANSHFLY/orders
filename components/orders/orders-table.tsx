"use client";

import { useRouter } from "next/navigation";

import { StatusBadge } from "@/components/orders/status-badge";
import {
  formatCurrency,
  formatDate,
  getOrderAmounts,
  type Order,
} from "@/components/orders/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function OrdersTable({ orders }: { orders: Order[] }) {
  const router = useRouter();
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table className="min-w-200">
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Order Total</TableHead>
            <TableHead className="text-right">Amount Paid</TableHead>
            <TableHead className="text-right">Amount Due</TableHead>
            <TableHead>Due Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const amounts = getOrderAmounts(order);
            return (
              <TableRow
                key={order.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/orders/${order.id}`)}
              >
                <TableCell className="font-medium">
                  {order.customerName}
                </TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(amounts.orderTotal)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(amounts.amountPaid)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(amounts.amountDue)}
                </TableCell>
                <TableCell>{formatDate(order.dueDate)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
