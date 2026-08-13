import { OrderStatus, Prisma } from "@/app/generated/prisma/client";

type CalculateOrderStatusParam = {
  total: Prisma.Decimal;
  amountPaid: Prisma.Decimal;
  dueDate: Date;
  now?: Date;
};

export function calculateOrderStatus({
  total,
  amountPaid,
  dueDate,
  now = new Date(),
}: CalculateOrderStatusParam) {
  if (amountPaid.greaterThanOrEqualTo(total)) {
    return OrderStatus.PAID;
  }

  if (dueDate < now) {
    return OrderStatus.OVERDUE;
  }

  if (amountPaid.greaterThan(0)) {
    return OrderStatus.PARTIALLY_PAID;
  }

  return OrderStatus.PENDING;
}
