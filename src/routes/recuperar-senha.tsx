import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/auth-shell";

export const Route = createFileRoute("/recuperar-senha")({
  ssr: false,
  component: RecuperarSenhaPage,
});

function RecuperarSenhaPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function sendCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
      if (error) throw error;
      setMessage("Código enviado para seu email.");
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar código");
    } finally {
      setLoading(false);
    }
  }

  async function confirmCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
      if (error) throw error;
      navigate({ to: "/nova-senha" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Código inválido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Recuperar senha" subtitle={step === "email" ? "Enviaremos um código por email" : "Digite o código recebido"}>
      {step === "email" ? (
        <form onSubmit={sendCode} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              placeholder="voce@exemplo.com"
            />
          </label>
          {error && <p className="rounded-md bg-critical-soft px-3 py-2 text-xs text-critical">{error}</p>}
          {message && <p className="rounded-md bg-secondary px-3 py-2 text-xs text-primary">{message}</p>}
          <button type="submit" disabled={loading} className="mt-2 w-full rounded-xl bg-primary py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            {loading ? "Enviando..." : "Enviar código"}
          </button>
          <Link to="/login" className="mx-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-3" /> Voltar
          </Link>
        </form>
      ) : (
        <form onSubmit={confirmCode} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Código</span>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-2.5 text-center text-lg tracking-widest outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              placeholder="123456"
            />
          </label>
          {error && <p className="rounded-md bg-critical-soft px-3 py-2 text-xs text-critical">{error}</p>}
          <button type="submit" disabled={loading} className="mt-2 w-full rounded-xl bg-primary py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            {loading ? "Confirmando..." : "Confirmar"}
          </button>
          <button type="button" onClick={() => setStep("email")} className="mx-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-3" /> Voltar
          </button>
        </form>
      )}
    </AuthShell>
  );
}