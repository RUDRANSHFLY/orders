import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/orders/status-badge";
import { DeleteOrderButton } from "@/components/orders/delete-order-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/components/orders/types";
import type { OrderDetail } from "@/lib/orders/order-api";

export function OrderDetailView({ order }: { order: OrderDetail }) {
  const total = order.lineItems.reduce(
    (sum, item) => sum + item.quantity * Number(item.unitPrice),
    0,
  );
  const paid = order.payments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0,
  );
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Order</p>
          <h1 className="font-mono text-2xl font-semibold tracking-tight">
            {order.id}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            render={<Link href={`/orders/${order.id}/edit`}>Edit</Link>}
          />
          <DeleteOrderButton id={order.id} />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Info label="Status">
              <StatusBadge status={order.status} />
            </Info>
            <Info label="Due date">{formatDate(order.dueDate)}</Info>
            <Info label="Created">{formatDate(order.createdAt)}</Info>
            <Info label="Updated">{formatDate(order.updatedAt)}</Info>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{order.customer}</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit price</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.lineItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(item.unitPrice))}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.quantity * Number(item.unitPrice))}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-medium">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(total)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Settlement / Audit</CardTitle>
        </CardHeader>
        <CardContent>
          {order.payments.length ? (
            <div className="space-y-3">
              {order.payments.map((payment) => (
                <div
                  className="flex flex-col justify-between gap-1 border-b pb-3 last:border-0 last:pb-0 sm:flex-row"
                  key={payment.id}
                >
                  <span>
                    {formatDate(payment.date)}
                    {payment.note ? ` · ${payment.note}` : ""}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(Number(payment.amount))}
                  </span>
                </div>
              ))}
              <div className="flex justify-between border-t pt-3 font-semibold">
                <span>Paid / outstanding</span>
                <span>
                  {formatCurrency(paid)} /{" "}
                  {formatCurrency(Math.max(total - paid, 0))}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No settlement recorded.
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
function Info({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}
