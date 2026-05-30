export type Currency = "CUP" | "USD" | "MLC";

export const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: "CUP", label: "Pesos Cubanos (CUP)", symbol: "$" },
  { value: "USD", label: "Dólares (USD)", symbol: "USD" },
  { value: "MLC", label: "MLC", symbol: "MLC" },
];

export function isCurrency(value: unknown): value is Currency {
  return value === "CUP" || value === "USD" || value === "MLC";
}

export function formatPrice(
  price: number | string,
  currency: Currency = "CUP",
): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  const amount = num.toLocaleString("es-CU", { maximumFractionDigits: 0 });
  switch (currency) {
    case "USD":
      return `USD ${amount}`;
    case "MLC":
      return `MLC ${amount}`;
    case "CUP":
    default:
      return `$${amount} CUP`;
  }
}
