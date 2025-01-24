import { GuildMember, Snowflake } from 'discord.js';
import { discordClient } from '@/bot/index';

export const getMemberById = async (
	userId: Snowflake | string,
): Promise<GuildMember | undefined> => {
	const guild = discordClient.guilds.cache.get(process.env.GUILD_ID);
	if (!guild) {
		return;
	}

	try {
		return await guild.members.fetch({ user: userId });
	} catch (e) {
		return;
	}
};
