import { useState, useEffect, useMemo, type FormEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useProductsStore } from "@/lib/products-store";

export function MovementModal({
  open,
  onOpenChange,
  type,
  productId: initialProductId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  type: "entrada" | "saida";
  productId?: string;
}) {
  const { products, registerEntrada, registerSaida } = useProductsStore();
  const [productId, setProductId] = useState<string>(initialProductId ?? products[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [lote, setLote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notaFiscal, setNotaFiscal] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [motivo, setMotivo] = useState("Venda");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setProductId(initialProductId ?? products[0]?.id ?? "");
      setQuantity(1);
      setLote("");
      setDate(new Date().toISOString().slice(0, 10));
      setNotaFiscal("");
      setFornecedor("");
      setMotivo("Venda");
    }
  }, [open, initialProductId, products]);

  const product = useMemo(() => products.find((p) => p.id === productId), [products, productId]);
  const newStock = product ? (type === "entrada" ? product.stock + quantity : Math.max(0, product.stock - quantity)) : 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!productId || submitting) return;
    setSubmitting(true);
    const res = type === "entrada"
      ? await registerEntrada({ productId, quantity, lote, notaFiscal, fornecedor, date })
      : await registerSaida({ productId, quantity, lote, motivo, date });
    setSubmitting(false);
    if (res.ok) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{type === "entrada" ? "Registrar entrada" : "Registrar saída"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Field label="Produto">
            <select value={productId} onChange={(e) => setProductId(e.target.value)} className={inputCls}>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Quantidade"><input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, +e.target.value))} className={inputCls} required /></Field>
            <Field label="Data"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} /></Field>
          </div>
          <Field label="Lote"><input value={lote} onChange={(e) => setLote(e.target.value)} className={inputCls} placeholder="opcional" /></Field>
          {type === "entrada" ? (
            <>
              <Field label="Nota fiscal"><input value={notaFiscal} onChange={(e) => setNotaFiscal(e.target.value)} className={inputCls} placeholder="opcional" /></Field>
              <Field label="Fornecedor"><input value={fornecedor} onChange={(e) => setFornecedor(e.target.value)} className={inputCls} placeholder="opcional" /></Field>
            </>
          ) : (
            <Field label="Motivo">
              <select value={motivo} onChange={(e) => setMotivo(e.target.value)} className={inputCls}>
                <option>Venda</option><option>Perda</option><option>Devolução</option>
              </select>
            </Field>
          )}
          {product && (
            <div className="rounded-lg bg-secondary px-3 py-2 text-sm">
              <span className="text-muted-foreground">Estoque após registro:</span>{" "}
              <span className="font-bold text-primary">{product.stock} → {newStock} un.</span>
            </div>
          )}
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => onOpenChange(false)} className="flex-1 rounded-lg border border-border py-2.5 text-sm font-semibold text-muted-foreground hover:bg-secondary">Cancelar</button>
            <button type="submit" disabled={submitting} className={`flex-1 rounded-lg py-2.5 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-50 ${type === "entrada" ? "bg-primary hover:bg-primary/90" : "bg-warning hover:bg-warning/90"}`}>
              {submitting ? "Salvando..." : `Confirmar ${type === "entrada" ? "entrada" : "saída"}`}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const inputCls = "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex flex-col gap-1 text-sm"><span className="font-medium text-foreground">{label}</span>{children}</label>;
}