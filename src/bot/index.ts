import { Client, GatewayIntentBits } from 'discord.js';
import { updateBanner } from '@/banner/updateBanner';

export const startBot = async () => {
	const client = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildPresences,
			GatewayIntentBits.GuildMessages,
		],
	});

	client.on('ready', () => {
		console.log(`Logged in as ${client.user?.tag}!`);

		// todo: maybe redis would help with that
		// const guild = client.guilds.cache.get(process.env.GUILD_ID);
		// if (!guild) {
		// 	return;
		// }
		//
		// for (const [, member] of [...guild.members.valueOf()]) {
		// 	createBanner(member, member.presence?.activities);
		// }
	});

	client.on('userUpdate', (_, user) => {
		const guild = client.guilds.cache.get(process.env.GUILD_ID);
		const member = guild?.members.cache.get(user.id);

		if (!member) {
			return;
		}

		updateBanner(member, member.presence?.activities);
	});

	client.on('presenceUpdate', (_, presence) => {
		if (!presence.member) {
			return;
		}

		updateBanner(presence.member, presence.activities);
	});

	client.on('guildMemberAdd', (member) => {
		updateBanner(member, member.presence?.activities);
	});

	await client.login(process.env.BOT_TOKEN);
};
