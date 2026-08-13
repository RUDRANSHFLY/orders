import type { z } from "zod";
import type {
  createOrderSchema,
  orderItemSchema,
  orderStatusSchema,
  updatOrderSchema,
} from "@/lib/validations/order.schema";
import { Decimal } from "@prisma/client/runtime/client";

type OrderItemInput = z.infer<typeof orderItemSchema>;

export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type UpdateOrderData = z.infer<typeof updatOrderSchema>;

export type OrderDetail = {
  id: string;
  customer: string;
  dueDate: Date;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  lineItems: Array<
    Omit<OrderItemInput, "unitPrice"> & {
      id: string;
      unitPrice: number | string | Decimal;
      createdAt: string | Date;
    }
  >;
  payments: Array<{
    id: string;
    amount: number | string | Decimal;
    date: string | Date;
    note: string | null;
    createdAt: string | Date;
  }>;
  logs?: any[];
};

type ApiErrorPayload = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

export class OrderApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "OrderApiError";
  }
}

function getErrorPayload(value: unknown): ApiErrorPayload {
  return typeof value === "object" && value !== null
    ? (value as ApiErrorPayload)
    : {};
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const error = getErrorPayload(payload).error;
    throw new OrderApiError(
      error?.message ?? "Unable to complete the order request.",
      response.status,
      error?.code,
      error?.details,
    );
  }

  if (typeof payload !== "object" || payload === null || !("data" in payload)) {
    throw new OrderApiError("The order API returned an invalid response.", 500);
  }

  return payload.data as T;
}

export function updateOrder(id: string, data: UpdateOrderData) {
  return request<{ id: string }>(`/api/orders/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function deleteOrder(id: string) {
  return request<null>(`/api/orders/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export type CreateOrderData = z.infer<typeof createOrderSchema>;

export type RecordPaymentData = {
  amount: number;
  date: Date | string;
  note?: string;
};

export type RecordPaymentResponse = {
  payment: {
    id: string;
    amount: string;
    date: string;
    note: string | null;
    orderId: string;
    createdAt: string;
  };
  order: {
    id: string;
    total: string;
    amountPaid: string;
    amountDue: string;
    status: OrderStatus;
  };
};

export function recordPayment(orderId: string, data: RecordPaymentData) {
  return request<RecordPaymentResponse>(
    `/api/orders/${encodeURIComponent(orderId)}/payments`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(data.amount),
        date: data.date instanceof Date ? data.date.toISOString() : data.date,
        note: data.note,
      }),
    },
  );
}
