import { Check } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function ConfirmationScreen({
  productName,
  quantity,
  newStock,
  type,
  onReset,
}: {
  productName: string;
  quantity: number;
  newStock: number;
  type: "entrada" | "saida";
  onReset?: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-5 py-10 text-center">
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-stable/15 text-stable">
        <Check className="size-10 stroke-[3]" />
      </div>
      <h2 className="text-xl font-bold text-foreground">Registro realizado com sucesso</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {type === "entrada" ? "Entrada" : "Saída"} confirmada no estoque.
      </p>
      <div className="mt-6 w-full rounded-xl border border-border bg-card p-5 text-left shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Produto</p>
        <p className="mt-1 font-semibold text-foreground">{productName}</p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quantidade</p>
            <p className="mt-1 text-lg font-bold text-foreground">
              {type === "entrada" ? "+" : "-"}
              {quantity} un.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Novo estoque</p>
            <p className="mt-1 text-lg font-bold text-primary">{newStock} un.</p>
          </div>
        </div>
      </div>
      <div className="mt-6 flex w-full flex-col gap-3">
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="w-full rounded-xl border-2 border-primary bg-card py-3 text-sm font-bold uppercase tracking-wide text-primary hover:bg-primary/5"
          >
            Novo registro
          </button>
        )}
        <Link
          to="/"
          className="w-full rounded-xl border-2 border-primary bg-card py-3 text-center text-sm font-bold uppercase tracking-wide text-primary hover:bg-primary/5"
        >
          Ver produto
        </Link>
        <Link
          to="/"
          className="w-full rounded-xl bg-primary py-3 text-center text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90"
        >
          Voltar para início
        </Link>
      </div>
    </div>
  );
}