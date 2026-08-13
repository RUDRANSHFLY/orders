"use client";

import * as React from "react";
import {
  PlusCircle,
  Pencil,
  Trash2,
  Banknote,
  ArrowRightLeft,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Prisma } from "@/app/generated/prisma/client";

/* ------------------------------------------------------------------ */
/*  Types — mirrors the AuditLog / AuditAction / OrderStatus models    */
/*  from schema.prisma                                                 */
/* ------------------------------------------------------------------ */

export type AuditAction =
  | "ORDER_CREATED"
  | "ORDER_UPDATED"
  | "ORDER_DELETED"
  | "PAYMENT_RECORDED"
  | "STATUS_CHANGED";

export type OrderStatus = "PENDING" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";

export type AuditEntity = "Order" | "Payment" | "LineItem";

/** Minimal user shape needed to render the actor on each entry. */
export interface AuditLogUser {
  id: string;
  name: string;
  image?: string | null;
}

/**
 * One row from the `audit_log` table, scoped to a single order's history.
 * `before` / `after` are the raw Json snapshots Prisma returns — shape
 * depends on `entity`, so they're left loose and rendered generically.
 */
export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  before: Prisma.JsonValue | null;
  after: Prisma.JsonValue | null;
  createdAt: string | Date;
  user: AuditLogUser;
}

export interface OrderAuditTimelineProps {
  /** Audit log rows for one order, any order. Newest-first or oldest-first both work — sorted internally. */
  logs: AuditLogEntry[];
  className?: string;
  emptyMessage?: string;
}

/* ------------------------------------------------------------------ */
/*  Presentation config                                                */
/* ------------------------------------------------------------------ */

const ACTION_META: Record<
  AuditAction,
  { label: string; icon: LucideIcon; dot: string; ring: string }
> = {
  ORDER_CREATED: {
    label: "Order created",
    icon: PlusCircle,
    dot: "bg-emerald-500",
    ring: "ring-emerald-500/20",
  },
  ORDER_UPDATED: {
    label: "Order updated",
    icon: Pencil,
    dot: "bg-blue-500",
    ring: "ring-blue-500/20",
  },
  ORDER_DELETED: {
    label: "Order deleted",
    icon: Trash2,
    dot: "bg-red-500",
    ring: "ring-red-500/20",
  },
  PAYMENT_RECORDED: {
    label: "Payment recorded",
    icon: Banknote,
    dot: "bg-amber-500",
    ring: "ring-amber-500/20",
  },
  STATUS_CHANGED: {
    label: "Status changed",
    icon: ArrowRightLeft,
    dot: "bg-violet-500",
    ring: "ring-violet-500/20",
  },
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-slate-100 text-slate-700 border-slate-200",
  PARTIALLY_PAID: "bg-amber-100 text-amber-800 border-amber-200",
  PAID: "bg-emerald-100 text-emerald-800 border-emerald-200",
  OVERDUE: "bg-red-100 text-red-800 border-red-200",
};

function StatusBadge({ status }: { status: string }) {
  const style =
    STATUS_STYLES[status as OrderStatus] ??
    "bg-slate-100 text-slate-700 border-slate-200";
  return (
    <Badge
      variant="outline"
      className={cn("font-medium px-1.5 py-0 text-[11px]", style)}
    >
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

function formatTimestamp(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return {
    relative: relativeTime(date),
    absolute: date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }),
  };
}

function relativeTime(date: Date) {
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const divisions: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
  ];
  for (const [unit, secondsInUnit] of divisions) {
    if (Math.abs(seconds) >= secondsInUnit) {
      const value = Math.round(seconds / secondsInUnit);
      return new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(
        value,
        unit,
      );
    }
  }
  return "just now";
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Short, human summary line for an entry, tailored per action type. */
function summarize(entry: AuditLogEntry): string {
  const { action, entity, before, after } = entry;
  switch (action) {
    case "STATUS_CHANGED":
      return `${entity} status updated`;
    case "PAYMENT_RECORDED":
      return after?.amount
        ? `Payment of ${formatCurrency(after.amount)} logged`
        : "Payment logged";
    case "ORDER_CREATED":
      return `${entity} opened`;
    case "ORDER_DELETED":
      return `${entity} removed`;
    case "ORDER_UPDATED":
    default:
      return before && after
        ? `${entity} details changed`
        : `${entity} updated`;
  }
}

