import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { cycles } from '../cycles/cycle.schema';

export const expenses = sqliteTable('expenses', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	cycleId: integer('cycle_id')
		.notNull()
		.references(() => cycles.id),
	label: text('label').notNull(),
	amount: integer('amount').notNull(),
	category: text('category').notNull().default('Lainnya'),
	note: text('note'),
	date: text('date').notNull(), // YYYY-MM-DD
	createdAt: text('created_at').notNull().default(sql`(current_timestamp)`)
});

export type Expense = typeof expenses.$inferSelect;
