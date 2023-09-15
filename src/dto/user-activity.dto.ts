import { Activity, GuildMember } from 'discord.js';
import { UserActivityProps } from '@/models/user-activity.model';

export interface UserActivityDTO extends UserActivityProps {}

export class UserActivityDTO {
	constructor(activity: Activity, member: GuildMember) {
		this.type = activity.type;
		this.userId = member.id;
		this.name = activity.name;
		this.start = activity.timestamps?.start;
		this.state = activity.state;

		// TODO
		// remove this field
		this.image = undefined;
	}
}
