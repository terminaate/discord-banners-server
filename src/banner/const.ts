import { ActivityType, PresenceStatus } from 'discord.js';
import path from 'path';
import { BannerDynamicHeight } from '@/types/BannerDynamicHeight';
import { registerFont } from 'canvas';

export const StatusColors: Record<PresenceStatus, string> = {
	online: '#3BA55D',
	idle: '#faa81a',
	dnd: '#ed4245',
	offline: '#747f8d',
	invisible: '#747f8d',
};

export const AssetsPath = path.resolve(__dirname, '../../assets/');

registerFont(path.resolve(AssetsPath, 'fonts/ABCGintoNormal.otf'), {
	family: 'ABCGintoNormal',
	style: 'normal',
	weight: '700',
});
registerFont(path.resolve(AssetsPath, 'fonts/Whitney.otf'), {
	family: 'Whitney',
	style: 'normal',
});

export const PublicFlagsImages: Record<number, string> = {
	64: path.resolve(AssetsPath, 'icons/HypeSquad_Bravery.svg'),
	128: path.resolve(AssetsPath, 'icons/HypeSquad_Brilliance.svg'),
	256: path.resolve(AssetsPath, 'icons/HypeSquad_Balance.svg'),
};

export const ActivitiesText: Partial<Record<ActivityType, string>> = {
	[ActivityType.Playing]: 'PLAYING A GAME',
	[ActivityType.Streaming]: 'STREAMING',
	[ActivityType.Listening]: 'LISTENING',
	[ActivityType.Watching]: 'WATCHING',
};

export const BannerColors = {
	DEFAULT_ACCENT_COLOR: '#fff',
	INFO_COLOR: '#18191C',
};

export const BannerDynamicHeights: BannerDynamicHeight[] = [
	{
		condition(user, activity) {
			const { customStatus } = user;
			return typeof customStatus === 'string' && activity === undefined;
		},
		height: 330,
	},
	{
		condition(user, activity) {
			const { customStatus } = user;
			return !customStatus && activity === undefined;
		},
		height: 320,
	},
	{
		condition(user, activity) {
			const { customStatus } = user;
			return !customStatus && activity !== undefined;
		},
		height: 421,
		separator: true,
	},
];
