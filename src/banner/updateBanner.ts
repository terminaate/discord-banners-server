import { Activity, ActivityType, GuildMember } from 'discord.js';
import { redisClient } from '@/redis';
import { Banner } from '@/banner/Banner';
import { UserDTO } from '@/dto/user.dto';
import { UserActivityDTO } from '@/dto/user-activity.dto';

export const updateBanner = async (
	member: GuildMember,
	activities?: Activity[],
) => {
	const activity = activities?.find((o) => o.type !== ActivityType.Custom);

	const canvas = await Banner.create(
		await UserDTO.create(member),
		activity ? new UserActivityDTO(activity) : undefined,
	);

	const res = `<svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg"><image href="${canvas.toDataURL()}" height="${canvas.height}" width="${canvas.width}" /></svg>`;

	await redisClient.set(String(member.id), res);

	return res;
};
