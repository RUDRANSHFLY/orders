"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";

import { updateOrder, OrderApiError } from "@/lib/orders/order-api";
import type { OrderDetail } from "@/lib/orders/order-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

const lineItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().int().positive("Must be at least 1"),
  unitPrice: z.coerce.number().nonnegative("Must be 0 or more"),
});

const editOrderSchema = z.object({
  customer: z.string().min(1, "Customer name is required"),
  dueDate: z.string().min(1, "Due date is required"),
  lineItems: z.array(lineItemSchema).min(1, "Add at least one line item"),
});

// z.coerce.number() has an input type of `unknown`, which is intentionally
// looser than its output type of `number`. Giving useForm both the input and
// output types keeps react-hook-form + the zod resolver happy end to end.
type EditOrderInput = z.input<typeof editOrderSchema>;
type EditOrderOutput = z.output<typeof editOrderSchema>;

export function EditOrderForm({ order }: { order: OrderDetail }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const form = useForm<EditOrderInput, unknown, EditOrderOutput>({
    resolver: zodResolver(editOrderSchema),
    defaultValues: {
      customer: order.customer,
      dueDate: order.dueDate.toISOString().slice(0, 10), // yyyy-mm-dd for <input type="date">
      lineItems: order.lineItems.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lineItems",
  });

  async function onSubmit(values: EditOrderOutput) {
    setSaving(true);
    try {
      // Map the form's shape to what updateOrder actually expects.
      await updateOrder(order.id, {
        customer: values.customer,
        dueDate: new Date(values.dueDate),
        items: values.lineItems.map(({ description, quantity, unitPrice }) => ({
          description,
          quantity,
          unitPrice,
        })),
      });
      toast.success("Order updated successfully.");
      router.push(`/orders/${order.id}`);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof OrderApiError
          ? error.message
          : "Unable to update order.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Order details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="customer"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Customer name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="dueDate"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Due date</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="date"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Line items</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({ description: "", quantity: 1, unitPrice: 0 })
            }
          >
            <Plus className="size-4" /> Add item
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((fieldItem, index) => (
            <div
              key={fieldItem.id}
              className="grid gap-3 sm:grid-cols-[1fr_100px_140px_40px] sm:items-end"
            >
              <Controller
                control={form.control}
                name={`lineItems.${index}.description`}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    {index === 0 && (
                      <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                    )}
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name={`lineItems.${index}.quantity`}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    {index === 0 && (
                      <FieldLabel htmlFor={field.name}>Qty</FieldLabel>
                    )}
                    <Input
                      {...field}
                      value={field.value as number | string}
                      id={field.name}
                      type="number"
                      min={1}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name={`lineItems.${index}.unitPrice`}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    {index === 0 && (
                      <FieldLabel htmlFor={field.name}>Unit price</FieldLabel>
                    )}
                    <Input
                      {...field}
                      value={field.value as number | string}
                      id={field.name}
                      type="number"
                      min={0}
                      step="0.01"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={fields.length === 1}
                onClick={() => remove(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={saving}
          onClick={() => router.push(`/orders/${order.id}`)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <LoaderCircle className="animate-spin" />} Save changes
        </Button>
      </div>
    </form>
  );
}
