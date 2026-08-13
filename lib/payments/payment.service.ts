import { prisma } from "@/prisma/prisma";
import { CreatePaymentInput } from "../validations";
import { ConflictError, NotFoundError } from "../api/errors";
import { Prisma } from "@/app/generated/prisma/client";
import { calculateOrderStatus } from "../orders/order-status";

type CreatePaymentParams = {
  orderId: string;
  userId: string;
  data: CreatePaymentInput;
};

export async function createPayment({
  data,
  orderId,
  userId,
}: CreatePaymentParams) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: {
        id: orderId,
        userId: userId,
      },
      include: {
        lineItems: true,
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    const total = order.lineItems.reduce(
      (sum, item) =>
        sum.plus(new Prisma.Decimal(item.unitPrice).mul(item.quantity)),
      new Prisma.Decimal(0),
    );

    const amountPaid = order.payments.reduce(
      (sum, payment) => sum.plus(new Prisma.Decimal(payment.amount)),
      new Prisma.Decimal(0),
    );

    const amountDue = total.minus(amountPaid);

    const paymentAmount = new Prisma.Decimal(data.amount);

    if (paymentAmount.greaterThan(amountDue)) {
      throw new ConflictError(
        "OVER_PAYMENT",
        "Payment exceeds the remaining order balance",
        {
          requestedAmount: paymentAmount.toFixed(2),
          orderTotal: total.toFixed(2),
          amountPaid: amountPaid.toFixed(2),
          maximumAllowed: amountDue.toFixed(2),
        },
      );
    }

    const payment = await tx.payment.create({
      data: {
        amount: paymentAmount,
        date: data.date,
        orderId,
        note: data.note,
      },
      select: {
        id: true,
      },
    });

    const { dueDate, status: oldStatus } = order;
    const newAmountPaid = amountPaid.plus(paymentAmount);
    const newAmountDue = total.minus(newAmountPaid);

    const updatedOrderStatus = calculateOrderStatus({
      total,
      amountPaid: newAmountPaid,
      dueDate,
    });

    await tx.order.update({
      where: {
        id: orderId,
        userId: userId,
      },
      data: {
        status: updatedOrderStatus,
      },
      select: {
        id: true,
      },
    });

    await tx.auditLog.createMany({
      data: [
        {
          action: "PAYMENT_RECORDED",
          entity: "payment",
          entityId: payment.id,
          userId,
        },
        {
          action: "STATUS_CHANGED",
          entity: "order",
          entityId: order.id,
          before: {
            status: oldStatus,
          },
          after: {
            status: updatedOrderStatus,
          },
          userId,
        },
      ],
    });

    return {
      payment,
      order: {
        id: order.id,
        total: total.toFixed(2),
        amountPaid: newAmountPaid.toFixed(2),
        amountDue: newAmountDue.toFixed(2),
        status: updatedOrderStatus,
      },
    };
  });
}
