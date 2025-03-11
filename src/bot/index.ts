import { Client, GatewayIntentBits } from 'discord.js';
import { updateBanner } from '@/banner/updateBanner';

export const discordClient = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildMessages,
	],
});

export const startBot = async () => {
	discordClient.on('ready', () => {
		console.log(`Logged in as ${discordClient.user?.tag}!`);
	});

	discordClient.on('userUpdate', (_, user) => {
		const guild = discordClient.guilds.cache.get(process.env.GUILD_ID);
		const member = guild?.members.cache.get(user.id);

		if (!member) {
			return;
		}

		updateBanner(member, member.presence?.activities);
	});

	discordClient.on('presenceUpdate', (_, presence) => {
		if (!presence.member) {
			return;
		}

		updateBanner(presence.member, presence.activities);
	});

	discordClient.on('guildMemberAdd', (member) => {
		updateBanner(member, member.presence?.activities);
	});

	await discordClient.login(process.env.BOT_TOKEN);
};
