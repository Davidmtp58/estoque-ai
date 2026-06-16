import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/auth-shell";

export const Route = createFileRoute("/setup-admin")({
  ssr: false,
  component: SetupAdmin,
});

function SetupAdmin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "David Mangueira",
    email: "david@estoqueapp.com",
    password: "",
    cargo: "Administrador",
    branch: "João Pessoa - PB",
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const { count } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin");
      if ((count ?? 0) > 0) navigate({ to: "/login" });
      else setChecking(false);
    })();
  }, [navigate]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null); setMsg(null);
    try {
      const { data, error } = await supabase.functions.invoke("bootstrap-admin", { body: form });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setMsg("Administrador criado! Você será redirecionado para o login.");
      setTimeout(() => navigate({ to: "/login" }), 1500);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro");
    } finally { setBusy(false); }
  }

  if (checking) {
    return (
      <AuthShell title="Verificando..." subtitle="Aguarde">
        <p className="text-sm text-muted-foreground">Conferindo se já existe um administrador...</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Criar administrador" subtitle="Use esta tela apenas uma vez para criar a conta admin inicial.">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Nome</span>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Email</span>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Senha</span>
          <input type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Cargo</span>
          <input value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} required className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Filial</span>
          <input value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} required className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm" />
        </label>
        {err && <p className="rounded-md bg-critical-soft px-3 py-2 text-xs text-critical">{err}</p>}
        {msg && <p className="rounded-md bg-secondary px-3 py-2 text-xs text-primary">{msg}</p>}
        <button disabled={busy} className="mt-2 w-full rounded-xl bg-primary py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90 disabled:opacity-60">{busy ? "Criando..." : "Criar admin"}</button>
      </form>
    </AuthShell>
  );
}