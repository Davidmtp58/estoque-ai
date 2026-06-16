import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AppRole } from "@/lib/auth-context";

type UserCreateModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
};

export function UserCreateModal({ open, onOpenChange, onCreated }: UserCreateModalProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: generateTempPassword(),
    cargo: "",
    branch: "João Pessoa - PB",
    role: "estoquista" as AppRole,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm({
        name: "",
        email: "",
        password: generateTempPassword(),
        cargo: "",
        branch: "João Pessoa - PB",
        role: "estoquista",
      });
      setError(null);
      setTempPassword(null);
      setBusy(false);
    }
  }, [open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("admin-create-user", {
        body: form,
      });
      if (invokeError) {
        const contextError = invokeError.context instanceof Response ? await invokeError.context.json().catch(() => null) : null;
        const message = contextError?.error ?? invokeError.message;
        if (/already|exist|registered|duplicate|email/i.test(message)) {
          throw new Error("Já existe um usuário cadastrado com esse email.");
        }
        throw new Error(message);
      }
      if (data?.error) {
        const msg = String(data.error);
        if (/already|exist|registered|duplicate/i.test(msg)) {
          throw new Error("Já existe um usuário cadastrado com esse email.");
        }
        throw new Error(msg);
      }
      setTempPassword(data.tempPassword);
      toast.success("Usuário criado com sucesso!");
      onCreated();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao criar usuário";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[100] max-w-md">
        <DialogHeader>
          <DialogTitle>Novo usuário</DialogTitle>
        </DialogHeader>
        {tempPassword ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Senha temporária gerada — anote e envie ao usuário. Ele deverá trocá-la no primeiro
              acesso.
            </p>
            <code className="block rounded-lg bg-secondary px-3 py-3 text-center text-base font-bold tracking-widest text-primary">
              {tempPassword}
            </code>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(tempPassword);
                  toast.success("Senha copiada!");
                }}
                className="flex-1 rounded-lg border border-primary px-3 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5"
              >
                Copiar senha
              </button>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex-1 rounded-lg bg-primary px-3 py-2.5 text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90"
              >
                Concluir
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Field
              label="Nome completo"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
            />
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
            />
            <Field
              label="Senha temporária"
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
            />
            <Field
              label="Cargo"
              value={form.cargo}
              onChange={(v) => setForm({ ...form, cargo: v })}
            />
            <Field
              label="Filial"
              value={form.branch}
              onChange={(v) => setForm({ ...form, branch: v })}
            />
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-foreground">Role</span>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as AppRole })}
                className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              >
                <option value="admin">Admin</option>
                <option value="gerente">Gerente</option>
                <option value="estoquista">Estoquista</option>
              </select>
            </label>
            <p className="text-xs text-muted-foreground">
              A senha temporária foi gerada automaticamente e poderá ser copiada após criar o
              usuário.
            </p>
            {error && (
              <p className="rounded-md bg-critical-soft px-3 py-2 text-xs text-critical">{error}</p>
            )}
            <DialogFooter className="flex flex-col gap-2 pt-2 sm:flex-row">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="w-full rounded-lg border border-border py-2.5 text-sm font-semibold sm:flex-1"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90 disabled:opacity-60 sm:flex-1"
              >
                {busy ? "Criando..." : "Criar usuário"}
              </button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function generateTempPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let value = "";
  for (let i = 0; i < 12; i += 1) value += chars[Math.floor(Math.random() * chars.length)];
  return `${value}!2`;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
      />
    </label>
  );
}
