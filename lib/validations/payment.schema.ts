import { z } from "zod";

export const createPaymentSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),

  date: z.coerce.date(),

  note: z.string().trim().max(500).optional(),

  metaData: z.record(z.string(), z.unknown()).optional(),

  orderId: z.string().cuid("Invalid order id"),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

export const recordPaymentFormSchema = z
  .object({
    amount: z.coerce
      .number()
      .positive("Amount must be greater than 0")
      .or(z.undefined()),

    date: z.coerce.date().or(z.undefined()),

    note: z
      .string()
      .trim()
      .max(500, "Note cannot exceed 500 characters")
      .optional(),
  })
  .refine((data) => data.amount !== undefined, {
    message: "Amount is required",
    path: ["amount"],
  })
  .refine((data) => data.date !== undefined, {
    message: "Payment date is required",
    path: ["date"],
  });

export type RecordPaymentFormInput = z.infer<typeof recordPaymentFormSchema>;
