import { Activity, ActivityType, GuildMember } from 'discord.js';
import { Banner } from '@/banner/Banner';
import { UserDTO } from '@/dto/user.dto';
import { UserActivityDTO } from '@/dto/user-activity.dto';
import { redisClient } from '@/redis';
import { getCacheKey } from '@/utils/getCacheKey';
import { scanCacheKeys } from '@/utils/scanCacheKeys';

export const updateBanner = async (
	member: GuildMember,
	activities?: Activity[],
	overwrites?: Partial<Record<keyof UserDTO, string>>,
) => {
	const activity = activities?.find((o) => o.type !== ActivityType.Custom);

	const userDto = await UserDTO.create(member);
	Object.assign(userDto, overwrites);

	const canvas = await Banner.create(
		userDto,
		activity ? new UserActivityDTO(activity) : undefined,
	);

	const res = canvas.toBuffer().toString();

	const cachedKey = await getCacheKey(userDto.id, userDto.username, overwrites);

	const relativeCacheKeys = await scanCacheKeys((candidate) =>
		candidate.includes(member.id),
	);
	for (const trashKey of relativeCacheKeys) {
		await redisClient.del(trashKey);
	}

	await redisClient.set(cachedKey, res);

	return res;
};
