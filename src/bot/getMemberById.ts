import { GuildMember, Snowflake } from 'discord.js';
import { discordClient } from '@/bot/index';

export const getMemberById = async (
	userId: Snowflake | string,
): Promise<GuildMember | undefined> => {
	const guild = discordClient.guilds.cache.get(process.env.GUILD_ID);
	if (!guild) {
		return;
	}

	const candidate = guild.members.cache.find(
		(o) => o.user.id === userId || o.user.username == userId,
	);

	try {
		return candidate || (await guild.members.fetch({ user: userId }));
	} catch (e) {
		return;
	}
};
