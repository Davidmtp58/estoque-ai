import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import type { Product, ProductStatus } from "./products-data";
import type { TablesUpdate } from "@/integrations/supabase/types";

export type Movement = {
  id: string;
  productId: string;
  productName: string;
  type: "entrada" | "saida";
  quantity: number;
  date: string;
  lote?: string;
  notaFiscal?: string;
  fornecedor?: string;
  motivo?: string;
  notes?: string;
  responsavel: string;
};

const dbToClientStatus: Record<string, ProductStatus> = {
  critico: "critical",
  atencao: "warning",
  estavel: "stable",
};

type ProductRow = {
  id: string; name: string; category: string; unit: string;
  quantity: number; min_quantity: number;
  status: string; expiry_date: string | null;
  ean: string | null; supplier: string | null; active: boolean;
  perishable: boolean | null;
};
type MovementRow = {
  id: string; product_id: string | null; product_name: string;
  type: string; quantity: number; date: string;
  batch: string | null; invoice: string | null;
  supplier: string | null; reason: string | null; user_name: string | null;
  notes: string | null;
};

export type ProductExtras = { ean?: string | null; supplier?: string | null; expiryDate?: string | null; perishable?: boolean };

function rowToProduct(r: ProductRow): Product & ProductExtras {
  let expiryDays: number | undefined;
  if (r.expiry_date) {
    const ms = new Date(r.expiry_date + "T00:00:00").getTime() - Date.now();
    expiryDays = Math.max(0, Math.ceil(ms / 86400000));
  }
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    stock: r.quantity,
    min: r.min_quantity,
    unit: r.unit,
    status: dbToClientStatus[r.status] ?? "stable",
    expiryDays,
    ean: r.ean,
    supplier: r.supplier,
    expiryDate: r.expiry_date,
    perishable: r.perishable ?? true,
  };
}

function rowToMovement(r: MovementRow): Movement {
  return {
    id: r.id,
    productId: r.product_id ?? "",
    productName: r.product_name,
    type: r.type === "saida" ? "saida" : "entrada",
    quantity: r.quantity,
    date: r.date,
    lote: r.batch ?? undefined,
    notaFiscal: r.invoice ?? undefined,
    fornecedor: r.supplier ?? undefined,
    motivo: r.reason ?? undefined,
    notes: r.notes ?? undefined,
    responsavel: r.user_name ?? "",
  };
}

export type NewProductInput = {
  name: string; category: string; unit: string;
  stock: number; min: number;
  ean?: string | null; supplier?: string | null; expiryDate?: string | null;
  perishable?: boolean;
};
export type EntradaInput = { productId: string; quantity: number; lote?: string; notaFiscal?: string; fornecedor?: string; date?: string; notes?: string };
export type SaidaInput = { productId: string; quantity: number; lote?: string; motivo: string; date?: string; notes?: string };
export type MutationResult = { ok: true } | { ok: false; error: string };

