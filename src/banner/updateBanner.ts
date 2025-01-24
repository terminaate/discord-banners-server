import { Activity, ActivityType, GuildMember } from 'discord.js';
import { redisClient } from '@/redis';
import { renderBanner } from '@/banner/renderBanner';

export const updateBanner = async (
	member: GuildMember,
	activities?: Activity[],
) => {
	await redisClient.set(String(member.id), await renderBanner());

	// const activity = activities?.find((o) => o.type !== ActivityType.Custom);
	//
	// const canvas = await Banner.create(
	// 	await UserDTO.create(member),
	// 	activity ? new UserActivityDTO(activity) : undefined,
	// );
	// userBanners[member.id] = canvas.createPNGStream();
	// 	userBanners[member.id] = `
	// <svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">
	//   <image href="${dataUrl}" height="${canvas.height}" width="${canvas.width}" />
	// </svg>
	// `;
};
