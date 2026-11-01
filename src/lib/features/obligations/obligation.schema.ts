import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const obligationsMaster = sqliteTable('obligations_master', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	amount: integer('amount').notNull(), // Rupiah (integer)
	dueDay: integer('due_day').notNull(), // estimasi jatuh tempo (1-31)
	installments: integer('installments').notNull().default(1), // 1 = sekali bayar, 4 = per minggu
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
	updatedAt: text('updated_at').notNull().default(sql`(current_timestamp)`)
});

export type Obligation = typeof obligationsMaster.$inferSelect;
