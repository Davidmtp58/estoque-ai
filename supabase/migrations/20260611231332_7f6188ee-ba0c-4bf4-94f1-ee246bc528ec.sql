
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS perishable boolean NOT NULL DEFAULT true;

-- Backfill expiry dates for products that don't have one
UPDATE public.products SET expiry_date = (CURRENT_DATE + INTERVAL '2 days')::date
  WHERE expiry_date IS NULL AND name = 'Iogurte Natural 170g';
UPDATE public.products SET expiry_date = DATE '2027-06-01'
  WHERE expiry_date IS NULL AND name = 'Feijão Preto';
UPDATE public.products SET perishable = false, expiry_date = NULL
  WHERE name = 'Sabão em Pó 1kg';
UPDATE public.products SET expiry_date = DATE '2027-12-31'
  WHERE expiry_date IS NULL AND perishable = true;
