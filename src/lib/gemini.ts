import type { Product } from "./products-data";
import type { ProductExtras } from "./products-store";
import { supabase } from "@/integrations/supabase/client";

export type GeminiAnalysis = {
  resumo: string;
  produto_destaque: {
    nome: string;
    recomendacao: string;
    mensagem_whatsapp: string;
  };
};

type ProductInput = Product & ProductExtras;

export async function analyzeStock(products: ProductInput[]): Promise<GeminiAnalysis> {
  const payload = products.map((p) => ({
    name: p.name,
    category: p.category,
    stock: p.stock,
    min: p.min,
    unit: p.unit,
    status: p.status,
    expiryDays: p.expiryDays,
  }));

  const { data, error } = await supabase.functions.invoke("gemini-analyze", {
    body: { products: payload },
  });

  if (error) throw new Error(error.message || "Falha ao chamar gemini-analyze");
  if (data && typeof data === "object" && "error" in data && data.error) {
    throw new Error(String((data as { error: string }).error));
  }
  return data as GeminiAnalysis;
}
