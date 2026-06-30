import { cn } from "@/lib/bidshield/utils";
import type { HTMLAttributes, ReactNode } from "react";

/**
 * Table primitives — wrap the `.bs-table-*` patterns (uppercase header,
 * hover rows, hairline dividers) so every data table looks identical.
 *
 * Usage:
 *   <Table>
 *     <TableHeader><div>Project</div><div>Due</div></TableHeader>
 *     <TableRow>…</TableRow>
 *   </Table>
 */
export function Table({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("bs-metric-card overflow-hidden", className)}
      style={{ padding: 0 }}
      {...props}
    />
  );
}

export function TableHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("bs-table-header", className)}>{children}</div>;
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("bs-table-row", className)} {...props} />;
}
