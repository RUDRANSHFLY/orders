import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { ProfileCard } from "@/components/auth/profile-card";

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <AuthShell>
      <ProfileCard />
    </AuthShell>
  );
}
