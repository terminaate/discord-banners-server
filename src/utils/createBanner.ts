import { UserDTO } from '@/dto/user.dto';
import fs from 'fs';
import path from 'path';
import { Banner } from '@/banner/Banner';
import { Activity, ActivityType, GuildMember } from 'discord.js';
import { UserActivityDTO } from '@/dto/user-activity.dto';

export const createBanner = async (
	member: GuildMember,
	activities?: Activity[],
) => {
	const activity = activities?.find((o) => o.type !== ActivityType.Custom);

	const canvas = await Banner.create(
		new UserDTO(member),
		activity ? new UserActivityDTO(activity) : undefined,
	);

	fs.writeFileSync(
		path.resolve(__dirname, `../static/${member.id}.png`),
		canvas!.toBuffer('image/png'),
	);
};
