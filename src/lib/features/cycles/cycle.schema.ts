import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const cycles = sqliteTable('cycles', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	cycleNumber: integer('cycle_number').notNull(),
	status: text('status', { enum: ['ACTIVE', 'COMPLETED', 'PENDING_VALIDATION'] })
		.notNull()
		.default('ACTIVE'),
	dueDay: integer('due_day').notNull(), // tanggal reset siklus (1-31)
	startDate: text('start_date').notNull(), // YYYY-MM-DD
	endDate: text('end_date'),
	createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
	updatedAt: text('updated_at').notNull().default(sql`(current_timestamp)`)
});

export type Cycle = typeof cycles.$inferSelect;
