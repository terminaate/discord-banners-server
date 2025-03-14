import { Activity, ActivityType, GuildMember } from 'discord.js';
import { UserDTO } from '@/dto/user.dto';
import { BannerOptions } from '@/types/BannerOptions';
import { UserActivityDTO } from '@/dto/user-activity.dto';
import React from 'preact/compat';
import { CacheService } from '@/services/CacheService';
import { Banner } from '@/banner/Banner';

global.React = React;

export const renderBanner = async (
	member: GuildMember,
	activities?: Activity[],
	overwrites?: Partial<Record<keyof UserDTO, string>>,
	bannerOptions?: BannerOptions,
) => {
	const activity = activities?.find((o) => o.type !== ActivityType.Custom);
	const activityDto = activity ? new UserActivityDTO(activity) : undefined;

	const userDto = await UserDTO.create(member);
	Object.assign(userDto, overwrites);

	const bannerInstance = await Banner.create(
		userDto,
		activityDto,
		bannerOptions,
	);

	const svg = bannerInstance.toBuffer().toString();

	await CacheService.setInCache(
		{
			userId: userDto.id,
			username: userDto.username,
			bannerOptions,
			overwrites,
		},
		svg,
	);

	return svg;
};
