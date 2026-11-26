import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sendDueBillsReminder } from '$features/notifications/push.server';

// Dipanggil otomatis setiap pagi oleh Vercel Cron (07:00 WIB)
export const GET: RequestHandler = async () => {
	const result = await sendDueBillsReminder();
	return json({ ok: true, ...result });
};
