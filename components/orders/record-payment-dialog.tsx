"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { Banknote, CalendarIcon, LoaderCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/components/orders/types";
import { recordPayment, OrderApiError } from "@/lib/orders/order-api";
import { recordPaymentFormSchema } from "@/lib/validations/payment.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface RecordPaymentDialogProps {
  orderId: string;
  amountDue: number;
  isPaid?: boolean;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

type RecordPaymentInput = z.input<typeof recordPaymentFormSchema>;
type RecordPaymentOutput = z.output<typeof recordPaymentFormSchema>;

export function RecordPaymentDialog({
  orderId,
  amountDue,
  isPaid = false,
  onSuccess,
  trigger,
}: RecordPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<RecordPaymentInput, unknown, RecordPaymentOutput>({
    resolver: zodResolver(recordPaymentFormSchema),
    defaultValues: {
      amount: undefined,
      date: undefined,
      note: "",
    },
  });

  const closeDialog = () => {
    form.reset({
      amount: undefined,
      date: undefined,
      note: "",
    });
    setOpen(false);
  };

  async function onSubmit(values: RecordPaymentOutput) {
    // Validate required fields
    if (!values.amount) {
      form.setError("amount", {
        type: "manual",
        message: "Amount is required",
      });
      return;
    }
    if (!values.date) {
      form.setError("date", {
        type: "manual",
        message: "Payment date is required",
      });
      return;
    }

    setSubmitting(true);
    try {
      await recordPayment(orderId, {
        amount: values.amount,
        date: values.date,
        note: values.note,
      });

      toast.success("Payment recorded successfully.");
      closeDialog();
      if (onSuccess) {
        onSuccess();
      }
      router.refresh();
    } catch (error) {
      if (error instanceof OrderApiError) {
        if (
          error.status === 409 ||
          error.code === "OVER_PAYMENT" ||
          error.code === "OVERPAYMENT"
        ) {
          const details = error.details as
            { maximumAllowed?: string } | undefined;
          const max = details?.maximumAllowed
            ? formatCurrency(Number(details.maximumAllowed))
            : null;
          const inlineError = max
            ? `${error.message} Maximum allowed is ${max}.`
            : error.message;

          form.setError("amount", {
            type: "manual",
            message: inlineError,
          });
          toast.error(inlineError);
          return;
        }
        toast.error(error.message);
      } else {
        toast.error("Unable to record payment.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const defaultTrigger = (
    <Button disabled={isPaid || amountDue <= 0}>
      <Banknote className="mr-2 size-4" />
      {isPaid || amountDue <= 0 ? "Paid in full" : "Record Payment"}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={trigger ? (trigger as React.ReactElement) : defaultTrigger}
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Enter payment details for this order. Remaining balance:{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency(amountDue)}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Amount Field */}
          <Controller
            control={form.control}
            name="amount"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="amount">Amount ($)</FieldLabel>
                  <span className="text-xs text-muted-foreground">
                    Remaining balance: {formatCurrency(amountDue)}
                  </span>
                </div>
                <Input
                  {...field}
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={(field.value as number | string | undefined) ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    field.onChange(val === "" ? undefined : Number(val));
                  }}
                  aria-invalid={fieldState.invalid}
                  disabled={submitting}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Payment Date Field */}
          <Controller
            control={form.control}
            name="date"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="payment-date">Payment Date</FieldLabel>

                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        id="payment-date"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                        disabled={submitting}
                      />
                    }
                  >
                    <CalendarIcon className="mr-2 size-4" />

                    {field.value
                      ? formatDate(new Date(field.value as Date | string))
                      : "Select payment date"}
                  </PopoverTrigger>

                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        field.value
                          ? new Date(field.value as Date | string)
                          : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          field.onChange(date);
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Note Field */}
          <Controller
            control={form.control}
            name="note"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="note">Note (Optional)</FieldLabel>
                <Textarea
                  {...field}
                  id="note"
                  placeholder="e.g. Bank transfer, Check #104..."
                  rows={3}
                  value={(field.value as string | undefined) ?? ""}
                  aria-invalid={fieldState.invalid}
                  disabled={submitting}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeDialog}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || isPaid}>
              {submitting && (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              )}
              Record Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
