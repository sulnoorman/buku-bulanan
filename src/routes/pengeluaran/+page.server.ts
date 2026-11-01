import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getActiveCycle } from '$features/cycles/cycle.queries';
import { createExpense, deleteExpense, getExpensesByCycle } from '$features/expenses/expense.queries';
import { EXPENSE_CATEGORIES } from '$lib/utils/constants';
import { readPositiveInt, readText } from '$lib/server/form';

export const load: PageServerLoad = async () => {
	const active = await getActiveCycle();
	return {
		hasActiveCycle: !!active,
		expenses: active ? await getExpensesByCycle(active.id) : []
	};
};

export const actions: Actions = {
	add: async ({ request }) => {
		const form = await request.formData();
		const label = readText(form, 'label');
		const amount = readPositiveInt(form, 'amount');
		const date = readText(form, 'date');
		const rawCategory = readText(form, 'category');
		const category = EXPENSE_CATEGORIES.some((c) => c.value === rawCategory) ? rawCategory! : 'Lainnya';
		const active = await getActiveCycle();

		if (!active) return fail(400, { message: 'Belum ada siklus aktif.' });
		if (!label || !amount || !date) return fail(400, { message: 'Keterangan, nominal, dan tanggal wajib diisi.' });

		await createExpense({ cycleId: active.id, label, amount, date, category, note: readText(form, 'note') });
	},

	delete: async ({ request }) => {
		const id = readPositiveInt(await request.formData(), 'id');
		if (!id) return fail(400, { message: 'Pengeluaran tidak valid.' });
		await deleteExpense(id);
	}
};
