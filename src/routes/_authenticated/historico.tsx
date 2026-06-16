import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { useProductsStore, type Movement } from "@/lib/products-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/historico")({
  component: HistoricoPage,
});

function HistoricoPage() {
  const { movements } = useProductsStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"todos" | "entrada" | "saida">("todos");

  const filtered = useMemo(() => {
    return movements.filter((m) => {
      if (filter !== "todos" && m.type !== filter) return false;
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return m.productName.toLowerCase().includes(q) || m.responsavel.toLowerCase().includes(q);
    });
  }, [movements, query, filter]);

  const groups = useMemo(() => {
    const today = new Date(); today.setHours(0,0,0,0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const g: Record<string, Movement[]> = { Hoje: [], Ontem: [], Anteriores: [] };
    for (const m of filtered) {
      const d = new Date(m.date); d.setHours(0,0,0,0);
      if (d.getTime() === today.getTime()) g.Hoje.push(m);
      else if (d.getTime() === yesterday.getTime()) g.Ontem.push(m);
      else g.Anteriores.push(m);
    }
    return g;
  }, [filtered]);

  return (
    <AppShell active="historico">
      <div className="mx-auto w-full max-w-md md:max-w-[900px]">
        <PageHeader title="Histórico" subtitle="Movimentações de estoque" />
        <div className="flex flex-col gap-4 px-5 pb-24 md:px-8">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por produto ou responsável" className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" />
          </div>
          <div className="flex gap-2">
            {(["todos", "entrada", "saida"] as const).map((f) => (
              <button key={f} type="button" onClick={() => setFilter(f)} className={cn("flex-1 rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-colors", filter === f ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground")}>
                {f === "todos" ? "Todos" : f === "entrada" ? "Entradas" : "Saídas"}
              </button>
            ))}
          </div>

          {(Object.entries(groups) as [string, Movement[]][]).map(([label, list]) => (
            list.length === 0 ? null : (
              <section key={label}>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</h3>
                <ul className="flex flex-col gap-2">
                  {list.map((m) => (
                    <li key={m.id} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
                      <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", m.type === "entrada" ? "bg-stable/15 text-stable" : "bg-warning/15 text-warning-foreground")}>
                        {m.type === "entrada" ? <ArrowDownToLine className="size-5" /> : <ArrowUpFromLine className="size-5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-foreground">{m.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {m.responsavel} · {new Date(m.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          {m.motivo && ` · ${m.motivo}`}
                          {m.fornecedor && ` · ${m.fornecedor}`}
                        </p>
                      </div>
                      <span className={cn("text-sm font-bold", m.type === "entrada" ? "text-stable" : "text-warning-foreground")}>
                        {m.type === "entrada" ? "+" : "-"}{m.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )
          ))}

          {filtered.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
              Nenhuma movimentação encontrada.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}