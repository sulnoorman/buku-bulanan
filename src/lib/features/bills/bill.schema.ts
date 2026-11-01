import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { cycles } from '../cycles/cycle.schema';
import { obligationsMaster } from '../obligations/obligation.schema';

export const monthlyBills = sqliteTable('monthly_bills', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	cycleId: integer('cycle_id')
		.notNull()
		.references(() => cycles.id),
	obligationId: integer('obligation_id')
		.notNull()
		.references(() => obligationsMaster.id),
	// Snapshot dari master saat generate
	name: text('name').notNull(),
	amount: integer('amount').notNull(),
	dueDay: integer('due_day').notNull(),
	installments: integer('installments').notNull().default(1),
	// Progres pembayaran bertahap. Lunas (PAID) jika paidCount + skippedCount = installments
	paidCount: integer('paid_count').notNull().default(0),
	skippedCount: integer('skipped_count').notNull().default(0),
	status: text('status', { enum: ['UNPAID', 'PAID'] }).notNull().default('UNPAID'),
	paidAt: text('paid_at'), // waktu pembayaran terakhir
	createdAt: text('created_at').notNull().default(sql`(current_timestamp)`)
});

export type Bill = typeof monthlyBills.$inferSelect;
