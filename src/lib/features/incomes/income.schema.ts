import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { cycles } from '../cycles/cycle.schema';

export const incomes = sqliteTable('incomes', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	cycleId: integer('cycle_id')
		.notNull()
		.references(() => cycles.id),
	label: text('label').notNull(),
	amount: integer('amount').notNull(),
	type: text('type', { enum: ['PRIMARY', 'EXTRA'] }).notNull().default('PRIMARY'),
	createdAt: text('created_at').notNull().default(sql`(current_timestamp)`)
});

export type Income = typeof incomes.$inferSelect;
