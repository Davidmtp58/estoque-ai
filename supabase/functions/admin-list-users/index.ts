import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { data: profiles } = await admin.from("profiles").select("user_id,name,email,cargo,branch,ativo,must_change_password,created_at").order("created_at", { ascending: false });
    const { data: roles } = await admin.from("user_roles").select("user_id,role");
    const roleMap = new Map<string, string>();
    roles?.forEach((r) => roleMap.set(r.user_id, r.role));
    const users = (profiles ?? []).map((p) => ({ ...p, role: roleMap.get(p.user_id) ?? "estoquista" }));
    return new Response(JSON.stringify({ users }), { headers: { ...cors, "content-type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), { status: 500, headers: { ...cors, "content-type": "application/json" } });
  }
});