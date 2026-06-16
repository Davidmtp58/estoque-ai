import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { ConfirmationScreen } from "@/components/confirmation-screen";
import { useProductsStore } from "@/lib/products-store";

export const Route = createFileRoute("/_authenticated/saida")({
  component: SaidaPage,
});

const inputCls = "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20";

function SaidaPage() {
  const navigate = useNavigate();
  const { products, registerSaida } = useProductsStore();
  const [search, setSearch] = useState("");
  const [productId, setProductId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [lote, setLote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [motivo, setMotivo] = useState("Venda");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ name: string; qty: number; newStock: number } | null>(null);

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase())).slice(0, 6),
    [products, search],
  );
  const selected = products.find((p) => p.id === productId);
  const newStock = selected ? Math.max(0, selected.stock - quantity) : 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selected || submitting) return;
    setSubmitting(true);
    const res = await registerSaida({ productId: selected.id, quantity, lote, motivo, date, notes });
    setSubmitting(false);
    if (res.ok) setDone({ name: selected.name, qty: quantity, newStock });
  }

  if (done) {
    return (
      <AppShell active="saida">
        <ConfirmationScreen type="saida" productName={done.name} quantity={done.qty} newStock={done.newStock} onReset={() => setDone(null)} />
      </AppShell>
    );
  }

  return (
    <AppShell active="saida">
      <div className="mx-auto w-full max-w-md md:max-w-[700px]">
        <PageHeader title="Registrar saída" subtitle="Remova produtos do estoque" />
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 pb-24 pt-2 md:px-8">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Produto</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input className={`${inputCls} pl-9`} placeholder="Buscar produto" value={selected ? selected.name : search} onChange={(e) => { setSearch(e.target.value); setProductId(""); }} />
            </div>
            {!selected && search && (
              <ul className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-border bg-card">
                {filtered.map((p) => (
                  <li key={p.id}>
                    <button type="button" onClick={() => { setProductId(p.id); setSearch(""); }} className="block w-full px-3 py-2 text-left text-sm hover:bg-secondary">
                      <span className="font-medium">{p.name}</span> <span className="text-xs text-muted-foreground">· {p.stock} {p.unit}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Quantidade"><input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, +e.target.value))} className={inputCls} required /></Field>
            <Field label="Data"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} /></Field>
          </div>
          <Field label="Lote"><input value={lote} onChange={(e) => setLote(e.target.value)} className={inputCls} /></Field>
          <Field label="Motivo">
            <select value={motivo} onChange={(e) => setMotivo(e.target.value)} className={inputCls}>
              <option>Venda</option><option>Perda</option><option>Devolução</option>
            </select>
          </Field>
          <Field label="Observações"><textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputCls} resize-none`} placeholder="Notas opcionais sobre esta saída" /></Field>
          {selected && (
            <div className="rounded-lg bg-secondary px-4 py-3 text-sm">
              <span className="text-muted-foreground">Estoque após registro:</span>{" "}
              <span className="font-bold text-warning-foreground">{selected.stock} → {newStock} un.</span>
            </div>
          )}
          <div className="mt-2 flex gap-3">
            <button type="button" onClick={() => navigate({ to: "/" })} className="flex-1 rounded-xl border border-border py-3.5 text-sm font-bold uppercase tracking-wide text-muted-foreground hover:bg-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={!selected || submitting} className="flex-1 rounded-xl bg-warning py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-sm hover:bg-warning/90 disabled:opacity-50">
              {submitting ? "Salvando..." : "Confirmar saída"}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex flex-col gap-1.5 text-sm"><span className="font-medium text-foreground">{label}</span>{children}</label>;
}