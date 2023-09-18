import { GuildMember } from 'discord.js';
import { User } from '@/models/user.model';
import { UserDTO } from '@/dto/user.dto';
import { updateOrCreateActivity } from '@/utils/updateOrCreateActivity';

export const updateOrCreateUser = async (member: GuildMember) => {
	let user = await User.findByPk(member.id);
	if (user) {
		await user.update(new UserDTO(member));
	} else {
		user = await User.create(new UserDTO(member));
	}

	await updateOrCreateActivity(member.presence, user);

	return user;
};
