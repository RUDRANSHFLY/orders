import { OrderStatus } from "@/app/generated/prisma/enums";
import { requireUser } from "@/auth/auth-helper";
import { ValidationError } from "@/lib/api/errors";
import { successResponse } from "@/lib/api/response";
import { withErrorHandling } from "@/lib/api/with-error-handling";
import { formatZodError } from "@/lib/api/zod-error";
import { createOrder, getOrders } from "@/lib/orders/order.service";
import { createOrderSchema } from "@/lib/validations/order.schema";
import { NextRequest } from "next/server";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser();
  const orderStatusParam = request.nextUrl.searchParams.get("order");

  const status: OrderStatus | undefined =
    orderStatusParam &&
    Object.values(OrderStatus).includes(orderStatusParam as OrderStatus)
      ? (orderStatusParam as OrderStatus)
      : undefined;

  const orders = await getOrders({
    userId: user.id,
    ...(status ? { status } : {}),
  });

  return successResponse(orders);
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser();
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new ValidationError("Request body must contain valid JSON.");
  }

  const parsed = createOrderSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(
      "Invalid order data.",
      formatZodError(parsed.error),
    );
  }

  const order = await createOrder({ userId: user.id, data: parsed.data });

  return successResponse(order, 201);
});
