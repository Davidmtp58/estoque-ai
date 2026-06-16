import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import type { AppRole } from "@/lib/auth-context";
import type { AdminUser } from "@/routes/_authenticated/admin/usuarios";

export function UserEditModal({ user, onClose, onChanged }: { user: AdminUser; onClose: () => void; onChanged: () => void }) {
  const [form, setForm] = useState({ name: user.name, cargo: user.cargo, branch: user.branch, role: user.role as AppRole, ativo: user.ativo });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPwd, setNewPwd] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);

  async function call(action: string, extra: Record<string, unknown> = {}) {
    setError(null); setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-user-action", { body: { action, userId: user.user_id, ...extra } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
      return null;
    } finally { setBusy(false); }
  }

  async function save() {
    const r = await call("update", form);
    if (r) { onChanged(); onClose(); }
  }
  async function reset() {
    const r = await call("reset_password");
    if (r?.tempPassword) setNewPwd(r.tempPassword as string);
  }
  async function remove() {
    const r = await call("delete");
    if (r) { onChanged(); onClose(); }
  }

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Editar usuário</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-3">
          <p className="text-xs text-muted-foreground">{user.email}</p>
          <Field label="Nome" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="Cargo" value={form.cargo} onChange={(v) => setForm({ ...form, cargo: v })} />
          <Field label="Filial" value={form.branch} onChange={(v) => setForm({ ...form, branch: v })} />
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Role</span>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as AppRole })} className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm">
              <option value="admin">Admin</option>
              <option value="gerente">Gerente</option>
              <option value="estoquista">Estoquista</option>
            </select>
          </label>
          <label className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 text-sm">
            <span className="font-medium text-foreground">{form.ativo ? "Ativo" : "Inativo"}</span>
            <Switch checked={form.ativo} onCheckedChange={(v) => setForm({ ...form, ativo: v })} />
          </label>
          {error && <p className="rounded-md bg-critical-soft px-3 py-2 text-xs text-critical">{error}</p>}
          {newPwd && (
            <div className="rounded-lg bg-secondary p-3 text-sm">
              <p className="mb-1 text-xs font-semibold text-foreground">Nova senha temporária:</p>
              <code className="block text-center text-base font-bold tracking-widest text-primary">{newPwd}</code>
            </div>
          )}
        </div>
        <DialogFooter className="flex flex-col gap-2 sm:flex-col">
          <button type="button" disabled={busy} onClick={save} className="w-full rounded-lg bg-primary py-2.5 text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90 disabled:opacity-60">Salvar alterações</button>
          <button type="button" disabled={busy} onClick={reset} className="w-full rounded-lg border border-primary py-2.5 text-sm font-semibold text-primary hover:bg-primary/5">Resetar senha</button>
          {!confirmDel ? (
            <button type="button" disabled={busy} onClick={() => setConfirmDel(true)} className="w-full rounded-lg bg-critical/10 py-2.5 text-sm font-semibold text-critical hover:bg-critical/20">Remover usuário</button>
          ) : (
            <div className="flex gap-2">
              <button type="button" onClick={() => setConfirmDel(false)} className="flex-1 rounded-lg border border-border py-2.5 text-sm">Cancelar</button>
              <button type="button" disabled={busy} onClick={remove} className="flex-1 rounded-lg bg-critical py-2.5 text-sm font-bold text-critical-foreground hover:bg-critical/90">Confirmar remoção</button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" />
    </label>
  );
}