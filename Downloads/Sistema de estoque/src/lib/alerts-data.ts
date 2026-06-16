export type AlertStatus = "critico" | "atencao";

export type StockAlert = {
  id: string;
  name: string;
  current: number;
  min: number;
  status: AlertStatus;
  expiryDays: number | null;
};

export const stockAlerts: StockAlert[] = [
  { id: "oleo-soja", name: "Óleo de Soja 900ml", current: 3, min: 10, status: "critico", expiryDays: null },
  { id: "acucar-cristal", name: "Açúcar Cristal 1kg", current: 6, min: 15, status: "critico", expiryDays: null },
  { id: "iogurte-natural", name: "Iogurte Natural 170g", current: 48, min: 20, status: "critico", expiryDays: 2 },
  { id: "cafe-tradicional", name: "Café Tradicional 250g", current: 9, min: 10, status: "atencao", expiryDays: null },
  { id: "macarrao-espaguete", name: "Macarrão Espaguete 500g", current: 11, min: 18, status: "atencao", expiryDays: null },
  { id: "biscoito-recheado", name: "Biscoito Recheado 130g", current: 7, min: 12, status: "atencao", expiryDays: null },
];

export const criticalCount = stockAlerts.filter((a) => a.status === "critico").length;
export const warningCount = stockAlerts.filter((a) => a.status === "atencao").length;