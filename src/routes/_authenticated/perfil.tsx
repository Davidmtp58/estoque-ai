import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Pencil, Settings } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, roleLabel, roleBadgeClass } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/perfil")({
  component: PerfilPage,
});

function PerfilPage() {
  const { profile, role, refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [cargo, setCargo] = useState("");
  const [filial, setFilial] = useState("");
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);
  useEffect(() => {
    if (profile) { setName(profile.name); setCargo(profile.cargo); setFilial(profile.branch); }
  }, [profile]);

  const initial = (name || email || "?").charAt(0).toUpperCase();

  async function saveProfile() {
    if (!profile) return;
    await supabase.from("profiles").update({ name, cargo, branch: filial }).eq("user_id", profile.user_id);
    await refresh();
    setEdit(false);
  }

  return (
    <AppShell active="perfil">
      <div className="mx-auto w-full max-w-md md:max-w-[700px]">
        <PageHeader title="Perfil" />
        <div className="flex flex-col items-center px-5 pb-24 md:px-8">
          <div className="flex size-24 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground shadow-lg">
            {initial}
          </div>
          <h2 className="mt-4 text-xl font-bold text-foreground">{name}</h2>
          <p className="text-sm text-muted-foreground">{email}</p>
          {role && <span className={`mt-2 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${roleBadgeClass[role]}`}>{roleLabel[role]}</span>}
          <p className="mt-2 text-xs text-muted-foreground">{cargo}</p>
          <p className="text-xs text-muted-foreground">{filial}</p>

          <div className="mt-6 grid w-full grid-cols-3 gap-3">
            {[
              { label: "Registros", value: 128 },
              { label: "Entradas", value: 64 },
              { label: "Saídas", value: 48 },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-3 text-center">
                <p className="text-2xl font-bold text-primary">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <button type="button" onClick={() => setEdit(true)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-primary py-3 text-sm font-semibold text-primary hover:bg-primary/5">
            <Pencil className="size-4" /> Editar dados pessoais
          </button>
          <Link to="/configuracoes" className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90">
            <Settings className="size-4" /> Configurações
          </Link>
        </div>
      </div>
      <Dialog open={edit} onOpenChange={setEdit}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar dados pessoais</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-3">
            <Input label="Nome" value={name} onChange={setName} />
            <Input label="Cargo" value={cargo} onChange={setCargo} />
            <Input label="Filial" value={filial} onChange={setFilial} />
            <button type="button" onClick={saveProfile} className="mt-2 rounded-lg bg-primary py-2.5 text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90">Salvar</button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" />
    </label>
  );
}