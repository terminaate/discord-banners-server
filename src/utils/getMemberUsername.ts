import { GuildMember } from 'discord.js';

export const getMemberUsername = (member: GuildMember) => {
	return `${member.user.username}${
		Number(member.user.discriminator) ? '#' + member.user.discriminator : ''
	}`;
};
