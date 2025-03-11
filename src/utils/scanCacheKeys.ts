import { redisClient } from '@/redis';

export async function scanCacheKeys(
	filterCb: (val: string, index: number) => boolean,
) {
	let cursor = '0';
	const matchedKeys: string[] = [];

	do {
		const [newCursor, keys] = await redisClient.scan(
			cursor,
			'MATCH',
			'*',
			'COUNT',
			100,
		);
		cursor = newCursor;
		
		matchedKeys.push(...keys.filter(filterCb));
	} while (cursor !== '0');

	return matchedKeys;
}
