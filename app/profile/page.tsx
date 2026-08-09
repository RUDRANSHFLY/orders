import { AuthShell } from "@/components/auth/auth-shell";
import { ProfileCard } from "@/components/auth/profile-card";

export default function ProfilePage() {
  return (
    <AuthShell>
      <ProfileCard />
    </AuthShell>
  );
}
