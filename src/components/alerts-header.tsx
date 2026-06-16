import { ArrowLeft } from "lucide-react";

export function AlertsHeader() {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 px-5 pt-5 md:px-8 md:pt-7">
        <p className="text-base font-semibold text-foreground">
          Olá, <span className="text-primary">David</span>
        </p>
        <div aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          D
        </div>
      </div>
      <header className="flex items-center gap-3 px-5 pb-4 pt-4 md:px-8 md:pt-6">
        <button type="button" aria-label="Voltar" className="flex size-10 shrink-0 items-center justify-center rounded-full text-primary transition-colors hover:bg-secondary active:scale-95 md:hidden">
          <ArrowLeft className="size-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-pretty text-xl font-bold leading-tight text-foreground md:text-2xl">Alertas de estoque</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">Produtos que precisam de atenção</p>
        </div>
      </header>
    </div>
  );
}