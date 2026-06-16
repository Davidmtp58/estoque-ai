import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { useProductsStore } from "@/lib/products-store";

export const Route = createFileRoute("/_authenticated/relatorio")({
  component: RelatorioPage,
});

function RelatorioPage() {
  const { movements } = useProductsStore();
  const days = 7;

  const data = useMemo(() => {
    const now = new Date();
    const arr: { day: string; entradas: number; saidas: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
      const ent = movements.filter((m) => m.type === "entrada" && m.date.slice(0, 10) === key).reduce((s, m) => s + m.quantity, 0);
      const sai = movements.filter((m) => m.type === "saida" && m.date.slice(0, 10) === key).reduce((s, m) => s + m.quantity, 0);
      arr.push({ day: label, entradas: ent, saidas: sai });
    }
    return arr;
  }, [movements]);

  const totalEnt = data.reduce((s, d) => s + d.entradas, 0);
  const totalSai = data.reduce((s, d) => s + d.saidas, 0);

  return (
    <AppShell active="relatorio">
      <div className="mx-auto w-full max-w-md md:max-w-[1000px]">
        <PageHeader title="Relatório" subtitle="Últimos 7 dias" />
        <div className="flex flex-col gap-4 px-5 pb-24 md:px-8">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-stable"><ArrowDownToLine className="size-4" /><span className="text-xs font-semibold uppercase">Entradas</span></div>
              <p className="mt-2 text-2xl font-bold text-stable">+{totalEnt} un.</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-warning"><ArrowUpFromLine className="size-4" /><span className="text-xs font-semibold uppercase">Saídas</span></div>
              <p className="mt-2 text-2xl font-bold text-warning-foreground">-{totalSai} un.</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="day" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="entradas" fill="#1b5e6e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="saidas" fill="#e8a020" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Histórico de movimentações</h3>
            <ul className="flex flex-col gap-2">
              {movements.slice(0, 8).map((m) => (
                <li key={m.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{m.productName}</p>
                    <p className="text-xs text-muted-foreground">{new Date(m.date).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <span className={`text-sm font-bold ${m.type === "entrada" ? "text-stable" : "text-warning-foreground"}`}>
                    {m.type === "entrada" ? "+" : "-"}{m.quantity}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <button type="button" onClick={() => toast.info("Exportando...")} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90">
            <Download className="size-4" /> Exportar
          </button>
        </div>
      </div>
    </AppShell>
  );
}