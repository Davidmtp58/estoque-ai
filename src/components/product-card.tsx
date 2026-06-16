import { useState } from "react";
import { MoreVertical, Eye, Pencil, Trash2, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/products-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProductViewModal } from "@/components/product-view-modal";
import { ProductFormModal } from "@/components/product-form-modal";
import { MovementModal } from "@/components/movement-modal";
import { useProductsStore } from "@/lib/products-store";
import { useAuth } from "@/lib/auth-context";

const statusConfig = {
  critical: { border: "border-l-critical", bar: "bg-critical", badge: "bg-critical-soft text-critical", label: "Crítico" },
  warning: { border: "border-l-warning", bar: "bg-warning", badge: "bg-warning-soft text-warning-foreground", label: "Baixo" },
  stable: { border: "border-l-stable", bar: "bg-stable", badge: "bg-secondary text-stable", label: "OK" },
} as const;

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const config = statusConfig[product.status];
  const pct = Math.min(100, Math.round((product.stock / product.min) * 100));
  const { deleteProduct } = useProductsStore();
  const { can } = useAuth();
  const [view, setView] = useState(false);
  const [edit, setEdit] = useState(false);
  const [entrada, setEntrada] = useState(false);
  const [saida, setSaida] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  return (
    <>
    <article
      className={cn(
        "animate-alert-enter rounded-xl border border-border border-l-4 bg-card p-4 shadow-sm transition-shadow hover:shadow-md md:p-5",
        config.border,
      )}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-pretty font-semibold leading-snug text-foreground">{product.name}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{product.category}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", config.badge)}>{config.label}</span>
          {product.expiryDays !== undefined && product.expiryDays <= 7 && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                product.expiryDays <= 3
                  ? "bg-critical text-critical-foreground"
                  : "bg-warning text-warning-foreground",
              )}
            >
              Vence em {product.expiryDays} {product.expiryDays === 1 ? "dia" : "dias"}
            </span>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-bold leading-none text-foreground">
            {product.stock}
            <span className="ml-1 text-sm font-medium text-muted-foreground">{product.unit}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Mínimo: {product.min}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" aria-label="Ações" className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              <MoreVertical className="size-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setView(true)}><Eye className="mr-2 size-4" /> Ver produto</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEdit(true)}><Pencil className="mr-2 size-4" /> Editar cadastro</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setEntrada(true)}><ArrowDownToLine className="mr-2 size-4" /> Registrar entrada</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSaida(true)}><ArrowUpFromLine className="mr-2 size-4" /> Registrar saída</DropdownMenuItem>
            {can("delete_product") && (<>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setConfirmDel(true)} className="text-critical focus:text-critical"><Trash2 className="mr-2 size-4" /> Excluir produto</DropdownMenuItem>
            </>)}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-track">
        <div className={cn("h-full rounded-full transition-all", config.bar)} style={{ width: `${pct}%` }} />
      </div>
    </article>
    <ProductViewModal open={view} onOpenChange={setView} product={product} />
    <ProductFormModal open={edit} onOpenChange={setEdit} product={product} />
    <MovementModal open={entrada} onOpenChange={setEntrada} type="entrada" productId={product.id} />
    <MovementModal open={saida} onOpenChange={setSaida} type="saida" productId={product.id} />
    <AlertDialog open={confirmDel} onOpenChange={setConfirmDel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
          <AlertDialogDescription>Esta ação não pode ser desfeita. "{product.name}" será removido da lista.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={() => { void deleteProduct(product.id); }} className="bg-critical text-critical-foreground hover:bg-critical/90">Excluir</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}