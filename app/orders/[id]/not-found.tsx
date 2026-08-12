import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OrderNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Order not found</h1>
      <p className="text-sm text-muted-foreground">
        This order doesn&apos;t exist or may have been deleted.
      </p>
      <Button render={<Link href="/orders">Back to orders</Link>} />
    </main>
  );
}
