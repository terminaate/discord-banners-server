import { ActivityType, GuildMember } from 'discord.js';
import { User } from '@/models/user.model';
import { UserActivity } from '@/models/user-activity.model';
import { UserActivityDTO } from '@/dto/user-activity.dto';
import { UserDTO } from '@/dto/user.dto';

export const createActivity = async (presence: GuildMember['presence']) => {
	if (presence === null || presence.member === null) {
		return null;
	}
	const activity = presence.activities.filter(
		(o) => o.type !== ActivityType.Custom,
	)[0];
	if (activity) {
		return UserActivity.create(new UserActivityDTO(activity, presence.member));
	}
};

export const createNewUser = async (member: GuildMember) => {
	const candidate = await User.findByPk(member.id);
	if (candidate) {
		return candidate;
	}

	const newUser = await User.create(new UserDTO(member));
	await createActivity(member.presence);

	return newUser;
};
