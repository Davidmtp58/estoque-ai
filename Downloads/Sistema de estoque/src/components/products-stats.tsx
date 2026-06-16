import { Boxes, AlertCircle } from "lucide-react";
import { useProductsStore } from "@/lib/products-store";

function pad(value: number) {
  return value < 10 ? `0${value}` : `${value}`;
}

export function ProductsStats() {
  const { products } = useProductsStore();
  const criticalCount = products.filter((p) => p.status === "critical").length;
  const stats = [
    { label: "Total de produtos", value: products.length, icon: Boxes, className: "bg-secondary text-primary", valueClassName: "text-primary" },
    { label: "Críticos", value: criticalCount, icon: AlertCircle, className: "bg-critical-soft text-critical", valueClassName: "text-critical" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:gap-4 md:p-5">
            <div className={`flex size-9 shrink-0 items-center justify-center rounded-full md:size-11 ${stat.className}`}>
              <Icon className="size-4 md:size-5" />
            </div>
            <div className="min-w-0">
              <p className={`text-2xl font-bold leading-none md:text-3xl ${stat.valueClassName}`}>{pad(stat.value)}</p>
              <p className="mt-1 text-xs text-muted-foreground md:text-sm">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}