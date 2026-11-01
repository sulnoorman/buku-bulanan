/** Helper kecil untuk membaca FormData dengan aman di form actions. */

export function readText(form: FormData, key: string): string | null {
	const value = form.get(key);
	return typeof value === 'string' && value.trim() ? value.trim() : null;
}

/** Angka bulat positif (nominal Rupiah, id, tanggal). null jika tidak valid. */
export function readPositiveInt(form: FormData, key: string): number | null {
	const n = Number(form.get(key));
	return Number.isInteger(n) && n > 0 ? n : null;
}

export function readDay(form: FormData, key: string): number | null {
	const n = readPositiveInt(form, key);
	return n !== null && n <= 31 ? n : null;
}
