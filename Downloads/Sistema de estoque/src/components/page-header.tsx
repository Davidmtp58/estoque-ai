import { ArrowLeft } from "lucide-react";
import { useRouter } from "@tanstack/react-router";

export function PageHeader({ title, subtitle, showBack = true }: { title: string; subtitle?: string; showBack?: boolean }) {
  const router = useRouter();
  return (
    <header className="flex items-center gap-3 border-b border-border bg-card px-5 py-4 md:border-0 md:bg-transparent md:px-8 md:py-6">
      {showBack && (
        <button
          type="button"
          onClick={() => router.history.back()}
          aria-label="Voltar"
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-primary transition-colors hover:bg-secondary active:scale-95 md:hidden"
        >
          <ArrowLeft className="size-5" />
        </button>
      )}
      <div className="min-w-0">
        <h1 className="text-xl font-bold leading-tight text-foreground md:text-2xl">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </header>
  );
}