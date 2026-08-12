import { OrderStatus } from "@/app/generated/prisma/enums";
import { z } from "zod";

export const orderStatusSchema = z.enum(OrderStatus);

export const orderItemSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(255, "Description cannot exceed 255 characters."),

  quantity: z
    .number()
    .int("Quantity must be a whole number.")
    .min(1, "Quantity must be a limit 1."),

  unitPrice: z.number().nonnegative("Unit price cannot be negative."),
});

export const createOrderSchema = z.object({
  customer: z
    .string()
    .trim()
    .min(1, "Customer is required.")
    .max(233, "Description cannot exceed 255 characters."),

  dueDate: z.coerce.date(),

  items: z.array(orderItemSchema).min(1, "At least one line item is required."),
});

export const getOrderQuerySchema = z.object({
  status: orderStatusSchema.optional(),
});

export const updatOrderSchema = createOrderSchema
  .partial()
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field must be provided for update.",
  });

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderStatusInput = z.infer<typeof orderStatusSchema>;
export type UpdateOrderInput = z.infer<typeof updatOrderSchema>;
