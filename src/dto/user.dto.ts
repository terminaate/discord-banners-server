import { ActivityType, GuildMember } from 'discord.js';
import { UserProps } from '@/models/user.model';
import { getMemberUsername } from '@/utils/getMemberUsername';

export interface UserDTO extends UserProps {}

export class UserDTO {
	constructor(member: GuildMember) {
		const username = getMemberUsername(member);

		this.id = member.id;
		this.username = username;
		this.avatar = member.displayAvatarURL({ size: 256, extension: 'png' });
		this.banner = member.user.bannerURL({ size: 1024, extension: 'png' });
		this.status = member.presence?.status;
		this.publicFlags = member.user.flags?.bitfield;
		this.accentColor = member.user.hexAccentColor ?? '#fff';
		this.premiumSince = member.premiumSinceTimestamp;

		this.customStatus = null;
		member.presence?.activities.forEach((activity) => {
			if (activity.type === ActivityType.Custom) {
				this.customStatus = activity.state;
			}
		});
	}
}
