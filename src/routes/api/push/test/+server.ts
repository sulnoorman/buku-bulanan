import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sendPushToAll } from '$features/notifications/push.server';

export const POST: RequestHandler = async () => {
	const result = await sendPushToAll({
		title: 'Buku Bulanan',
		body: 'Tes Web Push Notification dari server berhasil!',
		url: '/'
	});
	return json(result);
};
