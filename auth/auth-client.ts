import "dotenv/config";

import { createAuthClient } from "better-auth/react";

const baseURL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL;

if (!baseURL) {
  throw new Error("BETTER_AUTH_URL is not set");
}

export const { signIn, signUp, useSession, signOut, getSession, updateUser } =
  createAuthClient({ baseURL });
