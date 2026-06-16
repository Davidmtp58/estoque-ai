
-- 1) Lock down has_role: only invoked from RLS (definer); revoke public execute
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;

-- 2) Replace permissive policies on products
DROP POLICY IF EXISTS "auth insert products" ON public.products;
DROP POLICY IF EXISTS "auth update products" ON public.products;

CREATE POLICY "managers insert products" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gerente'));

CREATE POLICY "managers update products" ON public.products
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gerente'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gerente'));

-- 3) Movements: any authenticated user, but must record as self
DROP POLICY IF EXISTS "auth insert movements" ON public.movements;
CREATE POLICY "auth insert movements" ON public.movements
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 4) Alerts: only admins/managers can create
DROP POLICY IF EXISTS "auth insert alerts" ON public.alerts;
CREATE POLICY "managers insert alerts" ON public.alerts
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gerente'));

-- 5) Explicit deny on user_roles writes for authenticated/anon (only service_role via edge functions can write)
CREATE POLICY "deny insert user_roles" ON public.user_roles
  AS RESTRICTIVE FOR INSERT TO authenticated, anon
  WITH CHECK (false);

CREATE POLICY "deny update user_roles" ON public.user_roles
  AS RESTRICTIVE FOR UPDATE TO authenticated, anon
  USING (false) WITH CHECK (false);

CREATE POLICY "deny delete user_roles" ON public.user_roles
  AS RESTRICTIVE FOR DELETE TO authenticated, anon
  USING (false);

-- 6) Realtime authorization: limit subscriptions to products/movements topics
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth subscribe inventory topics" ON realtime.messages;
CREATE POLICY "auth subscribe inventory topics" ON realtime.messages
  FOR SELECT TO authenticated
  USING (
    (realtime.topic() IN ('products', 'movements'))
    OR (realtime.topic() LIKE 'products:%')
    OR (realtime.topic() LIKE 'movements:%')
  );
