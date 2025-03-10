import { Activity, ActivityType, GuildMember } from 'discord.js';
import { redisClient } from '@/redis';
import { Banner } from '@/banner/Banner';
import { UserDTO } from '@/dto/user.dto';
import { UserActivityDTO } from '@/dto/user-activity.dto';

export const updateBanner = async (
	member: GuildMember | UserDTO,
	activities?: Activity[],
) => {
	const activity = activities?.find((o) => o.type !== ActivityType.Custom);

	const userDto =
		member instanceof UserDTO ? member : await UserDTO.create(member);

	const canvas = await Banner.create(
		userDto,
		activity ? new UserActivityDTO(activity) : undefined,
	);

	const res = canvas.toBuffer().toString();

	await redisClient.set(userDto.id, res);
	await redisClient.set(userDto.username, res);

	return res;
};
