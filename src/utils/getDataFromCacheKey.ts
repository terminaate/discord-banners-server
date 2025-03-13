import { BannerOptions } from '@/types/BannerOptions';
import { UserDTO } from '@/dto/user.dto';

type DataFromCacheKey = {
	userId: string;
	username: string;
	overwrites?: Partial<Record<keyof UserDTO, string>>;
	bannerParams?: BannerOptions;
};

export const getDataFromCacheKey = (cacheKey: string): DataFromCacheKey => {
	if (!cacheKey) {
		return {
			userId: '',
			username: '',
		};
	}

	const [userId, username, data] = cacheKey.split('@');

	const { overwrites, bannerParams } = data
		? JSON.parse(atob(data))
		: {
				bannerParams: undefined,
				overwrites: undefined,
			};

	// if (over)

	return {
		userId,
		username,
		overwrites,
		bannerParams,
	};
};
