import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatMexicanPhoneNumber(number: string) {
	const cleaned = number.replace(/\D/g, "");
	return cleaned.replace(/^(\d{3})(\d{3})(\d{4})$/, "($1) $2-$3");
}
