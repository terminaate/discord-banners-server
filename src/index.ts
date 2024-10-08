import dotenv from 'dotenv';
import * as process from 'process';
import { Client, GatewayIntentBits } from 'discord.js';
import { boostrapServer } from '@/server';
import { createBanner } from '@/utils/createBanner';

dotenv.config({ path: `.${process.env.NODE_ENV}.env` });

const boostrap = async () => {
	const client = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildPresences,
			GatewayIntentBits.GuildMessages,
		],
	});

	// await connectToDB();

	client.on('ready', () => {
		console.log(`Logged in as ${client.user?.tag}!`);

		const guild = client.guilds.cache.get(process.env.GUILD_ID);
		if (!guild) {
			return;
		}

		for (const [, member] of [...guild.members.valueOf()]) {
			createBanner(member, member.presence?.activities);
		}
	});

	client.on('userUpdate', (_, user) => {
		const guild = client.guilds.cache.get(process.env.GUILD_ID);
		const member = guild?.members.cache.get(user.id);

		if (!member) {
			return;
		}

		createBanner(member, member.presence?.activities);
	});

	client.on('presenceUpdate', (_, presence) => {
		if (!presence.member) {
			return;
		}

		createBanner(presence.member, presence.activities);
	});

	client.on('guildMemberAdd', (member) => {
		createBanner(member, member.presence?.activities);
	});

	await client.login(process.env.BOT_TOKEN);

	boostrapServer();
};

void boostrap();
