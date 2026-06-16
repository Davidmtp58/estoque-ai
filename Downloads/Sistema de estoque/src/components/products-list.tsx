import { useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { categories } from "@/lib/products-data";
import { ProductCard } from "@/components/product-card";
import { useProductsStore } from "@/lib/products-store";

export function ProductsList() {
  const { products, loading, error } = useProductsStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = category === "Todos" || p.category === category;
      const matchesQuery = p.name.toLowerCase().includes(query.trim().toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [query, category, products]);

  return (
    <section>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar produto..."
          aria-label="Buscar produto"
          className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((cat) => {
          const isActive = cat === category;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              aria-pressed={isActive}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {cat}
            </button>
          );
        })}
      </div>
      <h2 className="pb-3 pt-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Lista de produtos
        <span className="ml-2 font-medium normal-case tracking-normal text-muted-foreground/70">({filtered.length})</span>
      </h2>
      {loading ? (
        <div className="flex justify-center py-10 text-muted-foreground"><Loader2 className="size-6 animate-spin" /></div>
      ) : error ? (
        <div className="rounded-xl border border-critical/40 bg-critical-soft p-4 text-sm text-critical">Erro ao carregar produtos: {error}</div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          {filtered.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">Nenhum produto encontrado.</p>
        </div>
      )}
    </section>
  );
}