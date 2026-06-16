import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { SuggestionScreen } from "@/components/suggestion-screen";

export const Route = createFileRoute("/_authenticated/sugestao-ia")({
  component: SugestaoIaPage,
});

function SugestaoIaPage() {
  return (
    <AppShell active="sugestao-ia">
      <header className="flex items-center justify-between gap-4 border-b border-border bg-card px-4 py-3 md:px-8">
        <div>
          <p className="text-sm font-semibold text-foreground">Olá, David</p>
          <p className="text-xs text-muted-foreground">Supermercado Central · João Pessoa - PB</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">D</div>
      </header>
      <main className="px-4 py-6 pb-24 md:px-8 md:pb-10">
        <SuggestionScreen />
      </main>
    </AppShell>
  );
}