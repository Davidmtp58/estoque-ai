export type ProductStatus = "critical" | "warning" | "stable";

export type Product = {
  id: string;
  name: string;
  category: string;
  stock: number;
  min: number;
  unit: string;
  status: ProductStatus;
  expiryDays?: number;
};

export const products: Product[] = [
  { id: "p1", name: "Arroz Tio João 5kg", category: "Alimentos", stock: 24, min: 10, unit: "un", status: "stable" },
  { id: "p2", name: "Óleo de Soja 900ml", category: "Mercearia", stock: 3, min: 10, unit: "un", status: "critical" },
  { id: "p3", name: "Feijão Carioca 1kg", category: "Alimentos", stock: 18, min: 8, unit: "un", status: "stable" },
  { id: "p4", name: "Açúcar Cristal 1kg", category: "Alimentos", stock: 6, min: 15, unit: "un", status: "critical" },
  { id: "p5", name: "Café Tradicional 250g", category: "Bebidas", stock: 9, min: 10, unit: "un", status: "warning" },
  { id: "p6", name: "Macarrão Espaguete 500g", category: "Alimentos", stock: 11, min: 18, unit: "un", status: "warning" },
  { id: "p7", name: "Iogurte Natural 170g", category: "Laticínios", stock: 48, min: 20, unit: "un", status: "critical", expiryDays: 2 },
  { id: "p8", name: "Sabão em Pó 1kg", category: "Limpeza", stock: 32, min: 10, unit: "un", status: "stable" },
  { id: "p9", name: "Leite Integral 1L", category: "Laticínios", stock: 55, min: 20, unit: "un", status: "stable" },
  { id: "p10", name: "Biscoito Recheado 130g", category: "Alimentos", stock: 7, min: 12, unit: "un", status: "warning" },
];

export const categories = ["Todos", "Alimentos", "Mercearia", "Laticínios", "Bebidas", "Limpeza"];
export const totalProducts = products.length;
export const criticalCount = 5;