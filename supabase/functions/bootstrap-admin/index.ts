import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(url, service);

    // Allow only when no admin exists yet
    const { count } = await admin.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "admin");
    if ((count ?? 0) > 0) {
      return new Response(JSON.stringify({ error: "Admin já existe" }), { status: 403, headers: { ...cors, "content-type": "application/json" } });
    }

    const { email, password, name } = await req.json();
    if (!email || !password) return new Response(JSON.stringify({ error: "email e password obrigatórios" }), { status: 400, headers: { ...cors, "content-type": "application/json" } });

    const { data: created, error } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { name: name ?? "Administrador", cargo: "Administrador", branch: "", role: "admin", must_change_password: false },
    });
    if (error) throw error;
    await admin.from("profiles").upsert({ user_id: created.user!.id, email, name: name ?? "Administrador", cargo: "Administrador", branch: "", ativo: true, must_change_password: false });
    await admin.from("user_roles").upsert({ user_id: created.user!.id, role: "admin" });
    return new Response(JSON.stringify({ ok: true, userId: created.user!.id }), { headers: { ...cors, "content-type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), { status: 500, headers: { ...cors, "content-type": "application/json" } });
  }
});