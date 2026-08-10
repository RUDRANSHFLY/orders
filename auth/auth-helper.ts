import { headers } from "next/headers";
import { auth } from "./auth";
import { UnAuthorizedError } from "@/lib/api/errors";

export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user ?? null;
}

export async function requireUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new UnAuthorizedError();
  }

  return session.user;
}
