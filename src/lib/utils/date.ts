/**
 * Helper tanggal. Semua tanggal disimpan sebagai string "YYYY-MM-DD" (waktu lokal).
 * Kunci logika: tanggal 31 di bulan Februari otomatis dianggap tanggal terakhir bulan itu.
 */

const pad = (n: number) => String(n).padStart(2, '0');

export function toISODate(d: Date): string {
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayISO(): string {
	return toISODate(new Date());
}

/** Buat tanggal dengan "day" yang dibatasi ke jumlah hari di bulan tsb. */
function dateInMonth(year: number, month: number, day: number): Date {
	const lastDay = new Date(year, month + 1, 0).getDate();
	return new Date(year, month, Math.min(day, lastDay));
}

/**
 * Tanggal reset siklus terakhir yang sudah lewat/hari ini.
 * Contoh dueDay=26: hari ini 1 Nov → 26 Okt; hari ini 27 Nov → 26 Nov.
 */
export function lastResetDate(dueDay: number, now = new Date()): string {
	const thisMonth = dateInMonth(now.getFullYear(), now.getMonth(), dueDay);
	if (now.getDate() >= thisMonth.getDate()) return toISODate(thisMonth);
	return toISODate(dateInMonth(now.getFullYear(), now.getMonth() - 1, dueDay));
}

/**
 * Tanggal jatuh tempo tagihan di dalam siklus:
 * kemunculan pertama `dueDay` pada/sesudah tanggal mulai siklus.
 * Contoh: siklus mulai 26 Okt, tagihan tgl 5 → 5 Nov; tagihan tgl 28 → 28 Okt.
 */
export function billDueDate(cycleStart: string, dueDay: number): string {
	const start = new Date(cycleStart);
	const candidate = dateInMonth(start.getFullYear(), start.getMonth(), dueDay);
	if (candidate >= start) return toISODate(candidate);
	return toISODate(dateInMonth(start.getFullYear(), start.getMonth() + 1, dueDay));
}

/** Selisih hari dari hari ini ke tanggal target (negatif = sudah lewat). */
export function daysUntil(isoDate: string, now = new Date()): number {
	const target = new Date(isoDate);
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}
