import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bot, Zap, Smartphone, Check, Clipboard, ArrowLeft, TriangleAlert, RefreshCw } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Toast } from "@/components/toast";
import { useProductsStore } from "@/lib/products-store";
import { analyzeStock, type GeminiAnalysis } from "@/lib/gemini";

type AiState = { status: "idle" } | { status: "loading" } | { status: "ok"; data: GeminiAnalysis } | { status: "error"; message: string };

export function SuggestionScreen() {
  const { products, loading } = useProductsStore();
  const [aiState, setAiState] = useState<AiState>({ status: "idle" });
  const [message, setMessage] = useState("");
  const [applied, setApplied] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: "", visible: false });
  const ranRef = useRef(false);
  const totals = useMemo(() => ({ total: products.length, critical: products.filter((p) => p.status === "critical").length, expiring: products.filter((p) => p.expiryDays !== undefined && p.expiryDays <= 7).length }), [products]);
  const target = useMemo(() => { const ex = products.filter((p) => p.expiryDays !== undefined).sort((a,b)=>(a.expiryDays??0)-(b.expiryDays??0)); return ex.length > 0 ? ex[0] : (products.find((p)=>p.status==="critical")??products[0]); }, [products]);
  const runAnalysis = useCallback(async () => {
    if (loading || products.length === 0) return;
    setAiState({ status: "loading" }); setApplied(false);
    try {
      const data = await analyzeStock(products);
      setAiState({ status: "ok", data });
      setMessage(data.produto_destaque.mensagem_whatsapp);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      setAiState({ status: "error", message: msg });
      if (target) setMessage("OFERTA: " + target.name + " com 30% OFF hoje!");
    }
  }, [products, loading, target]);
  useEffect(() => { if (!loading && products.length > 0 && !ranRef.current) { ranRef.current = true; runAnalysis(); } }, [loading, products, runAnalysis]);
  function showToast(text: string) { setToast({ message: text, visible: true }); setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2800); }
  function handleApply() { if (applied) return; setApplied(true); showToast("Sugestão aplicada! Estoque atualizado."); }
  async function handleCopy() { try { await navigator.clipboard.writeText(message); showToast("Mensagem copiada!"); } catch { showToast("Não foi possível copiar."); } }
  if (loading) return <p className="text-center text-sm text-muted-foreground">Carregando dados do estoque...</p>;
  if (!target) return <p className="text-center text-sm text-muted-foreground">Nenhum produto disponível para análise.</p>;
  const aiOk = aiState.status === "ok";
  const destaque = aiOk ? aiState.data.produto_destaque : null;
  const resumoTexto = aiOk ? aiState.data.resumo : null;
  const nomeDestaque = destaque?.nome ?? target.name;
  const recomendacao = destaque?.recomendacao ?? (target.expiryDays !== undefined ? "Este produto vence em " + target.expiryDays + " dia(s) — aplique 30% OFF para girar." : "Estoque crítico — reponha ou faça promoção.");
  const expiryLabel = target.expiryDays !== undefined ? "Vence em " + target.expiryDays + " " + (target.expiryDays === 1 ? "dia" : "dias") : (target.status === "critical" ? "Estoque crítico" : "Atenção");
  const level = target.status === "critical" ? "Crítico" : target.status === "warning" ? "Atenção" : "Estável";
  return (
    <>
      <Toast message={toast.message} visible={toast.visible} />
      <div className="mx-auto flex max-w-[680px] flex-col gap-5">
        <section className="animate-fade-slide-up rounded-xl bg-teal p-6 text-white shadow-sm" style={{ animationDelay: "0ms" }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15"><Bot className="h-6 w-6 text-white" /></div>
              <div><h1 className="text-xl font-bold leading-tight">Sugestão da IA</h1><p className="text-sm text-white/70">Análise inteligente do seu estoque</p></div>
            </div>
            <button type="button" onClick={() => { ranRef.current = false; runAnalysis(); }} disabled={aiState.status === "loading"} className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25 disabled:opacity-50">
              <RefreshCw className={cn("h-3.5 w-3.5", aiState.status === "loading" && "animate-spin")} />
              {aiState.status === "loading" ? "Analisando..." : "🔄 Atualizar análise"}
            </button>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {[{ value: String(totals.total), label: "Total" }, { value: String(totals.critical), label: "Críticos" }, { value: String(totals.expiring), label: "Vencimentos" }].map((s) => (
              <div key={s.label} className="flex items-baseline gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-sm"><span className="font-bold">{s.value}</span><span className="text-white/80">{s.label}</span></div>
            ))}
          </div>
          <div className="mt-4 min-h-[2rem]">
            {aiState.status === "loading" && <p className="animate-pulse text-xs italic text-white/60">Analisando estoque com IA...</p>}
            {aiState.status === "error" && <p className="text-xs italic text-white/60">⚠️ IA indisponível — exibindo análise local. ({aiState.message.slice(0, 80)})</p>}
            {resumoTexto && <p className="text-sm leading-relaxed text-white/85">{resumoTexto}</p>}
          </div>
          <p className="mt-3 text-xs text-white/50">{aiOk ? "Análise gerada pela Gemini AI" : "Análise gerada agora"}</p>
        </section>
        <section className="animate-fade-slide-up rounded-xl border-l-4 border-critical bg-card p-6 shadow-sm" style={{ animationDelay: "80ms" }}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-foreground">{nomeDestaque}</h2>
            <span className="animate-pulse-badge rounded-full bg-critical px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">{expiryLabel}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{target.category}</p>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estoque atual</p><p className="mt-1 text-2xl font-bold text-foreground">{target.stock} {target.unit}.</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mínimo</p><p className="mt-1 text-2xl font-bold text-foreground">{target.min} {target.unit}.</p></div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
            <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Situação</p><p className="mt-1 text-xl font-bold text-critical">{expiryLabel}</p></div>
            <span className="ml-auto rounded-full bg-critical/10 px-3 py-1 text-xs font-semibold text-critical">Nível: {level}</span>
          </div>
        </section>
        <section className="animate-fade-slide-up rounded-xl border p-6 shadow-sm" style={{ animationDelay: "160ms", backgroundColor: "#FFFBEB", borderColor: "var(--warning)" }}>
          <div className="flex items-center gap-2"><Zap className="h-5 w-5 text-warning" fill="currentColor" /><h3 className="font-bold text-warning">{aiOk ? "Recomendação da Gemini AI" : "Recomendação da IA"}</h3></div>
          {aiState.status === "loading" ? (<div className="mt-3 space-y-2"><div className="h-3 w-full animate-pulse rounded bg-warning/20" /><div className="h-3 w-3/4 animate-pulse rounded bg-warning/20" /></div>) : (<p className="mt-3 text-sm leading-relaxed text-foreground/80">{recomendacao}</p>)}
          <div className="mt-4 flex flex-wrap items-center gap-2">{["30% OFF", "Ofertas", "WhatsApp"].map((tag) => (<span key={tag} className="rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold text-teal">{tag}</span>))}</div>
        </section>
        <section className="animate-fade-slide-up rounded-xl bg-card p-6 shadow-sm" style={{ animationDelay: "240ms" }}>
          <div className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-teal" /><h3 className="text-xs font-semibold uppercase tracking-wide text-teal">Mensagem pronta para WhatsApp</h3></div>
          {aiState.status === "loading" ? (<div className="mt-3 space-y-2">{[0,1,2,3].map((i)=>(<div key={i} className={cn("h-3 animate-pulse rounded bg-muted", i===3?"w-1/2":"w-full")} />))}</div>) : (<><textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} aria-label="Mensagem do WhatsApp editável" className="mt-3 w-full resize-none rounded-lg border p-4 text-sm leading-relaxed text-foreground/90 outline-none focus:ring-2 focus:ring-success/40" style={{ backgroundColor: "#F0FDF4", borderColor: "var(--success)" }} /><p className="mt-1.5 text-right text-xs text-muted-foreground">{message.length} caracteres</p></>)}
        </section>
        <div className="animate-fade-slide-up flex flex-col gap-3" style={{ animationDelay: "320ms" }}>
          <button onClick={handleApply} disabled={aiState.status === "loading"} className={cn("flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-white transition-colors disabled:opacity-50", applied ? "bg-success" : "bg-teal hover:bg-teal/90")}><Check className="h-4 w-4" />{applied ? "Sugestão aplicada" : "Aplicar sugestão"}</button>
          <button onClick={handleCopy} disabled={aiState.status === "loading" || !message} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-teal bg-card px-5 py-3.5 text-sm font-semibold text-teal transition-colors hover:bg-teal/5 disabled:opacity-50"><Clipboard className="h-4 w-4" />Copiar mensagem</button>
          <Link to="/" className="mx-auto flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="h-4 w-4" />Voltar</Link>
        </div>
        <p className="mb-4 flex items-start gap-1.5 text-xs italic leading-relaxed text-muted-foreground"><TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />A IA sugere ações com base no histórico do estoque, mas a decisão final deve ser tomada pelo responsável.</p>
      </div>
    </>
  );
}
