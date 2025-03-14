import { ActivityType, GuildMember } from 'discord.js';
import { getMemberUsername } from '@/utils/getMemberUsername';

export class UserDTO {
	id: string;
	username: string;
	avatar: string;
	banner?: string | null;
	status?: string | null;
	customStatus?: string | null;
	publicFlags?: number | null;
	accentColor: string;
	premiumSince?: number | null;
	profileEffect?: string;
	avatarDecoration?: string | null;

	constructor(member: GuildMember, profileEffect?: string) {
		const username = getMemberUsername(member);

		this.id = member.id;
		this.username = username;
		this.avatar = member.displayAvatarURL({ size: 256, extension: 'png' });
		this.banner = member.user.bannerURL({ size: 1024, extension: 'png' });
		this.status = member.presence?.status ?? 'offline';
		this.publicFlags = member.user.flags?.bitfield;
		this.accentColor = member.displayHexColor ?? '#fff';
		this.premiumSince = member.premiumSinceTimestamp;
		this.avatarDecoration = member.user.avatarDecorationData?.asset;
		this.profileEffect = profileEffect;

		this.customStatus = member.presence?.activities.find(
			(activity) => activity.type === ActivityType.Custom,
		)?.state;
	}
}
