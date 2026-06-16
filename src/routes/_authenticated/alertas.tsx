import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PackagePlus, Package, Clock } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AlertsHeader } from "@/components/alerts-header";
import { SummaryCards } from "@/components/summary-cards";
import { MovementModal } from "@/components/movement-modal";
import { useProductsStore } from "@/lib/products-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/alertas")({
  component: AlertsPage,
});

function AlertsPage() {
  const { products } = useProductsStore();
  const alerts = products.filter((p) => p.status !== "stable");
  const criticalCount = alerts.filter((p) => p.status === "critical").length;
  const warningCount = alerts.filter((p) => p.status === "warning").length;
  const [modal, setModal] = useState<{ open: boolean; productId?: string }>({ open: false });

  return (
    <AppShell active="alertas">
      <div className="mx-auto flex w-full max-w-md flex-col md:max-w-[900px]">
        <AlertsHeader />
        <div className="pb-24 md:px-3">
          <SummaryCards criticalCount={criticalCount} warningCount={warningCount} />
          <h2 className="px-5 pb-3 pt-6 text-xs font-bold uppercase tracking-wider text-muted-foreground md:px-5">Lista de alertas</h2>
          <div className="grid grid-cols-1 gap-3 px-5 md:grid-cols-2 md:gap-4">
            {alerts.map((p, idx) => {
              const isCritical = p.status === "critical";
              const fillPercent = Math.min(100, Math.round((p.stock / p.min) * 100));
              return (
                <article key={p.id} className={cn("animate-alert-enter rounded-xl border-l-4 bg-card p-4 shadow-sm md:p-5", isCritical ? "border-l-critical" : "border-l-warning")} style={{ animationDelay: `${idx * 60}ms` }}>
                  <div className="flex items-start gap-3">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                      <Package className="size-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-[15px] font-bold leading-tight text-foreground">{p.name}</h3>
                        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white", isCritical ? "bg-critical" : "bg-warning")}>{isCritical ? "Crítico" : "Atenção"}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">Atual: <span className="font-semibold text-foreground">{p.stock} un.</span> · Mínimo: <span className="font-semibold text-foreground">{p.min} un.</span></p>
                      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-track md:h-2">
                        <div className={cn("h-full rounded-full", isCritical ? "bg-critical" : "bg-warning")} style={{ width: `${fillPercent}%` }} />
                      </div>
                      {p.expiryDays !== undefined && (
                        <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-critical-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-critical">
                          <Clock className="size-3" /> Vence em {p.expiryDays} {p.expiryDays === 1 ? "dia" : "dias"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => setModal({ open: true, productId: p.id })} className="flex-1 rounded-lg border border-primary px-3 py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground">
                      <PackagePlus className="mr-1 inline size-3" /> Registrar entrada
                    </button>
                  </div>
                </article>
              );
            })}
            {alerts.length === 0 && (
              <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">Nenhum alerta no momento.</div>
            )}
          </div>
        </div>
      </div>
      <MovementModal open={modal.open} onOpenChange={(v) => setModal({ open: v, productId: modal.productId })} type="entrada" productId={modal.productId} />
    </AppShell>
  );
}