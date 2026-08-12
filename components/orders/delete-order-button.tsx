"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteOrder, OrderApiError } from "@/lib/orders/order-api";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeleteOrderButton({ id }: { id: string }) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  async function confirmDelete() {
    setDeleting(true);
    try {
      await deleteOrder(id);
      toast.success("Order deleted successfully.");
      router.push("/orders");
    } catch (error) {
      toast.error(
        error instanceof OrderApiError
          ? error.message
          : "Unable to delete order.",
      );
    } finally {
      setDeleting(false);
    }
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button variant="destructive" disabled={deleting} />}
      >
        <Trash2 /> Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this order?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The order and its line items will be
            permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={confirmDelete}
            disabled={deleting}
          >
            {deleting && <LoaderCircle className="animate-spin" />} Delete order
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
