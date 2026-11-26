import type { PageServerLoad } from './$types';
import { getCompletedCycleSummaries } from '$features/dashboard/dashboard.service';

export const load: PageServerLoad = async () => {
	return { summaries: await getCompletedCycleSummaries() };
};
