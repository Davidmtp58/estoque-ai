import type { ReactNode } from "react";
import { Boxes } from "lucide-react";

export function AuthShell({ children, title, subtitle }: { children: ReactNode; title?: string; subtitle?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-10">
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
          <Boxes className="size-7" />
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-foreground">EstoqueApp</p>
          <p className="text-xs text-muted-foreground">Controle de estoque</p>
        </div>
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm">
        {title && <h1 className="text-xl font-bold text-foreground">{title}</h1>}
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}