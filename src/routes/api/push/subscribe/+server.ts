import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { saveSubscription } from '$features/notifications/push.server';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	if (!body?.endpoint || !body?.keys?.p256dh || !body?.keys?.auth) {
		error(400, 'Subscription tidak valid');
	}
	await saveSubscription(body);
	return json({ ok: true });
};
