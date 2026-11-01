import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getAllObligations, setObligationActive } from '$features/obligations/obligation.queries';
import { createObligation, updateObligationWithCycle } from '$features/obligations/obligation.service';
import { getActiveCycle } from '$features/cycles/cycle.queries';
import { readDay, readPositiveInt, readText } from '$lib/server/form';

export const load: PageServerLoad = async () => {
	const [obligations, active] = await Promise.all([getAllObligations(), getActiveCycle()]);
	return { obligations, hasActiveCycle: !!active };
};

function readObligation(form: FormData) {
	const name = readText(form, 'name');
	const amount = readPositiveInt(form, 'amount');
	const dueDay = readDay(form, 'dueDay');
	// Jumlah tahap pembayaran per siklus (1-5). Kosong/tidak valid → 1 (sekali bayar)
	const installments = Math.min(readPositiveInt(form, 'installments') ?? 1, 5);
	return name && amount && dueDay ? { name, amount, dueDay, installments } : null;
}

export const actions: Actions = {
	create: async ({ request }) => {
		const form = await request.formData();
		const data = readObligation(form);
		if (!data) return fail(400, { message: 'Nama, nominal, dan tanggal (1-31) wajib diisi.' });
		await createObligation(data, form.get('addToCurrentCycle') === '1');
	},

	update: async ({ request }) => {
		const form = await request.formData();
		const id = readPositiveInt(form, 'id');
		const data = readObligation(form);
		if (!id || !data) return fail(400, { message: 'Data tagihan tidak valid.' });
		await updateObligationWithCycle(id, data, form.get('addToCurrentCycle') === '1');
	},

	toggle: async ({ request }) => {
		const form = await request.formData();
		const id = readPositiveInt(form, 'id');
		if (!id) return fail(400, { message: 'Tagihan tidak valid.' });
		await setObligationActive(id, form.get('isActive') === '1');
	}
};
