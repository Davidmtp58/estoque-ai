import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function tempPassword() {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < 12; i++) s += c[Math.floor(Math.random() * c.length)];
  return s + "!2";
}

async function isAdminUser(admin: ReturnType<typeof createClient>, userId: string) {
  const { data, error } = await admin
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: me } = await userClient.auth.getUser();
    if (!me.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...cors, "content-type": "application/json" } });

    const admin = createClient(url, service);
    if (!(await isAdminUser(admin, me.user.id))) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...cors, "content-type": "application/json" } });

    const body = await req.json();
    const { action, userId } = body as { action: string; userId: string };
    if (!action || !userId) return new Response(JSON.stringify({ error: "Parâmetros inválidos" }), { status: 400, headers: { ...cors, "content-type": "application/json" } });

    if (action === "reset_password") {
      const password = tempPassword();
      const { error } = await admin.auth.admin.updateUserById(userId, { password });
      if (error) throw error;
      await admin.from("profiles").update({ must_change_password: true }).eq("user_id", userId);
      return new Response(JSON.stringify({ ok: true, tempPassword: password }), { headers: { ...cors, "content-type": "application/json" } });
    }

    if (action === "delete") {
      if (userId === me.user.id) return new Response(JSON.stringify({ error: "Você não pode remover a si mesmo" }), { status: 400, headers: { ...cors, "content-type": "application/json" } });
      const { error } = await admin.auth.admin.deleteUser(userId);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, "content-type": "application/json" } });
    }

    if (action === "update") {
      const { name, cargo, branch, role, ativo } = body as Record<string, unknown>;
      const profileUpdate: Record<string, unknown> = {};
      if (name !== undefined) profileUpdate.name = name;
      if (cargo !== undefined) profileUpdate.cargo = cargo;
      if (branch !== undefined) profileUpdate.branch = branch;
      if (ativo !== undefined) profileUpdate.ativo = ativo;
      if (Object.keys(profileUpdate).length) {
        const { error } = await admin.from("profiles").update(profileUpdate).eq("user_id", userId);
        if (error) throw error;
      }
      if (role) {
        await admin.from("user_roles").delete().eq("user_id", userId);
        const { error } = await admin.from("user_roles").insert({ user_id: userId, role });
        if (error) throw error;
      }
      return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, "content-type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Ação desconhecida" }), { status: 400, headers: { ...cors, "content-type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), { status: 500, headers: { ...cors, "content-type": "application/json" } });
  }
});