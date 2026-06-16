import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  component: ConfigPage,
});

function ConfigPage() {
  const navigate = useNavigate();
  const [critico, setCritico] = useState(true);
  const [baixo, setBaixo] = useState(true);
  const [exp, setExp] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

  function handleSave() {
    try {
      localStorage.setItem("settings", JSON.stringify({ critico, baixo, exp }));
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <AppShell active="perfil">
      <div className="mx-auto w-full max-w-md md:max-w-[700px]">
        <PageHeader title="Configurações" />
        <div className="flex flex-col gap-3 px-5 pb-24 md:px-8">
          <Row label="Notificações de estoque crítico" desc="Receba alertas quando produtos atingirem nível crítico" checked={critico} onChange={setCritico} />
          <Row label="Aviso de estoque baixo" desc="Avise quando produtos estiverem abaixo do mínimo" checked={baixo} onChange={setBaixo} />
          <Row label="Exportação automática semanal" desc="Receba um relatório toda segunda-feira" checked={exp} onChange={setExp} />

          <Link to="/nova-senha" className="mt-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground hover:bg-secondary">
            Alterar senha
          </Link>
          <button type="button" onClick={handleSignOut} className="rounded-xl border border-critical bg-card px-4 py-3 text-sm font-semibold text-critical hover:bg-critical/10">
            Sair da conta
          </button>
          <button type="button" onClick={handleSave} className="mt-4 rounded-xl bg-primary py-3.5 text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90">
            Salvar configurações
          </button>
          {saved && <p className="text-center text-xs text-stable">Configurações salvas.</p>}
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}