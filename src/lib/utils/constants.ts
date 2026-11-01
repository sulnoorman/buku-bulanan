export const APP_NAME = 'Buku Bulanan';

/** Tanggal reset siklus default (bisa diubah user saat konfirmasi siklus baru) */
export const DEFAULT_DUE_DAY = 26;

/** Tagihan dianggap "segera jatuh tempo" jika sisa hari <= nilai ini */
export const DUE_SOON_DAYS = 3;

export const EXPENSE_CATEGORIES = [
	{ value: 'Makanan', label: 'Makanan' },
	{ value: 'Transport', label: 'Transport' },
	{ value: 'Belanja', label: 'Belanja' },
	{ value: 'Hiburan', label: 'Hiburan' },
	{ value: 'Kesehatan', label: 'Kesehatan' },
	{ value: 'Lainnya', label: 'Lainnya' }
] as const;
