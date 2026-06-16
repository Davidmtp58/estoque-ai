import { Link } from "@tanstack/react-router";
import { Boxes, ArrowDownToLine, BarChart3, ArrowUpFromLine, User, Bell, History, Sparkles, LogOut, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { useAuth, type AppRole } from "@/lib/auth-context";

const allItems = [
  { id: "produtos", label: "Produtos", icon: Boxes, href: "/" },
  { id: "entrada", label: "Entrada", icon: ArrowDownToLine, href: "/entrada" },
  { id: "relatorio", label: "Relatório", icon: BarChart3, href: "/relatorio" },
  { id: "saida", label: "Saída", icon: ArrowUpFromLine, href: "/saida" },
  { id: "alertas", label: "Alertas", icon: Bell, href: "/alertas" },
  { id: "historico", label: "Histórico", icon: History, href: "/historico" },
  { id: "sugestao-ia", label: "Sugestão IA", icon: Sparkles, href: "/sugestao-ia" },
  { id: "usuarios", label: "Usuários", icon: Users, href: "/admin/usuarios" },
  { id: "perfil", label: "Perfil", icon: User, href: "/perfil" },
] as const;

const allowed: Record<AppRole, string[]> = {
  admin: ["produtos","entrada","relatorio","saida","alertas","historico","sugestao-ia","usuarios","perfil"],
  gerente: ["produtos","entrada","relatorio","saida","alertas","historico","sugestao-ia","perfil"],
  estoquista: ["produtos","entrada","saida","alertas","perfil"],
};

export function DesktopSidebar({ active = "produtos" }: { active?: string }) {
  const navigate = useNavigate();
  const { role } = useAuth();
  const navItems = allItems.filter((i) => !role || allowed[role].includes(i.id));
  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[260px] flex-col bg-primary text-primary-foreground md:flex">
      <div className="flex items-center gap-3 px-6 pb-6 pt-7">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15">
          <Boxes className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-bold leading-tight">EstoqueApp</p>
          <p className="text-sm leading-relaxed text-primary-foreground/60">Controle de estoque</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = item.id === active;
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <Link
                  to={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-card text-primary shadow-sm"
                      : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground",
                  )}
                >
                  <Icon className={cn("size-5 shrink-0", isActive && "stroke-[2.5]")} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-primary-foreground/10 px-3 py-4">
        <button type="button" onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground">
          <LogOut className="size-5 shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  );
}