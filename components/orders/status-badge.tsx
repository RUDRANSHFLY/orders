import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/components/orders/types";

const styles: Record<
  OrderStatus,
  { label: string; className?: string; variant?: "secondary" | "destructive" }
> = {
  PENDING: { label: "Pending", variant: "secondary" },
  PARTIALLY_PAID: {
    label: "Partially paid",
    className:
      "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300",
  },
  PAID: {
    label: "Paid",
    className:
      "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300",
  },
  OVERDUE: { label: "Overdue", variant: "destructive" },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const style = styles[status];
  return (
    <Badge variant={style.variant} className={style.className}>
      {style.label}
    </Badge>
  );
}
