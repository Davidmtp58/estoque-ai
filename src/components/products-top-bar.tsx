import { useAuth } from "@/lib/auth-context";

export function ProductsTopBar() {
  const { profile } = useAuth();
  const name = profile?.name?.split(" ")[0] || "Usuário";
  const initial = (profile?.name?.[0] ?? "U").toUpperCase();
  const company = profile?.branch || profile?.cargo || "EstoqueApp";
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-card px-5 py-4 md:border-0 md:bg-transparent md:px-0 md:py-0">
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">Olá,</p>
        <h1 className="text-2xl font-bold leading-tight text-foreground md:text-3xl">{name}</h1>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">{company}</p>
      </div>
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground" aria-hidden="true">{initial}</div>
    </header>
  );
}