import { Client, GatewayIntentBits } from 'discord.js';
import { renderBanner } from '@/banner/renderBanner';
import { BannerCacheService } from '@/services/BannerCacheService';

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

	discordClient.on('userUpdate', async (_, user) => {
		const guild = discordClient.guilds.cache.get(process.env.GUILD_ID);
		const member = guild?.members.cache.get(user.id);

		if (!member) {
			return;
		}

		const cacheData = await BannerCacheService.getCacheData({
			userId: user.id,
		});

		const overwrites = cacheData?.overwrites;
		const bannerOptions = cacheData?.bannerOptions;

		void renderBanner(
			member,
			member.presence?.activities,
			overwrites,
			bannerOptions,
		);
	});

	discordClient.on('presenceUpdate', async (_, presence) => {
		if (!presence.member) {
			return;
		}

		const cacheData = await BannerCacheService.getCacheData({
			userId: presence.member.id,
		});

		const overwrites = cacheData?.overwrites;
		const bannerOptions = cacheData?.bannerOptions;

		void renderBanner(
			presence.member,
			presence.activities,
			overwrites,
			bannerOptions,
		);
	});

	discordClient.on('guildMemberAdd', (member) => {
		renderBanner(member, member.presence?.activities);
	});

	await discordClient.login(process.env.BOT_TOKEN);
};
