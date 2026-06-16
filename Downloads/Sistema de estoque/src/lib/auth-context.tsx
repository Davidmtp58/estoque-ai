import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "gerente" | "estoquista";

export interface Profile {
  user_id: string;
  name: string;
  email: string;
  cargo: string;
  branch: string;
  ativo: boolean;
  must_change_password: boolean;
}

interface AuthCtx {
  user: User | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  refresh: () => Promise<void>;
  can: (action: "delete_product" | "view_users" | "view_reports" | "view_history" | "view_suggestions" | "view_settings") => boolean;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  async function load(u: User | null) {
    if (!u) { setProfile(null); setRole(null); return; }
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", u.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", u.id).maybeSingle(),
    ]);
    setProfile(p as Profile | null);
    setRole(((r as { role: AppRole } | null)?.role) ?? "estoquista");
  }

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted) return;
      setUser(data.user);
      await load(data.user);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      await load(session?.user ?? null);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  const can: AuthCtx["can"] = (action) => {
    if (!role) return false;
    switch (action) {
      case "delete_product":
      case "view_users":
      case "view_settings":
        return role === "admin";
      case "view_reports":
      case "view_history":
      case "view_suggestions":
        return role === "admin" || role === "gerente";
      default:
        return false;
    }
  };

  return <Ctx.Provider value={{ user, profile, role, loading, refresh: () => load(user), can }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}

export const roleLabel: Record<AppRole, string> = {
  admin: "Admin",
  gerente: "Gerente",
  estoquista: "Estoquista",
};

export const roleBadgeClass: Record<AppRole, string> = {
  admin: "bg-primary/15 text-primary",
  gerente: "bg-warning-soft text-warning-foreground",
  estoquista: "bg-secondary text-muted-foreground",
};