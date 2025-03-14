import { UserDTO } from '@/dto/user.dto';
import { BannerOptions } from '@/types/BannerOptions';
import { redisClient } from '@/redis';

type CacheKeyData = {
	overwrites?: Partial<Record<keyof UserDTO, string>>;
	bannerOptions?: BannerOptions;
};

type DataFromCacheKey = {
	userId: string;
	username: string;
	overwrites?: Partial<Record<keyof UserDTO, string>>;
	bannerOptions?: BannerOptions;
};

type GenerateCacheKeyOpts = {
	userId: string;
	username: string;
	overwrites?: Partial<Record<keyof UserDTO, string>>;
	bannerOptions?: BannerOptions;
};

type GetCacheDataOpts = {
	userId: string;
};

type SetCacheKeyOpts = {
	userId: string;
	username: string;
	overwrites?: Partial<Record<keyof UserDTO, string>>;
	bannerOptions?: BannerOptions;
};

type GetFromCacheOpts = {
	userId: string;
	bannerOptions?: BannerOptions;
	overwrites?: Partial<Record<keyof UserDTO, string>>;
};

export class CacheService {
	public static async setInCache(cacheKeyOpts: SetCacheKeyOpts, data: string) {
		const { userId } = cacheKeyOpts;

		const cacheKey = this.generateCacheKey(cacheKeyOpts);

		// TODO: not remove all cache keys, let's say max count of cache keys for each user  gonna be 3, so there's max 3 versions of banner, rollback date of banner and sort banners by date to  get latest banner's data to render on user changes
		const relativeCacheKeys = await this.scanCacheKeys((candidate) =>
			candidate.includes(userId),
		);
		for (const trashKey of relativeCacheKeys) {
			await redisClient.del(trashKey);
		}

		redisClient.set(cacheKey, data);
	}

	public static async getFromCache({
		userId,
		bannerOptions = { compact: false, animated: true },
		overwrites = {},
	}: GetFromCacheOpts) {
		const data: CacheKeyData = {};

		if (Object.values(overwrites ?? {}).some((p) => p !== undefined)) {
			data.overwrites = overwrites;
		}

		if (Object.values(bannerOptions ?? {}).some((p) => p !== undefined)) {
			data.bannerOptions = bannerOptions;
		}

		const serializedData = btoa(JSON.stringify(data));

		const relatedCacheKeys = await this.scanCacheKeys((candidate) => {
			const [candidateUserId, candidateUsername, candidateData] =
				candidate.split('@');

			const isSameUser =
				userId === candidateUserId || userId === candidateUsername;
			const isSameData = candidateData === serializedData;

			return isSameUser && isSameData;
		});

		const allRelatedKeys = await this.scanCacheKeys((candidate) =>
			candidate.includes(userId),
		);

		console.log(
			'relatedCacheKeys',
			relatedCacheKeys,
			'allRelatedKeys',
			allRelatedKeys,
		);

		const cacheKey = relatedCacheKeys[0];
		if (!cacheKey) {
			return;
		}

		return redisClient.get(cacheKey);
	}

	public static async getCacheData({ userId }: GetCacheDataOpts) {
		const relatedCacheKeys = await this.scanCacheKeys((candidate) =>
			candidate.includes(userId),
		);
		const cacheKey = relatedCacheKeys[0];
		if (!cacheKey) {
			return;
		}

		return this.getDataFromCacheKey(cacheKey);
	}

	private static generateCacheKey({
		bannerOptions,
		overwrites,
		username,
		userId,
	}: GenerateCacheKeyOpts) {
		const cacheKey = `${userId}@${username}`;

		const data: CacheKeyData = {};

		if (Object.values(overwrites ?? {}).some((p) => p !== undefined)) {
			data.overwrites = overwrites;
		}

		if (Object.values(bannerOptions ?? {}).some((p) => p !== undefined)) {
			data.bannerOptions = bannerOptions;
		}

		return `${cacheKey}@${btoa(JSON.stringify(data))}`;
	}

	private static getDataFromCacheKey(cacheKey: string): DataFromCacheKey {
		if (!cacheKey) {
			return {
				userId: '',
				username: '',
			};
		}

		const [userId, username, data] = cacheKey.split('@');

		const { overwrites, bannerOptions } = data
			? JSON.parse(atob(data))
			: {
					bannerOptions: undefined,
					overwrites: undefined,
				};

		return {
			userId,
			username,
			overwrites,
			bannerOptions,
		};
	}

	private static async scanCacheKeys(
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
}
