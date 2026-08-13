"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  AlertCircle,
  Eye,
  EyeOff,
  LoaderCircle,
  Lock,
  Mail,
} from "lucide-react";
import { signIn } from "@/auth/auth-client";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
const schema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  rememberMe: z.boolean(),
});
type Values = z.infer<typeof schema>;
export function SignInForm() {
  const router = useRouter(),
    [visible, setVisible] = useState(false),
    [message, setMessage] = useState<string>();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", rememberMe: true },
  });
  async function submit(v: Values) {
    setMessage(undefined);
    const { error } = await signIn.email(v);
    if (error) return setMessage(error.message || "Invalid email or password.");
    router.replace("/orders");
  }
  const e = form.formState.errors;
  return (
    <Card className="border-white/50 bg-card/90 py-7 shadow-2xl shadow-foreground/5 backdrop-blur">
      <CardHeader className="px-7">
        <CardTitle className="text-2xl tracking-tight">Welcome back</CardTitle>
        <CardDescription>Sign in to continue to your account.</CardDescription>
      </CardHeader>
      <CardContent className="px-7 pt-2">
        <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
          {message && (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertTitle>Unable to sign in</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label className="flex gap-2">
              <Mail />
              Email
            </Label>
            <Input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...form.register("email")}
            />
            {e.email && (
              <p className="text-sm text-destructive">{e.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="flex gap-2">
              <Lock />
              Password
            </Label>
            <div className="relative">
              <Input
                type={visible ? "text" : "password"}
                autoComplete="current-password"
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
            {e.password && (
              <p className="text-sm text-destructive">{e.password.message}</p>
            )}
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <Checkbox
              checked={form.watch("rememberMe")}
              onCheckedChange={(x) => form.setValue("rememberMe", x === true)}
            />
            Remember me
          </label>
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && (
              <LoaderCircle className="animate-spin" />
            )}
            {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center px-7 pt-2 text-sm text-muted-foreground">
        Don&apos;t have an account?
        <Link
          className="ml-1 font-medium text-foreground underline-offset-4 hover:underline"
          href="/signup"
        >
          Sign up
        </Link>
      </CardFooter>
    </Card>
  );
}
