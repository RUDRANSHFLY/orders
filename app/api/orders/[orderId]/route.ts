import { requireUser } from "@/auth/auth-helper";
import { ValidationError } from "@/lib/api/errors";
import { successResponse } from "@/lib/api/response";
import { withErrorHandling } from "@/lib/api/with-error-handling";
import { formatZodError } from "@/lib/api/zod-error";
import {
  deleteOrder,
  getOrderById,
  updateOrder,
} from "@/lib/orders/order.service";
import { updatOrderSchema } from "@/lib/validations/order.schema";
import { NextRequest } from "next/server";

type RouteContext = {
  params: Promise<{
    orderId: string;
  }>;
};

export const GET = withErrorHandling(
  async (request: NextRequest, context: RouteContext) => {
    const user = await requireUser();

    const { orderId } = await context.params;

    const order = await getOrderById({
      userId: user.id,
      orderId,
    });

    return successResponse(order, 200, "Order fetched successfully");
  },
);

export const PATCH = withErrorHandling(
  async (request: NextRequest, context: RouteContext) => {
    const user = await requireUser();

    const { orderId } = await context.params;

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      throw new ValidationError("Request body must contain valid JSON.");
    }

    const parsed = updatOrderSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        "Invalid order data.",
        formatZodError(parsed.error),
      );
    }

    const updatedOrderId = await updateOrder({
      userId: user.id,
      orderId,
      data: parsed.data,
    });

    return successResponse(
      { id: updatedOrderId },
      200,
      "Order updated successfully",
    );
  },
);

export const DELETE = withErrorHandling(
  async (request: NextRequest, context: RouteContext) => {
    const user = await requireUser();
    const { orderId } = await context.params;

    await deleteOrder({
      userId: user.id,
      orderId,
    });

    return successResponse(null, 200, "Order deleted successfully");
  },
);
