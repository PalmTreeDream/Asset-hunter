import { cn } from "@/lib/utils";

type Status = "new" | "qualified" | "contacted" | "disqualified" | string;

export function LeadStatusBadge({ status, className }: { status: Status; className?: string }) {
  const styles: Record<string, string> = {
    new: "bg-blue-100 text-blue-700 border-blue-200",
    qualified: "bg-green-100 text-green-700 border-green-200",
    contacted: "bg-amber-100 text-amber-700 border-amber-200",
    disqualified: "bg-gray-100 text-gray-600 border-gray-200 line-through decoration-gray-400",
  };

  const defaultStyle = "bg-primary/10 text-primary border-primary/20";
  const statusKey = status.toLowerCase();

  return (
    <span className={cn(
      "px-2.5 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider",
      styles[statusKey] || defaultStyle,
      className
    )}>
      {status}
    </span>
  );
}
