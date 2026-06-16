import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PackagePlus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ProductsTopBar } from "@/components/products-top-bar";
import { ProductsStats } from "@/components/products-stats";
import { ProductsList } from "@/components/products-list";
import { ProductFormModal } from "@/components/product-form-modal";

export const Route = createFileRoute("/_authenticated/")({
  component: ProductsPage,
});

function ProductsPage() {
  const [openNew, setOpenNew] = useState(false);
  return (
    <AppShell active="produtos">
      <div className="mx-auto w-full max-w-md md:max-w-[1100px] md:p-8">
        <ProductsTopBar />
        <div className="px-5 pt-5 md:px-0 md:pt-8">
          <ProductsStats />
        </div>
        <div className="px-5 pb-24 pt-6 md:px-0">
          <ProductsList />
        </div>
      </div>
      <div className="fixed bottom-20 right-5 z-10 md:bottom-8 md:right-8">
        <button
          type="button"
          onClick={() => setOpenNew(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-lg hover:bg-primary/90"
        >
          <PackagePlus className="size-5" />
          Novo produto
        </button>
      </div>
      <ProductFormModal open={openNew} onOpenChange={setOpenNew} />
    </AppShell>
  );
}