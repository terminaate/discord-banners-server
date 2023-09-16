import { ActivityType, GuildMember } from 'discord.js';
import { UserModel } from '@/models/user.model';
import { UserActivity } from '@/models/user-activity.model';
import { UserActivityDTO } from '@/dto/user-activity.dto';

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

	await user.update({
		...user.dataValues,
		customStatus: newCustomStatus?.state,
		status: presence.status,
	});
};
