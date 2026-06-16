import { useState, useEffect, type FormEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useProductsStore, type ProductExtras } from "@/lib/products-store";
import { categories, type Product } from "@/lib/products-data";

export function ProductFormModal({ open, onOpenChange, product }: { open: boolean; onOpenChange: (v: boolean) => void; product?: Product & Partial<ProductExtras> }) {
  const { addProduct, updateProduct } = useProductsStore();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Alimentos");
  const [stock, setStock] = useState(0);
  const [min, setMin] = useState(10);
  const [unit, setUnit] = useState("un");
  const [ean, setEan] = useState("");
  const [supplier, setSupplier] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [perishable, setPerishable] = useState(true);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName(product?.name ?? "");
      setCategory(product?.category ?? "Alimentos");
      setStock(product?.stock ?? 0);
      setMin(product?.min ?? 10);
      setUnit(product?.unit ?? "un");
      setEan(product?.ean ?? "");
      setSupplier(product?.supplier ?? "");
      setExpiryDate(product?.expiryDate ?? "");
      setPerishable(product?.perishable ?? true);
      setTouched(false);
    }
  }, [open, product]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setTouched(true);
    if (perishable && !expiryDate) return;
    setSubmitting(true);
    const payload = {
      name, category, stock, min, unit,
      ean: ean || null, supplier: supplier || null,
      expiryDate: perishable ? expiryDate : null,
      perishable,
    };
    const res = product ? await updateProduct(product.id, payload) : await addProduct(payload);
    setSubmitting(false);
    if (res.ok) onOpenChange(false);
  }

  const expiryMissing = perishable && touched && !expiryDate;
  const canSave = !perishable || !!expiryDate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Editar produto" : "Novo produto"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Field label="Nome"><input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></Field>
          <Field label="Categoria">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
              {categories.filter((c) => c !== "Todos").map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Estoque"><input type="number" min={0} value={stock} onChange={(e) => setStock(+e.target.value)} className={inputCls} /></Field>
            <Field label="Mínimo"><input type="number" min={0} value={min} onChange={(e) => setMin(+e.target.value)} className={inputCls} /></Field>
            <Field label="Unidade"><input value={unit} onChange={(e) => setUnit(e.target.value)} className={inputCls} /></Field>
          </div>
          <Field label="EAN / Código de barras"><input value={ean} onChange={(e) => setEan(e.target.value)} className={inputCls} placeholder="opcional" /></Field>
          <Field label="Fornecedor"><input value={supplier} onChange={(e) => setSupplier(e.target.value)} className={inputCls} placeholder="opcional" /></Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!perishable}
              onChange={(e) => { setPerishable(!e.target.checked); if (e.target.checked) setExpiryDate(""); }}
              className="h-4 w-4 rounded border-border"
            />
            <span className="font-medium text-foreground">Produto não perecível</span>
          </label>
          {perishable && (
            <Field label="Data de validade *">
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                onBlur={() => setTouched(true)}
                required
                aria-invalid={expiryMissing}
                className={`${inputCls} ${expiryMissing ? "border-critical focus:border-critical focus:ring-critical/20" : ""}`}
              />
              {expiryMissing && <span className="text-xs font-medium text-critical">Campo obrigatório</span>}
            </Field>
          )}
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => onOpenChange(false)} className="flex-1 rounded-lg border border-border py-2.5 text-sm font-semibold text-muted-foreground hover:bg-secondary">Cancelar</button>
            <button type="submit" disabled={submitting || !canSave} className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{submitting ? "Salvando..." : "Salvar"}</button>
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