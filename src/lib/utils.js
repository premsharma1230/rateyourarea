import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** Pincode field: digits only (default max 6 for India) */
export function sanitizePincodeInput(value, maxLength = 6) {
  return String(value ?? "")
    .replace(/\D/g, "")
    .slice(0, maxLength);
}
