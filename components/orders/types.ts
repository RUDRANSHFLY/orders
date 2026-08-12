export const orderStatuses = [
  "PENDING",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export type Order = {
  id: string;
  customer: string;
  dueDate: string;
  status: OrderStatus;
  createdAt: string;
  lineItems: Array<{ quantity: number; unitPrice: number | string }>;
  payments: Array<{ amount: number | string }>;
};

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function getOrderAmounts(order: Order) {
  const orderTotal = order.lineItems.reduce(
    (total, item) => total + item.quantity * Number(item.unitPrice),
    0,
  );
  const amountPaid = order.payments.reduce(
    (total, payment) => total + Number(payment.amount),
    0,
  );

  return {
    orderTotal,
    amountPaid,
    amountDue: Math.max(orderTotal - amountPaid, 0),
  };
}
