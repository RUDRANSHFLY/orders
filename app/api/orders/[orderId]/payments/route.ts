import { requireUser } from "@/auth/auth-helper";
import { ValidationError } from "@/lib/api/errors";
import { successResponse } from "@/lib/api/response";
import { withErrorHandling } from "@/lib/api/with-error-handling";
import { formatZodError } from "@/lib/api/zod-error";
import { createPayment } from "@/lib/payments/payment.service";
import { createPaymentSchema } from "@/lib/validations";
import { NextRequest } from "next/server";

type RouteContext = {
  params: Promise<{
    orderId: string;
  }>;
};

export const POST = withErrorHandling(
  async (request: NextRequest, context: RouteContext) => {
    const user = await requireUser();

    const { orderId } = await context.params;
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      throw new ValidationError("Request body must contain valid JSON");
    }

    const result = createPaymentSchema.safeParse({
      ...(typeof body === "object" && body !== null ? body : {}),
      orderId,
    });

    if (!result.success) {
      throw new ValidationError(
        "the request contains invalid data",
        formatZodError(result.error),
      );
    }

    const payment = await createPayment({
      data: result.data,
      orderId,
      userId: user.id,
    });

    return successResponse(payment, 201);
  },
);
