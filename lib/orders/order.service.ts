import { OrderStatus } from "@/app/generated/prisma/enums";
import { prisma } from "@/prisma/prisma";
import {
  CreateOrderInput,
  UpdateOrderInput,
} from "../validations/order.schema";
import { Prisma } from "@/app/generated/prisma/client";
import { ConflictError, NotFoundError } from "../api/errors";

type GetOrdersParams = {
  userId: string;
  status?: OrderStatus;
};

type CreateOrdersParams = {
  userId: string;
  data: CreateOrderInput;
};

type GetOrderByIdParams = {
  userId: string;
  orderId: string;
};

type UpdateOrderParams = {
  userId: string;
  orderId: string;
  data: UpdateOrderInput;
};

type DeleteOrderParams = {
  userId: string;
  orderId: string;
};

export async function getOrders({ userId, status }: GetOrdersParams) {
  const orders = await prisma.order.findMany({
    where: {
      userId,
      ...(status ? { status } : {}),
    },
    include: {
      lineItems: true,
      payments: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return orders;
}

export async function createOrder({ data, userId }: CreateOrdersParams) {
  const { customer, dueDate, items } = data;
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        customer,
        dueDate,
        userId,
        lineItems: {
          create: items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.unitPrice),
          })),
        },
      },
      include: {
        lineItems: true,
      },
    });

    await tx.auditLog.create({
      data: {
        action: "ORDER_CREATED",
        entity: "order",
        entityId: order.id,
        after: JSON.stringify(order),
        userId,
      },
    });

    return { id: order.id };
  });
}

export async function getOrderById({ orderId, userId }: GetOrderByIdParams) {
  const [order, auditLogs] = await prisma.$transaction([
    prisma.order.findUnique({
      where: {
        userId_id: {
          id: orderId,
          userId: userId,
        },
      },
      include: {
        lineItems: true,
        payments: true,
      },
    }),
    prisma.auditLog.findMany({
      where: {
        entityId: orderId,
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
      },
    }),
  ]);

  if (!order) {
    throw new NotFoundError(`Order with id ${orderId} not found`);
  }

  return { ...order, logs: auditLogs };
}

export async function updateOrder({
  data,
  orderId,
  userId,
}: UpdateOrderParams) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: {
        userId_id: {
          id: orderId,
          userId: userId,
        },
      },
      include: {
        lineItems: true,
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundError(`Order with id ${orderId} not found`);
    }

    const previousOrder = JSON.stringify(order);
    const hasPayments = order.payments.length > 0;

    if (hasPayments) {
      throw new ConflictError(
        "ORDER_NOT_EDITABLE",
        "This order cannot be modified because a payment has already been recorded.",
      );
    }
    const updatedOrder = await tx.order.update({
      where: {
        userId_id: {
          id: orderId,
          userId: userId,
        },
      },
      data: {
        customer: data.customer,
        dueDate: data.dueDate,
        ...(data.items && {
          lineItems: {
            deleteMany: {},
            create: data.items.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        }),
      },
      select: {
        id: true,
      },
    });

    await tx.auditLog.create({
      data: {
        action: "ORDER_UPDATED",
        entity: "order",
        entityId: updatedOrder.id,
        after: JSON.stringify(updatedOrder),
        before: previousOrder,
        userId,
      },
    });

    return updatedOrder.id;
  });
}

export async function deleteOrder({ orderId, userId }: DeleteOrderParams) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: {
        userId_id: {
          id: orderId,
          userId: userId,
        },
      },
      select: {
        id: true,
        _count: {
          select: {
            payments: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundError(`Order with id ${orderId} not found`);
    }

    const hasPayments = order._count.payments > 0;

    if (hasPayments) {
      throw new ConflictError(
        "ORDER_NOT_DELETABLE",
        "This order cannot be deleted because a payment has already been recorded.",
      );
    }

    await tx.order.delete({
      where: {
        userId_id: {
          id: orderId,
          userId: userId,
        },
      },
    });
  });
}
