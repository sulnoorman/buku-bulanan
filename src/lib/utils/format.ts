const rupiah = new Intl.NumberFormat('id-ID', {
	style: 'currency',
	currency: 'IDR',
	maximumFractionDigits: 0
});

/** 1500000 → "Rp 1.500.000" */
export function formatRupiah(amount: number): string {
	return rupiah.format(amount);
}

/** Versi ringkas untuk tombol/label sempit: 500000 → "500rb", 1500000 → "1,5jt" */
export function formatRupiahShort(amount: number): string {
	const fmt = (n: number) => n.toLocaleString('id-ID', { maximumFractionDigits: 1 });
	if (amount >= 1_000_000) return `${fmt(amount / 1_000_000)}jt`;
	if (amount >= 1_000) return `${fmt(amount / 1_000)}rb`;
	return String(amount);
}

/** "2026-11-01" → "1 November 2026" */
export function formatTanggal(isoDate: string): string {
	return new Date(isoDate).toLocaleDateString('id-ID', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
}

/** "2026-11-01" → "1 Nov" */
export function formatTanggalPendek(isoDate: string): string {
	return new Date(isoDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}
