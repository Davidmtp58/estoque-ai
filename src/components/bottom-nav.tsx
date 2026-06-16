import { Link } from "@tanstack/react-router";
import { Boxes, ArrowDownToLine, BarChart3, ArrowUpFromLine, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, type AppRole } from "@/lib/auth-context";

const allTabs = [
  { id: "produtos", label: "Produto", icon: Boxes, href: "/" },
  { id: "entrada", label: "Entrada", icon: ArrowDownToLine, href: "/entrada" },
  { id: "relatorio", label: "Relatório", icon: BarChart3, href: "/relatorio" },
  { id: "saida", label: "Saída", icon: ArrowUpFromLine, href: "/saida" },
  { id: "perfil", label: "Perfil", icon: User, href: "/perfil" },
] as const;

const allowed: Record<AppRole, string[]> = {
  admin: ["produtos","entrada","relatorio","saida","perfil"],
  gerente: ["produtos","entrada","relatorio","saida","perfil"],
  estoquista: ["produtos","entrada","saida","perfil"],
};

export function BottomNav({ active = "produtos" }: { active?: string }) {
  const { role } = useAuth();
  const tabs = allTabs.filter((t) => !role || allowed[role].includes(t.id));
  return (
    <nav className="sticky bottom-0 z-20 border-t border-border bg-card md:hidden">
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          const Icon = tab.icon;
          return (
            <li key={tab.id} className="flex-1">
              <Link
                to={tab.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex w-full flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className={cn("size-5", isActive && "stroke-[2.5]")} />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}