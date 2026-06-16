import { Package, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StockAlert } from "@/lib/alerts-data";

type AlertCardProps = { alert: StockAlert; index: number };

export function AlertCard({ alert, index }: AlertCardProps) {
  const isCritical = alert.status === "critico";
  const fillPercent = Math.min(100, Math.round((alert.current / alert.min) * 100));

  return (
    <article
      className={cn(
        "animate-alert-enter rounded-xl border-l-4 bg-card p-4 shadow-sm transition-shadow hover:shadow-md md:p-5",
        isCritical ? "border-l-critical" : "border-l-warning",
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
          <Package className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-pretty text-[15px] font-bold leading-tight text-foreground">{alert.name}</h3>
            <StatusBadge status={alert.status} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Atual: <span className="font-semibold text-foreground">{alert.current} un.</span>
            {" · "}
            Mínimo: <span className="font-semibold text-foreground">{alert.min} un.</span>
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-track md:h-2">
            <div
              className={cn("h-full rounded-full", isCritical ? "bg-critical" : "bg-warning")}
              style={{ width: `${fillPercent}%` }}
            />
          </div>
          {alert.expiryDays != null && (
            <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-critical-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-critical">
              <Clock className="size-3" />
              Vence em {alert.expiryDays} {alert.expiryDays === 1 ? "dia" : "dias"}
            </span>
          )}
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button type="button" className="flex-1 rounded-lg border border-primary px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground active:scale-[0.98]">
          Registrar entrada
        </button>
        <button type="button" className="flex-1 rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground active:scale-[0.98]">
          Ver produto
        </button>
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: StockAlert["status"] }) {
  if (status === "critico") {
    return (
      <span className="shrink-0 rounded-full bg-critical px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-critical-foreground">
        Crítico
      </span>
    );
  }
  return (
    <span className="shrink-0 rounded-full bg-warning px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-warning-foreground">
      Atenção
    </span>
  );
}