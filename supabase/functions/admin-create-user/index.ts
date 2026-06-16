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
    const userClient = createClient(url, anon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: me } = await userClient.auth.getUser();
    if (!me.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...cors, "content-type": "application/json" },
      });
    }

    const admin = createClient(url, service);
    if (!(await isAdminUser(admin, me.user.id))) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...cors, "content-type": "application/json" },
      });
    }

    const { name, email, password: requestedPassword, cargo, branch, role } = await req.json();
    if (!name || !email || !role) {
      return new Response(JSON.stringify({ error: "Campos obrigatórios" }), {
        status: 400,
        headers: { ...cors, "content-type": "application/json" },
      });
    }
    if (!["admin", "gerente", "estoquista"].includes(role)) {
      return new Response(JSON.stringify({ error: "Role inválida" }), {
        status: 400,
        headers: { ...cors, "content-type": "application/json" },
      });
    }

    const password =
      typeof requestedPassword === "string" && requestedPassword.length >= 8
        ? requestedPassword
        : tempPassword();
    const normalizedEmail = String(email).trim().toLowerCase();
    const { data: created, error } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: { name, cargo, branch, role, must_change_password: true },
    });
    if (error) {
      if (/already|exist|registered|duplicate|unique/i.test(error.message)) {
        return new Response(JSON.stringify({ error: "Já existe um usuário cadastrado com esse email." }), {
          status: 409,
          headers: { ...cors, "content-type": "application/json" },
        });
      }
      throw error;
    }

    // Ensure profile + role are present (in case trigger missed any field)
    const { error: profileError } = await admin.from("profiles").upsert({
      user_id: created.user!.id,
      email: normalizedEmail,
      name,
      cargo: cargo ?? "",
      branch: branch ?? "",
      company: "Supermercado Central",
      must_change_password: true,
      ativo: true,
    }, { onConflict: "user_id" });
    if (profileError) throw profileError;

    const { error: deleteRoleError } = await admin.from("user_roles").delete().eq("user_id", created.user!.id);
    if (deleteRoleError) throw deleteRoleError;
    const { error: roleError } = await admin.from("user_roles").insert({ user_id: created.user!.id, role });
    if (roleError) throw roleError;

    return new Response(
      JSON.stringify({ ok: true, tempPassword: password, userId: created.user!.id }),
      {
        headers: { ...cors, "content-type": "application/json" },
      },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...cors, "content-type": "application/json" },
    });
  }
});
