"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, LoaderCircle, Pencil, User } from "lucide-react";
import { signOut, updateUser, useSession } from "@/auth/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfileCard() {
  const router = useRouter();
  const { data, isPending } = useSession();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isPending && !data) router.replace("/signin");
  }, [data, isPending, router]);

  if (isPending)
    return (
      <Card className="py-7">
        <CardContent className="space-y-5 px-7">
          <Skeleton className="size-16 rounded-full" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  if (!data) return null;
  const user = data.user;
  const initials = user.name
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function save() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await updateUser({ name: name.trim() });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="border-white/50 bg-card/90 py-7 shadow-2xl shadow-foreground/5 backdrop-blur">
      <CardHeader className="px-7">
        <div className="flex items-center gap-4">
          <div className="grid size-16 place-items-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
            {user.name ? initials : <User className="size-6" />}
          </div>
          <div>
            <CardTitle className="text-xl">{user.name}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 px-7">
        <div className="h-px bg-border" />
        {editing ? (
          <div className="space-y-3">
            <Label htmlFor="profile-name">Display name</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={user.name}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : null}
                Save changes
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setName(user.name);
              setEditing(true);
            }}
          >
            <Pencil />
            Edit profile
          </Button>
        )}
        <Button
          variant="destructive"
          className="w-full"
          onClick={async () => {
            await signOut();
            router.replace("/signin");
          }}
        >
          <LogOut />
          Sign out
        </Button>
      </CardContent>
    </Card>
  );
}
