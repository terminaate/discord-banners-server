import { ActivityType, GuildMember } from 'discord.js';
import { User, UserModel } from '@/models/user.model';
import { UserActivity } from '@/models/user-activity.model';
import { UserActivityDTO } from '@/dto/user-activity.dto';
import { UserDTO } from '@/dto/user.dto';

export const updateOrCreateActivity = async (
	presence: GuildMember['presence'],
	user?: UserModel,
) => {
	if (!presence?.member) {
		return;
	}

	const newCustomStatus = presence.activities.find(
		(o) => o.type === ActivityType.Custom,
	);
	const newActivity = presence.activities.find(
		(o) => o.type !== ActivityType.Custom,
	);
	const userActivity = await UserActivity.findOne({
		where: { userId: presence.member.id },
	});

	if (newActivity) {
		if (userActivity) {
			await userActivity.update(
				new UserActivityDTO(newActivity, presence.member),
			);
		} else {
			await UserActivity.create(
				new UserActivityDTO(newActivity, presence.member),
			);
		}
	} else {
		await UserActivity.destroy({
			where: { userId: presence.member.id },
		});
	}

	if (!user) {
		return;
	}

	if (newCustomStatus) {
		// TODO: refactor?
		await user.update({
			...user.dataValues,
			customStatus: newCustomStatus.state,
		});
	} else {
		await user.update({
			...user.dataValues,
			customStatus: null,
		});
	}
};

export const createNewUser = async (member: GuildMember) => {
	let user = await User.findByPk(member.id);
	if (!user) {
		user = await User.create(new UserDTO(member));
	}

	await updateOrCreateActivity(member.presence, user);

	return user;
};
