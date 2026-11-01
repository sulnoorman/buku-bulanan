import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getActiveCycle, getLatestCycle } from '$features/cycles/cycle.queries';
import { needsNewCycle, startNewCycle } from '$features/cycles/cycle.service';
import { getCycleSummary } from '$features/dashboard/dashboard.service';
import {
	settleInstallment,
	undoInstallment,
	type InstallmentKind
} from '$features/bills/bill.queries';
import { createIncome, deleteIncome } from '$features/incomes/income.queries';
import { DEFAULT_DUE_DAY } from '$lib/utils/constants';
import { readDay, readPositiveInt, readText } from '$lib/server/form';

function readKind(form: FormData): InstallmentKind | null {
	const kind = form.get('kind');
	return kind === 'pay' || kind === 'skip' ? kind : null;
}

export const load: PageServerLoad = async () => {
	const active = await getActiveCycle();
	const latest = active ?? (await getLatestCycle());

	return {
		summary: active ? await getCycleSummary(active) : null,
		needsNewCycle: needsNewCycle(active),
		isFirstCycle: !latest,
		dueDay: latest?.dueDay ?? DEFAULT_DUE_DAY
	};
};

export const actions: Actions = {
	startCycle: async ({ request }) => {
		const form = await request.formData();
		const dueDay = readDay(form, 'dueDay');
		const incomeLabel = readText(form, 'incomeLabel');
		const incomeAmount = readPositiveInt(form, 'incomeAmount');

		if (!dueDay || !incomeLabel || !incomeAmount) {
			return fail(400, { message: 'Lengkapi pemasukan utama dan tanggal siklus.' });
		}
		await startNewCycle({ dueDay, incomeLabel, incomeAmount });
	},

	// Bayar / lewati satu bagian tagihan (tagihan biasa = 1 bagian)
	settleBill: async ({ request }) => {
		const form = await request.formData();
		const id = readPositiveInt(form, 'id');
		const kind = readKind(form);
		if (!id || !kind) return fail(400, { message: 'Tagihan tidak valid.' });
		await settleInstallment(id, kind);
	},

	undoBill: async ({ request }) => {
		const form = await request.formData();
		const id = readPositiveInt(form, 'id');
		const kind = readKind(form);
		if (!id || !kind) return fail(400, { message: 'Tagihan tidak valid.' });
		await undoInstallment(id, kind);
	},

	addIncome: async ({ request }) => {
		const form = await request.formData();
		const label = readText(form, 'label');
		const amount = readPositiveInt(form, 'amount');
		const active = await getActiveCycle();

		if (!active) return fail(400, { message: 'Belum ada siklus aktif.' });
		if (!label || !amount) return fail(400, { message: 'Keterangan dan nominal wajib diisi.' });
		await createIncome({ cycleId: active.id, label, amount, type: 'EXTRA' });
	},

	deleteIncome: async ({ request }) => {
		const id = readPositiveInt(await request.formData(), 'id');
		if (!id) return fail(400, { message: 'Pemasukan tidak valid.' });
		await deleteIncome(id);
	}
};
