import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/components/orders/types";
import { Decimal } from "@prisma/client/runtime/client";
import { RecordPaymentDialog } from "@/components/orders/record-payment-dialog";

export interface PaymentItem {
  id: string;
  amount: number | string | Decimal;
  date: string | Date;
  note?: string | null;
  createdAt: string | Date;
}

interface PaymentsListProps {
  orderId: string;
  payments: PaymentItem[];
  amountDue: number;
  isPaid?: boolean;
}

export function PaymentsList({
  orderId,
  payments,
  amountDue,
  isPaid = false,
}: PaymentsListProps) {
  const totalPaid = payments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0,
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Payments</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            History of settlement payments recorded for this order.
          </p>
        </div>
        <RecordPaymentDialog
          orderId={orderId}
          amountDue={amountDue}
          isPaid={isPaid}
        />
      </CardHeader>
      <CardContent>
        {payments.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Recorded At</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {formatDate(payment.date)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {payment.note || (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDate(payment.createdAt)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(Number(payment.amount))}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t font-semibold">
                  <TableCell colSpan={3} className="text-right">
                    Total Paid
                  </TableCell>
                  <TableCell className="text-right text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(totalPaid)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No payments have been recorded for this order yet.
            </p>
            {!isPaid && amountDue > 0 && (
              <div className="mt-3">
                <RecordPaymentDialog
                  orderId={orderId}
                  amountDue={amountDue}
                  isPaid={isPaid}
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
