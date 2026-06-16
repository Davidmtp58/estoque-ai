import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ProductsProvider } from "@/lib/products-store";
import { AuthProvider } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/login" });
    }
    // Check ativo + must_change_password
    const { data: profile } = await supabase
      .from("profiles")
      .select("ativo,must_change_password")
      .eq("user_id", data.user.id)
      .maybeSingle();
    if (profile && profile.ativo === false) {
      await supabase.auth.signOut();
      throw redirect({ to: "/login", search: { inactive: "1" } as never });
    }
    if (profile?.must_change_password && typeof window !== "undefined" && window.location.pathname !== "/trocar-senha") {
      throw redirect({ to: "/trocar-senha" });
    }
    return { user: data.user };
  },
  component: () => (
    <AuthProvider>
      <ProductsProvider>
        <Outlet />
      </ProductsProvider>
    </AuthProvider>
  ),
});