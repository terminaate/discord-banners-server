import { Activity, ActivityType, GuildMember } from 'discord.js';
import { UserDTO } from '@/dto/user.dto';
import { redisClient } from '@/redis';
import { getCacheKey } from '@/utils/getCacheKey';
import { scanCacheKeys } from '@/utils/scanCacheKeys';
import { BannerOptions } from '@/types/BannerOptions';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { Banner } from '@/banner/Banner';
import { UserActivityDTO } from '@/dto/user-activity.dto';

// TODO: not remove all cache keys, let's say max count of cache keys for each user  gonna be 3, so there's max 3 versions of banner, rollback date of banner and sort banners by date to  get latest banner's data to render on user changes

// TODO: add abstraction for cache

export const updateBanner = async (
	member: GuildMember,
	activities?: Activity[],
	overwrites?: Partial<Record<keyof UserDTO, string>>,
	bannerOptions?: BannerOptions,
) => {
	const activity = activities?.find((o) => o.type !== ActivityType.Custom);
	const activityDto = activity ? new UserActivityDTO(activity) : undefined;

	const userDto = await UserDTO.create(member);
	Object.assign(userDto, overwrites);

	const svg = renderToStaticMarkup(
		createElement(Banner, {
			user: userDto,
			activity: activityDto,
			bannerOptions,
		}),
	);

	const cachedKey = await getCacheKey(
		userDto.id,
		userDto.username,
		overwrites,
		bannerOptions,
	);

	const relativeCacheKeys = await scanCacheKeys((candidate) =>
		candidate.includes(member.id),
	);
	for (const trashKey of relativeCacheKeys) {
		await redisClient.del(trashKey);
	}

	await redisClient.set(cachedKey, svg);

	return svg;
};
