"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  AlertCircle,
  Eye,
  EyeOff,
  LoaderCircle,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { signUp } from "@/auth/auth-client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type Values = z.infer<typeof schema>;

export function SignUpForm() {
  const router = useRouter(),
    [visible, setVisible] = useState(false),
    [message, setMessage] = useState<string>();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });
  async function submit(v: Values) {
    setMessage(undefined);
    const { error } = await signUp.email(v);
    if (error)
      return setMessage(error.message || "We couldn�t create your account.");
    toast.success("Account created");
    router.replace("/orders");
  }
  const e = form.formState.errors;
  return (
    <Card className="border-white/50 bg-card/90 py-7 shadow-2xl shadow-foreground/5 backdrop-blur">
      <CardHeader className="px-7">
        <CardTitle className="text-2xl tracking-tight">
          Create your account
        </CardTitle>
        <CardDescription>
          Start with your name, email, and a secure password.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-7 pt-2">
        <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
          {message && (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertTitle>Unable to sign up</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          <Field label="Name" icon={<User />} error={e.name?.message}>
            <Input
              autoComplete="name"
              placeholder="Alex Morgan"
              {...form.register("name")}
            />
          </Field>
          <Field label="Email" icon={<Mail />} error={e.email?.message}>
            <Input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...form.register("email")}
            />
          </Field>
          <Field label="Password" icon={<Lock />} error={e.password?.message}>
            <div className="relative">
              <Input
                type={visible ? "text" : "password"}
                autoComplete="new-password"
                className="pr-10"
                {...form.register("password")}
              />
              <button
                type="button"
                onClick={() => setVisible(!visible)}
                className="absolute inset-y-0 right-0 w-10 text-muted-foreground"
              >
                {visible ? (
                  <EyeOff className="mx-auto size-4" />
                ) : (
                  <Eye className="mx-auto size-4" />
                )}
              </button>
            </div>
          </Field>
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && (
              <LoaderCircle className="animate-spin" />
            )}
            {form.formState.isSubmitting
              ? "Creating account..."
              : "Create account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center px-7 pt-2 text-sm text-muted-foreground">
        Already have an account?
        <Link
          className="ml-1 font-medium text-foreground underline-offset-4 hover:underline"
          href="/signin"
        >
          Sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
function Field({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        {icon}
        {label}
      </Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
