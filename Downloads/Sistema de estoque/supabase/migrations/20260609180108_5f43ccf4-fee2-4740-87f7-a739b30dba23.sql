
-- Status auto-computer
CREATE OR REPLACE FUNCTION public.compute_product_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.expiry_date IS NOT NULL AND NEW.expiry_date <= (CURRENT_DATE + INTERVAL '3 days') THEN
    NEW.status := 'critico';
  ELSIF NEW.min_quantity > 0 AND NEW.quantity <= (NEW.min_quantity::numeric * 0.4) THEN
    NEW.status := 'critico';
  ELSIF NEW.quantity < NEW.min_quantity THEN
    NEW.status := 'atencao';
  ELSE
    NEW.status := 'estavel';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS products_set_status ON public.products;
CREATE TRIGGER products_set_status
BEFORE INSERT OR UPDATE OF quantity, min_quantity, expiry_date
ON public.products
FOR EACH ROW EXECUTE FUNCTION public.compute_product_status();

-- Movement → stock
CREATE OR REPLACE FUNCTION public.apply_movement()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.product_id IS NULL THEN
    RETURN NEW;
  END IF;
  IF NEW.type = 'entrada' THEN
    UPDATE public.products SET quantity = quantity + NEW.quantity WHERE id = NEW.product_id;
  ELSIF NEW.type = 'saida' THEN
    UPDATE public.products SET quantity = GREATEST(0, quantity - NEW.quantity) WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS movements_apply ON public.movements;
CREATE TRIGGER movements_apply
AFTER INSERT ON public.movements
FOR EACH ROW EXECUTE FUNCTION public.apply_movement();

-- Recompute statuses for existing rows
UPDATE public.products SET quantity = quantity;

-- Realtime
ALTER TABLE public.products REPLICA IDENTITY FULL;
ALTER TABLE public.movements REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.movements;
