import { UserDTO } from '@/dto/user.dto';
import { Banner } from '@/banner/Banner';
import { Activity, ActivityType, GuildMember, Snowflake } from 'discord.js';
import { UserActivityDTO } from '@/dto/user-activity.dto';

export const userBanners: Record<Snowflake, string> = {};

export const createBanner = async (
	member: GuildMember,
	activities?: Activity[],
) => {
	const activity = activities?.find((o) => o.type !== ActivityType.Custom);

	const canvas = await Banner.create(
		await UserDTO.create(member),
		activity ? new UserActivityDTO(activity) : undefined,
	);

	const dataUrl = canvas.toDataURL('image/png');

	userBanners[member.id] = `
<svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">
  <image href="${dataUrl}" height="${canvas.height}" width="${canvas.width}" />
</svg>
`;
};
