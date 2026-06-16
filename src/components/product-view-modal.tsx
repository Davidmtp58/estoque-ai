import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Product } from "@/lib/products-data";

export function ProductViewModal({ open, onOpenChange, product }: { open: boolean; onOpenChange: (v: boolean) => void; product: Product | null }) {
  if (!product) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{product.name}</DialogTitle></DialogHeader>
        <div className="space-y-3 text-sm">
          <Row k="Categoria" v={product.category} />
          <Row k="Estoque atual" v={`${product.stock} ${product.unit}`} />
          <Row k="Mínimo" v={`${product.min} ${product.unit}`} />
          <Row k="Status" v={product.status} />
          {product.expiryDays !== undefined && <Row k="Vence em" v={`${product.expiryDays} dia(s)`} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between border-b border-border py-2 last:border-0"><span className="text-muted-foreground">{k}</span><span className="font-semibold text-foreground">{v}</span></div>;
}