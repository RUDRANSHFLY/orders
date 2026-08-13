"use client";

import Link from "next/link";
import { Moon, SunMedium, User } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function OrdersHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/orders"
            className="text-lg font-semibold tracking-tight text-foreground"
          >
            Orders
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/orders">
            <Button variant="ghost" size="sm">
              Overview
            </Button>
          </Link>

          <Link href="/profile">
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="size-4" />
              Profile
            </Button>
          </Link>

          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Toggle theme"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <SunMedium className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
