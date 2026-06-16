const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ProductInput = {
  name: string;
  category: string;
  stock: number;
  min: number;
  unit: string;
  status: string;
  expiryDays?: number;
};

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY não configurada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { products } = await req.json() as { products?: ProductInput[] };
    if (!products || !Array.isArray(products)) {
      return new Response(JSON.stringify({ error: "products é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildPrompt(products) }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 512, responseMimeType: "application/json" },
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return new Response(JSON.stringify({ error: `Gemini API erro ${response.status}: ${body}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!raw) {
      return new Response(JSON.stringify({ error: "Gemini não retornou texto." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return new Response(JSON.stringify({ error: `Resposta da Gemini não é JSON válido: ${raw.slice(0, 200)}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});