import { Client, GatewayIntentBits } from 'discord.js';
import { updateBanner } from '@/banner/updateBanner';
import { scanCacheKeys } from '@/utils/scanCacheKeys';
import { getDataFromCacheKey } from '@/utils/getDataFromCacheKey';

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

		const relatedCacheKeys = await scanCacheKeys((candidate) => {
			return candidate.includes(user.id);
		});
		const cacheKey = relatedCacheKeys[0];

		const { overwrites, bannerParams } = getDataFromCacheKey(cacheKey);

		void updateBanner(
			member,
			member.presence?.activities,
			overwrites,
			bannerParams,
		);
	});

	discordClient.on('presenceUpdate', async (_, presence) => {
		if (!presence.member) {
			return;
		}

		const relatedCacheKeys = await scanCacheKeys((candidate) => {
			return candidate.includes(presence.member!.id);
		});
		const cacheKey = relatedCacheKeys[0];

		const { overwrites, bannerParams } = getDataFromCacheKey(cacheKey);

		void updateBanner(
			presence.member,
			presence.activities,
			overwrites,
			bannerParams,
		);
	});

	discordClient.on('guildMemberAdd', (member) => {
		updateBanner(member, member.presence?.activities);
	});

	await discordClient.login(process.env.BOT_TOKEN);
};
