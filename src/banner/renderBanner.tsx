import { Activity, ActivityType, GuildMember } from 'discord.js';
import { UserDTO } from '@/dto/user.dto';
import { BannerOptions } from '@/types/BannerOptions';
import { Banner } from '@/banner/Banner';
import { UserActivityDTO } from '@/dto/user-activity.dto';
import render from 'preact-render-to-string';
import React from 'preact/compat';
import { CacheService } from '@/services/CacheService';

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

	const svg = render(
		<Banner
			bannerOptions={bannerOptions}
			user={userDto}
			activity={activityDto}
		/>,
	);

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
