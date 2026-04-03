"use client";

import { twMerge } from "tailwind-merge";

/** Pulse-animated placeholder block. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={twMerge("animate-pulse rounded bg-slate-200", className)}
    />
  );
}

/** Skeleton mimicking a stat card on the dashboard. */
export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-100">
      <Skeleton className="h-9 w-9 rounded-lg mb-3" />
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

/** Skeleton for a project table row. */
export function ProjectRowSkeleton() {
  return (
    <tr className="border-b border-slate-100">
      <td className="px-4 py-3"><Skeleton className="h-5 w-40 mb-1" /><Skeleton className="h-3 w-24 mt-1" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-12" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-12 ml-auto" /></td>
      <td className="px-4 py-3"><Skeleton className="h-2 w-20 ml-auto" /></td>
      <td className="px-4 py-3" />
    </tr>
  );
}

/** Skeleton for a project card (mobile). */
export function ProjectCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <Skeleton className="h-1 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-2 w-full" />
      </div>
    </div>
  );
}

/** Full-tab skeleton: checklist / scope / materials style. */
export function TabSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-8 w-48 mb-6" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
