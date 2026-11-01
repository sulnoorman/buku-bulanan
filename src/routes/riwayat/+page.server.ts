import type { PageServerLoad } from './$types';
import { getCompletedCycles } from '$features/cycles/cycle.queries';
import { getCycleSummary } from '$features/dashboard/dashboard.service';

export const load: PageServerLoad = async () => {
	const cycles = await getCompletedCycles();
	return { summaries: await Promise.all(cycles.map(getCycleSummary)) };
};
