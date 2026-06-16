import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, UserCog } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { useAuth, roleLabel, roleBadgeClass, type AppRole } from "@/lib/auth-context";
import { UserEditModal } from "@/components/user-edit-modal";
import { UserCreateModal } from "@/components/user-create-modal";

export const Route = createFileRoute("/_authenticated/admin/usuarios")({
  component: UsuariosPage,
});

export interface AdminUser {
  user_id: string;
  name: string;
  email: string;
  cargo: string;
  branch: string;
  ativo: boolean;
  must_change_password: boolean;
  role: AppRole;
}

function UsuariosPage() {
  const { role, loading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [busy, setBusy] = useState(true);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    console.log("Modal state:", creating);
  }, [creating]);

  async function load() {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("admin-list-users");
    if (!error && data?.users) setUsers(data.users as AdminUser[]);
    setBusy(false);
  }
  useEffect(() => {
    if (role === "admin") load();
  }, [role]);
  useEffect(() => {
    if (!loading && role && role !== "admin") navigate({ to: "/" });
  }, [loading, role, navigate]);

  return (
    <AppShell active="usuarios">
      <div className="mx-auto w-full max-w-md md:max-w-[900px]">
        <PageHeader title="Usuários" />
        <div className="flex items-center justify-between px-5 pb-3 md:px-8">
          <p className="text-sm text-muted-foreground">{users.length} usuário(s)</p>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-4" /> Novo usuário
          </button>
        </div>
        <div className="flex flex-col gap-2 px-5 pb-24 md:px-8">
          {busy && <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>}
          {!busy && users.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhum usuário ainda.</p>
          )}
          {users.map((u) => (
            <button
              key={u.user_id}
              type="button"
              onClick={() => setEditing(u)}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-shadow hover:shadow-md"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground">
                {(u.name || u.email).charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold text-foreground">{u.name || "(sem nome)"}</p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${roleBadgeClass[u.role]}`}
                  >
                    {roleLabel[u.role]}
                  </span>
                </div>
                <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                <p className="truncate text-xs text-muted-foreground">{u.branch}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${u.ativo ? "bg-stable/15 text-stable" : "bg-critical-soft text-critical"}`}
              >
                {u.ativo ? "Ativo" : "Inativo"}
              </span>
              <UserCog className="size-4 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
      {editing && (
        <UserEditModal user={editing} onClose={() => setEditing(null)} onChanged={load} />
      )}
      <UserCreateModal open={creating} onOpenChange={setCreating} onCreated={load} />
    </AppShell>
  );
}
