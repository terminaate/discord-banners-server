import { Client, GatewayIntentBits } from 'discord.js';
import { updateBanner } from '@/banner/updateBanner';
import { scanCacheKeys } from '@/utils/scanCacheKeys';
import { UserDTO } from '@/dto/user.dto';

export const discordClient = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildMessages,
	],
});

const extractOverwritesFromCacheKey = (
	cacheKey: string,
): Partial<Record<keyof UserDTO, string>> | undefined => {
	if (!cacheKey) {
		return;
	}

	const overwrites = cacheKey.split('@')[2];
	if (!overwrites) {
		return;
	}

	try {
		return JSON.parse(overwrites);
	} catch (e) {
		return;
	}
};

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

		updateBanner(
			member,
			member.presence?.activities,
			extractOverwritesFromCacheKey(cacheKey),
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

		updateBanner(
			presence.member,
			presence.activities,
			extractOverwritesFromCacheKey(cacheKey),
		);
	});

	discordClient.on('guildMemberAdd', (member) => {
		updateBanner(member, member.presence?.activities);
	});

	await discordClient.login(process.env.BOT_TOKEN);
};
