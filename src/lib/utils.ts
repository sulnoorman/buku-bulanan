import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Gabungkan class Tailwind tanpa konflik (konvensi shadcn) */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