function formatCurrency(value: unknown) {
  const n = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(n)) return String(value);
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(n);
}

/* ------------------------------------------------------------------ */
/*  Diff row — renders a before → after field, or a plain JSON dump    */
/* ------------------------------------------------------------------ */

function DiffBody({ entry }: { entry: AuditLogEntry }) {
  const { before, after, action } = entry;

  if (action === "STATUS_CHANGED" && before?.status && after?.status) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <StatusBadge status={String(before.status)} />
        <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground" />
        <StatusBadge status={String(after.status)} />
      </div>
    );
  }

  if (!before && after) {
    return <JsonPreview label="Snapshot" data={after} />;
  }

  if (before && !after) {
    return <JsonPreview label="Removed" data={before} />;
  }

  if (before && after) {
    const keys = Array.from(
      new Set([...Object.keys(before), ...Object.keys(after)]),
    ).filter((k) => JSON.stringify(before[k]) !== JSON.stringify(after[k]));

    if (keys.length === 0) return null;

    return (
      <div className="space-y-1.5">
        {keys.map((key) => (
          <div
            key={key}
            className="flex flex-wrap items-baseline gap-x-2 text-sm"
          >
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {key}
            </span>
            <span className="text-muted-foreground line-through decoration-1">
              {String(before[key] ?? "—")}
            </span>
            <span>→</span>
            <span className="font-medium text-foreground">
              {String(after[key] ?? "—")}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

function JsonPreview({
  label,
  data,
}: {
  label: string;
  data: Record<string, unknown>;
}) {
  return (
    <div className="text-sm">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <pre className="mt-1 max-h-40 overflow-auto rounded-md bg-muted/60 p-2 text-xs leading-relaxed">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Single timeline row                                                */
/* ------------------------------------------------------------------ */

function TimelineRow({
  entry,
  isLast,
}: {
  entry: AuditLogEntry;
  isLast: boolean;
}) {
  const meta = ACTION_META[entry.action];
  const Icon = meta.icon;
  const { relative, absolute } = formatTimestamp(entry.createdAt);
  const [open, setOpen] = React.useState(false);
  const hasDetail = Boolean(entry.before || entry.after);

  return (
    <li className="relative flex gap-3 pb-6 last:pb-0">
      {!isLast && (
        <span
          aria-hidden
          className="absolute left-[15px] top-8 h-[calc(100%-1.25rem)] w-px bg-border"
        />
      )}

      <span
        className={cn(
          "z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ring-4",
          meta.dot,
          meta.ring,
        )}
      >
        <Icon className="h-4 w-4" />
      </span>

      <div className="flex-1 pt-0.5">
        <Collapsible open={open} onOpenChange={setOpen}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium leading-none text-foreground">
                {meta.label}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {summarize(entry)}
              </p>
            </div>
            <time
              title={absolute}
              className="shrink-0 whitespace-nowrap text-xs text-muted-foreground"
            >
              {relative}
            </time>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarImage
                src={entry.user.image ?? undefined}
                alt={entry.user.name}
              />
              <AvatarFallback className="text-[10px]">
                {initials(entry.user.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {entry.user.name}
            </span>

            {hasDetail && (
              <CollapsibleTrigger>
                <button
                  type="button"
                  className="ml-auto flex items-center gap-0.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Details
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform",
                      open && "rotate-180",
                    )}
                  />
                </button>
              </CollapsibleTrigger>
            )}
          </div>

          {hasDetail && (
            <CollapsibleContent className="mt-2 rounded-lg border bg-muted/30 p-3">
              <DiffBody entry={entry} />
            </CollapsibleContent>
          )}
        </Collapsible>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/*  Public component                                                   */
/* ------------------------------------------------------------------ */

export function OrderAuditTimeline({
  logs,
  className,
  emptyMessage = "No activity recorded for this order yet.",
}: OrderAuditTimelineProps) {
  const sorted = React.useMemo(
    () =>
      [...logs].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [logs],
  );

  if (sorted.length === 0) {
    return (
      <div
        className={cn(
          "rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <ol className={cn("relative", className)}>
      {sorted.map((entry, i) => (
        <TimelineRow
          key={entry.id}
          entry={entry}
          isLast={i === sorted.length - 1}
        />
      ))}
    </ol>
  );
}

export default OrderAuditTimeline;
