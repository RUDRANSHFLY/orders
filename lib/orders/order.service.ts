import { OrderStatus } from "@/app/generated/prisma/enums";
import { prisma } from "@/prisma/prisma";
import { CreateOrderInput } from "../validations/order.schema";
import { Prisma } from "@/app/generated/prisma/client";

type GetOrdersParams = {
  userId: string;
  status?: OrderStatus;
};

type CreateOrdersParams = {
  userId: string;
  data: CreateOrderInput;
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
        customerName: customer,
        dueDate,
        userId,
        lineItems: {
          create: data.items.map((item) => ({
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
    return order;
  });
}
