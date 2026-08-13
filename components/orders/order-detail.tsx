import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/orders/status-badge";
import { DeleteOrderButton } from "@/components/orders/delete-order-button";
import { RecordPaymentDialog } from "@/components/orders/record-payment-dialog";
import { PaymentsList } from "@/components/orders/payments-list";
import { OrderAuditTimeline } from "@/components/orders/order-audit-timeline";
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
  const amountDue = Math.max(total - paid, 0);
  const isPaid = order.status === "PAID" || amountDue <= 0;

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Order</p>
          <h1 className="font-mono text-2xl font-semibold tracking-tight">
            {order.id}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RecordPaymentDialog
            orderId={order.id}
            amountDue={amountDue}
            isPaid={isPaid}
          />
          <Button
            variant="outline"
            render={<Link href={`/orders/${order.id}/edit`}>Edit</Link>}
          />
          <DeleteOrderButton id={order.id} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Info label="Status">
              <StatusBadge status={order.status} />
            </Info>
            <Info label="Total">{formatCurrency(total)}</Info>
            <Info label="Amount Paid">
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {formatCurrency(paid)}
              </span>
            </Info>
            <Info label="Amount Due">
              <span
                className={`font-semibold ${
                  amountDue > 0
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-muted-foreground"
                }`}
              >
                {formatCurrency(amountDue)}
              </span>
            </Info>
            <Info label="Due date">{formatDate(order.dueDate)}</Info>
            <Info label="Created">{formatDate(order.createdAt)}</Info>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium text-lg">{order.customer}</p>
            <div className="text-xs text-muted-foreground">
              Last updated: {formatDate(order.updatedAt)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line Items Card */}
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
                    <TableCell className="text-right font-medium">
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

      {/* Payments History Table */}
      <PaymentsList
        orderId={order.id}
        payments={order.payments}
        amountDue={amountDue}
        isPaid={isPaid}
      />

      {/* Audit Logs Section */}
      {order.logs && order.logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Audit History</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderAuditTimeline logs={order.logs} />
          </CardContent>
        </Card>
      )}
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
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm">{children}</div>
    </div>
  );
}
