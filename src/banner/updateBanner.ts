import { Activity, ActivityType, GuildMember } from 'discord.js';
import { Banner } from '@/banner/Banner';
import { UserDTO } from '@/dto/user.dto';
import { UserActivityDTO } from '@/dto/user-activity.dto';
import { redisClient } from '@/redis';
import { getCacheKey } from '@/utils/getCacheKey';
import { scanCacheKeys } from '@/utils/scanCacheKeys';
import { BannerParams } from '@/types/BannerParams';

// TODO: not remove all cache keys, let's say max count of cache keys for each user  gonna be 3, so there's max 3 versions of banner, rollback date of banner and sort banners by date to  get latest banner's data to render on user changes

export const updateBanner = async (
	member: GuildMember,
	activities?: Activity[],
	overwrites?: Partial<Record<keyof UserDTO, string>>,
	bannerParams?: BannerParams,
) => {
	const activity = activities?.find((o) => o.type !== ActivityType.Custom);

	const userDto = await UserDTO.create(member);
	Object.assign(userDto, overwrites);

	const canvas = await Banner.create(
		userDto,
		activity ? new UserActivityDTO(activity) : undefined,
		bannerParams,
	);

	const res = canvas.toBuffer().toString();

	const cachedKey = await getCacheKey(
		userDto.id,
		userDto.username,
		overwrites,
		bannerParams,
	);

	const relativeCacheKeys = await scanCacheKeys((candidate) =>
		candidate.includes(member.id),
	);
	for (const trashKey of relativeCacheKeys) {
		await redisClient.del(trashKey);
	}

	await redisClient.set(cachedKey, res);

	return res;
};
