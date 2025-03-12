import { UserDTO } from '@/dto/user.dto';
import { BannerParams } from '@/types/BannerParams';
import { CacheKeyData } from '@/types/CacheKeyData';

// @note: format - {memberId}@{username}@{{overwrites?}{bannerParams?}}
export const getCacheKey = async (
	userId: string,
	username: string,
	overwrites?: Partial<Record<keyof UserDTO, string>>,
	bannerParams?: BannerParams,
) => {
	const cacheKey = `${userId}@${username}`;

	const data: CacheKeyData = {};

	if (Object.values(overwrites ?? {}).some((p) => p !== undefined)) {
		data.overwrites = overwrites;
	}

	if (Object.values(bannerParams ?? {}).some((p) => p !== undefined)) {
		data.bannerParams = bannerParams;
	}

	return `${cacheKey}@${btoa(JSON.stringify(data))}`;
};
