// Créer un répertoire libs dans src et créer un fichier utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}



export { cn };