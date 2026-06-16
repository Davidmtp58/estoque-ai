import type { Product } from "./products-data";
import type { ProductExtras } from "./products-store";

export type GeminiAnalysis = {
  resumo: string;
  produto_destaque: {
    nome: string;
    recomendacao: string;
    mensagem_whatsapp: string;
  };
};

type ProductInput = Product & ProductExtras;

function buildPrompt(products: ProductInput[]): string {
  const critical = products.filter((p) => p.status === "critical");
  const warning = products.filter((p) => p.status === "warning");
  const expiring = products.filter((p) => p.expiryDays !== undefined && p.expiryDays <= 7);

  const lines = products
    .filter((p) => p.status !== "stable")
    .map((p) => {
      const validade = p.expiryDays !== undefined ? `, vence em ${p.expiryDays} dia(s)` : "";
      return `- ${p.name} (${p.category}): estoque ${p.stock} ${p.unit}, mínimo ${p.min} ${p.unit}, situação: ${p.status}${validade}`;
    })
    .join("\n");

  return `Você é um assistente de gestão de estoque para supermercado.
Analise os dados abaixo e responda EXCLUSIVAMENTE com um objeto JSON válido, sem markdown, sem blocos de código, sem texto antes ou depois.

Situação atual:
- Total de produtos com alerta: ${critical.length + warning.length}
- Críticos: ${critical.length}
- Em atenção: ${warning.length}
- Próximos do vencimento (≤7 dias): ${expiring.length}

Produtos com alertas:
${lines || "Nenhum produto em alerta no momento."}

Responda com este JSON exato (substitua os valores pelos reais):
{
  "resumo": "análise objetiva do estoque em até 2 linhas, mencionando os pontos mais urgentes",
  "produto_destaque": {
    "nome": "nome exato do produto mais crítico ou próximo de vencer",
    "recomendacao": "ação concreta a tomar para este produto (máximo 1 frase)",
    "mensagem_whatsapp": "mensagem promocional pronta para WhatsApp, com emojis, para girar este produto"
  }
}`;
}

export async function analyzeStock(products: ProductInput[]): Promise<GeminiAnalysis> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!apiKey) throw new Error("VITE_GEMINI_API_KEY não configurada no .env");

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(products) }] }],
        generationConfig: {
          temperature: 0.3, // 
          maxOutputTokens: 512,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Gemini API erro ${response.status}: ${body}`);
  }

  const data = await response.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!raw) throw new Error("Gemini não retornou texto.");

  try {
    return JSON.parse(raw) as GeminiAnalysis;
  } catch {
    throw new Error(`Resposta da Gemini não é JSON válido: ${raw.slice(0, 200)}`);
  }
}
