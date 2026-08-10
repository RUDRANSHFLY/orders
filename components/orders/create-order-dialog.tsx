"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { formatCurrency, formatDate } from "@/components/orders/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const today = new Date();
today.setHours(0, 0, 0, 0);
const schema = z.object({
  customer: z.string().trim().min(1, "Customer name is required."),
  dueDate: z
    .date({ error: "Due date is required." })
    .refine((date) => date >= today, "Due date must be today or later."),
  items: z
    .array(
      z.object({
        description: z.string().trim().min(1, "Description is required."),
        quantity: z.coerce
          .number()
          .int("Quantity must be a whole number.")
          .min(1, "Quantity must be at least 1."),
        unitPrice: z.coerce
          .number()
          .positive("Unit price must be greater than 0."),
      }),
    )
    .min(1),
});
type Values = z.input<typeof schema>;

export function CreateOrderDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      customer: "",
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  const items = useWatch({ control: form.control, name: "items" }) ?? [];
  const dueDate = useWatch({ control: form.control, name: "dueDate" });
  const total = items.reduce(
    (sum, item) =>
      sum + (Number(item?.quantity) || 0) * (Number(item?.unitPrice) || 0),
    0,
  );
  const close = () => {
    form.reset();
    setOpen(false);
  };

  async function submit(values: Values) {
    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          dueDate: values.dueDate!.toISOString(),
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(result?.error?.message ?? "Unable to create order.");
      close();
      onCreated();
      toast.success("Order created successfully.");
    } catch (error) {
      toast.error(
        error instanceof globalThis.Error
          ? error.message
          : "Unable to create order.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus />
        New Order
      </Button>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create order</DialogTitle>
          <DialogDescription>
            Add a customer, due date, and the items to bill for.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-6" onSubmit={form.handleSubmit(submit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer name</Label>
              <Input
                id="customer"
                aria-invalid={!!form.formState.errors.customer}
                {...form.register("customer")}
              />
              <ErrorMessage message={form.formState.errors.customer?.message} />
            </div>
            <div className="space-y-2">
              <Label>Due date</Label>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start font-normal",
                        !dueDate && "text-muted-foreground",
                      )}
                    />
                  }
                >
                  <CalendarIcon />
                  {dueDate ? formatDate(dueDate!) : "Select a date"}
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => {
                      if (date)
                        form.setValue("dueDate", date, {
                          shouldValidate: true,
                        });
                    }}
                    disabled={{ before: today }}
                  />
                </PopoverContent>
              </Popover>
              <ErrorMessage message={form.formState.errors.dueDate?.message} />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Line items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ description: "", quantity: 1, unitPrice: 0 })
                }
              >
                <Plus />
                Add line item
              </Button>
            </div>
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-12 gap-2 rounded-md border p-3"
              >
                <div className="col-span-12 space-y-1 sm:col-span-5">
                  <Label
                    className="text-xs"
                    htmlFor={`description-${field.id}`}
                  >
                    Description
                  </Label>
                  <Input
                    id={`description-${field.id}`}
                    aria-invalid={
                      !!form.formState.errors.items?.[index]?.description
                    }
                    {...form.register(`items.${index}.description`)}
                  />
                  <ErrorMessage
                    message={
                      form.formState.errors.items?.[index]?.description?.message
                    }
                  />
                </div>
                <div className="col-span-5 space-y-1 sm:col-span-2">
                  <Label className="text-xs" htmlFor={`quantity-${field.id}`}>
                    Quantity
                  </Label>
                  <Input
                    id={`quantity-${field.id}`}
                    type="number"
                    min="1"
                    step="1"
                    aria-invalid={
                      !!form.formState.errors.items?.[index]?.quantity
                    }
                    {...form.register(`items.${index}.quantity`)}
                  />
                  <ErrorMessage
                    message={
                      form.formState.errors.items?.[index]?.quantity?.message
                    }
                  />
                </div>
                <div className="col-span-5 space-y-1 sm:col-span-3">
                  <Label className="text-xs" htmlFor={`price-${field.id}`}>
                    Unit price
                  </Label>
                  <Input
                    id={`price-${field.id}`}
                    type="number"
                    min="0.01"
                    step="0.01"
                    aria-invalid={
                      !!form.formState.errors.items?.[index]?.unitPrice
                    }
                    {...form.register(`items.${index}.unitPrice`)}
                  />
                  <ErrorMessage
                    message={
                      form.formState.errors.items?.[index]?.unitPrice?.message
                    }
                  />
                </div>
                <div className="col-span-2 flex items-end justify-end">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                    aria-label="Remove line item"
                  >
                    <Trash2 />
                  </Button>
                </div>
                <p className="col-span-12 text-right text-sm text-muted-foreground">
                  Subtotal:{" "}
                  {formatCurrency(
                    (Number(items[index]?.quantity) || 0) *
                      (Number(items[index]?.unitPrice) || 0),
                  )}
                </p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t pt-4 font-medium">
            <span>Order total</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={close}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <LoaderCircle className="animate-spin" />}Create
              order
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
function ErrorMessage({ message }: { message?: unknown }) {
  return typeof message === "string" ? (
    <p className="text-xs text-destructive">{message}</p>
  ) : null;
}
