import {
	getBillsByCycle,
	getBillsByCycleIds,
	getBillsForActiveCycle
} from '../bills/bill.queries';
import { toBillView } from '../bills/bill.service';
import type { Bill } from '../bills/bill.schema';
import {
	getIncomesByCycle,
	getIncomesByCycleIds,
	getIncomesForActiveCycle
} from '../incomes/income.queries';
import type { Income } from '../incomes/income.schema';
import {
	getExpensesByCycle,
	getExpensesByCycleIds,
	getExpensesForActiveCycle
} from '../expenses/expense.queries';
import type { Expense } from '../expenses/expense.schema';
import { getActiveCycle, getCompletedCycles, getLatestCycle } from '../cycles/cycle.queries';
import type { Cycle } from '../cycles/cycle.schema';

const sum = (rows: { amount: number }[]) => rows.reduce((total, r) => total + r.amount, 0);

export function buildCycleSummary(
	cycle: Cycle,
	rawBills: Bill[],
	incomes: Income[],
	expenses: Expense[]
) {
	const bills = rawBills.map((b) => toBillView(b, cycle.startDate));
	const doneCount = bills.filter((b) => b.status === 'PAID').length;

	const totalIncome = sum(incomes);
	const totalPaid = bills.reduce((s, b) => s + b.paidAmount, 0);
	const totalUnpaid = bills.reduce((s, b) => s + b.remainingAmount, 0);
	const totalExpenses = sum(expenses);
	const balance = totalIncome - totalPaid - totalExpenses;

	return {
		cycle,
		bills,
		incomes,
		expenses,
		totals: {
			income: totalIncome,
			paid: totalPaid,
			unpaid: totalUnpaid,
			expenses: totalExpenses,
			balance,
			safeToSpend: balance - totalUnpaid
		},
		counts: { paid: doneCount, total: bills.length }
	};
}

export async function getCycleSummary(cycle: Cycle) {
	const [rawBills, incomes, expenses] = await Promise.all([
		getBillsByCycle(cycle.id),
		getIncomesByCycle(cycle.id),
		getExpensesByCycle(cycle.id)
	]);
	return buildCycleSummary(cycle, rawBills, incomes, expenses);
}

/**
 * Ambil seluruh data Dashboard dalam SATU kali round-trip paralel ke Turso
 * (tidak menunggu getActiveCycle selesai dulu baru query tagihan/pemasukan/pengeluaran).
 */
export async function getActiveDashboardData() {
	const [active, latest, rawBills, incomes, expenses] = await Promise.all([
		getActiveCycle(),
		getLatestCycle(),
		getBillsForActiveCycle(),
		getIncomesForActiveCycle(),
		getExpensesForActiveCycle()
	]);

	return {
		active,
		latest: active ?? latest,
		summary: active ? buildCycleSummary(active, rawBills, incomes, expenses) : null
	};
}

/**
 * Ambil seluruh riwayat siklus dalam 2 langkah batch (bukan 3*N query per siklus).
 */
export async function getCompletedCycleSummaries() {
	const cycles = await getCompletedCycles();
	if (cycles.length === 0) return [];

	const ids = cycles.map((c) => c.id);
	const [allBills, allIncomes, allExpenses] = await Promise.all([
		getBillsByCycleIds(ids),
		getIncomesByCycleIds(ids),
		getExpensesByCycleIds(ids)
	]);

	return cycles.map((cycle) =>
		buildCycleSummary(
			cycle,
			allBills.filter((b) => b.cycleId === cycle.id),
			allIncomes.filter((i) => i.cycleId === cycle.id),
			allExpenses.filter((e) => e.cycleId === cycle.id)
		)
	);
}

export type CycleSummary = ReturnType<typeof buildCycleSummary>;
