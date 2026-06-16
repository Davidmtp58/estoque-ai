import { AlertTriangle, AlertCircle } from "lucide-react";

type SummaryCardsProps = { criticalCount: number; warningCount: number };

export function SummaryCards({ criticalCount, warningCount }: SummaryCardsProps) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    <div className="grid grid-cols-2 gap-3 px-5 md:gap-4">
      <div className="flex items-center gap-3 rounded-xl bg-critical-soft p-4 md:gap-4 md:p-6">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-critical/15 text-critical md:size-12">
          <AlertCircle className="size-5 md:size-6" />
        </div>
        <div className="min-w-0">
          <p className="text-3xl font-bold leading-none text-critical md:text-4xl">{pad(criticalCount)}</p>
          <p className="mt-1 text-sm font-medium text-critical/80">Críticos</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-xl bg-warning-soft p-4 md:gap-4 md:p-6">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-warning/20 text-warning-foreground md:size-12">
          <AlertTriangle className="size-5 md:size-6" />
        </div>
        <div className="min-w-0">
          <p className="text-3xl font-bold leading-none text-warning md:text-4xl">{pad(warningCount)}</p>
          <p className="mt-1 text-sm font-medium text-warning-foreground/80">Em atenção</p>
        </div>
      </div>
    </div>
  );
}