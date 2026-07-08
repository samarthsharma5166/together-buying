import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "Price on request";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Price on request";
  if (amount >= 10000000) return `₹ ${(amount / 10000000).toFixed(amount % 10000000 === 0 ? 0 : 2)} Cr`;
  if (amount >= 100000) return `₹ ${(amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 2)} L`;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export function rangePrice(min?: string | number | null, max?: string | number | null) {
  const start = formatPrice(min);
  const end = formatPrice(max);
  if (start === "Price on request") return end;
  // if (end === "Price on request" || start === end) return start;
  return `${start}`;
}

export function initials(name?: string | null) {
  return (name || "TB").split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "TB";
}


export function calculateDiscount(minPrice:number, maxPrice:number) {
  if (maxPrice <= 0 || minPrice < 0 || minPrice > maxPrice) {
    return { discountPercent: 0, formatedDiscountAmount: "₹0" };
  }

  const discountAmount = maxPrice-minPrice;

  const discount = ((discountAmount) / maxPrice) * 100;

  const discountPercent =  Math.max(1, Math.round(discount)); 
  
  const formatedDiscountAmount = formatPrice(discountAmount);

  return {discountPercent,formatedDiscountAmount}
}