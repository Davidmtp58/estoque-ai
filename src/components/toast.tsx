import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed left-1/2 top-6 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-teal px-4 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300",
        visible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none",
      )}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success">
        <Check className="h-3.5 w-3.5 text-white" />
      </span>
      {message}
    </div>
  );
}