type Ctx = {
  products: (Product & ProductExtras)[];
  movements: Movement[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addProduct: (p: NewProductInput) => Promise<MutationResult>;
  updateProduct: (id: string, patch: Partial<NewProductInput>) => Promise<MutationResult>;
  deleteProduct: (id: string) => Promise<MutationResult>;
  registerEntrada: (input: EntradaInput) => Promise<MutationResult>;
  registerSaida: (input: SaidaInput) => Promise<MutationResult>;
};

const ProductsContext = createContext<Ctx | null>(null);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const { profile, user } = useAuth();
  const [products, setProducts] = useState<(Product & ProductExtras)[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    const [pRes, mRes] = await Promise.all([
      supabase.from("products").select("*").eq("active", true).order("name"),
      supabase.from("movements").select("*").order("created_at", { ascending: false }).limit(300),
    ]);
    if (pRes.error) { setError(pRes.error.message); return; }
    if (mRes.error) { setError(mRes.error.message); return; }
    setProducts((pRes.data as ProductRow[]).map(rowToProduct));
    setMovements((mRes.data as MovementRow[]).map(rowToMovement));
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      await refresh();
      if (mounted) setLoading(false);
    })();
    const channel = supabase
      .channel("stock-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "movements" }, () => refresh())
      .subscribe();
    return () => { mounted = false; supabase.removeChannel(channel); };
  }, [refresh]);

  const addProduct = useCallback<Ctx["addProduct"]>(async (p) => {
    const { error } = await supabase.from("products").insert({
      name: p.name, category: p.category, unit: p.unit,
      quantity: p.stock, min_quantity: p.min,
      ean: p.ean ?? null, supplier: p.supplier ?? null,
      expiry_date: p.expiryDate ?? null, active: true,
      perishable: p.perishable ?? true,
    });
    if (error) { toast.error(error.message); return { ok: false, error: error.message }; }
    toast.success("Produto criado");
    await refresh();
    return { ok: true };
  }, [refresh]);

  const updateProduct = useCallback<Ctx["updateProduct"]>(async (id, patch) => {
    const upd: TablesUpdate<"products"> = {};
    if (patch.name !== undefined) upd.name = patch.name;
    if (patch.category !== undefined) upd.category = patch.category;
    if (patch.unit !== undefined) upd.unit = patch.unit;
    if (patch.stock !== undefined) upd.quantity = patch.stock;
    if (patch.min !== undefined) upd.min_quantity = patch.min;
    if (patch.ean !== undefined) upd.ean = patch.ean;
    if (patch.supplier !== undefined) upd.supplier = patch.supplier;
    if (patch.expiryDate !== undefined) upd.expiry_date = patch.expiryDate;
    if (patch.perishable !== undefined) upd.perishable = patch.perishable;
    const { error } = await supabase.from("products").update(upd).eq("id", id);
    if (error) { toast.error(error.message); return { ok: false, error: error.message }; }
    toast.success("Produto atualizado");
    await refresh();
    return { ok: true };
  }, [refresh]);

  const deleteProduct = useCallback<Ctx["deleteProduct"]>(async (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    const { error } = await supabase.from("products").update({ active: false }).eq("id", id);
    if (error) { toast.error(error.message); await refresh(); return { ok: false, error: error.message }; }
    toast.success("Produto removido");
    return { ok: true };
  }, [refresh]);

  const registerEntrada = useCallback<Ctx["registerEntrada"]>(async (input) => {
    const prod = products.find((p) => p.id === input.productId);
    if (!prod) return { ok: false, error: "Produto não encontrado" };
    const { error } = await supabase.from("movements").insert({
      product_id: input.productId,
      product_name: prod.name,
      type: "entrada",
      quantity: input.quantity,
      batch: input.lote || null,
      invoice: input.notaFiscal || null,
      supplier: input.fornecedor || null,
      notes: input.notes || null,
      date: input.date ? new Date(input.date).toISOString() : new Date().toISOString(),
      user_name: profile?.name ?? null,
      user_id: user?.id ?? null,
    });
    if (error) { toast.error(error.message); return { ok: false, error: error.message }; }
    toast.success("Entrada registrada");
    await refresh();
    return { ok: true };
  }, [products, profile, user, refresh]);

  const registerSaida = useCallback<Ctx["registerSaida"]>(async (input) => {
    const prod = products.find((p) => p.id === input.productId);
    if (!prod) return { ok: false, error: "Produto não encontrado" };
    if (input.quantity > prod.stock) {
      const msg = `Quantidade indisponível. Estoque atual: ${prod.stock} ${prod.unit}.`;
      toast.error(msg);
      return { ok: false, error: msg };
    }
    const { error } = await supabase.from("movements").insert({
      product_id: input.productId,
      product_name: prod.name,
      type: "saida",
      quantity: input.quantity,
      batch: input.lote || null,
      reason: input.motivo,
      notes: input.notes || null,
      date: input.date ? new Date(input.date).toISOString() : new Date().toISOString(),
      user_name: profile?.name ?? null,
      user_id: user?.id ?? null,
    });
    if (error) { toast.error(error.message); return { ok: false, error: error.message }; }
    toast.success("Saída registrada");
    await refresh();
    return { ok: true };
  }, [products, profile, user, refresh]);

  const value = useMemo<Ctx>(
    () => ({ products, movements, loading, error, refresh, addProduct, updateProduct, deleteProduct, registerEntrada, registerSaida }),
    [products, movements, loading, error, refresh, addProduct, updateProduct, deleteProduct, registerEntrada, registerSaida],
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProductsStore() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProductsStore must be used inside ProductsProvider");
  return ctx;
}