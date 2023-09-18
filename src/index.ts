import dotenv from 'dotenv';
import * as process from 'process';
import { Client, GatewayIntentBits } from 'discord.js';
import { db } from '@/db';
import { User } from '@/models/user.model';
import { updateOrCreateUser } from '@/utils/updateOrCreateUser';
import { UserDTO } from '@/dto/user.dto';
import { UserActivity } from '@/models/user-activity.model';
import { boostrapServer } from '@/server';
import { updateOrCreateActivity } from '@/utils/updateOrCreateActivity';

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

	try {
		await db.authenticate();
		await db.sync({ alter: true });
		console.log('Connection has been established successfully.');
	} catch (error) {
		console.error('Unable to connect to the database:', error);
	}

	boostrapServer();

	client.on('ready', () => {
		console.log(`Logged in as ${client.user?.tag}!`);

		const guild = client.guilds.cache.get(process.env.GUILD_ID);
		if (!guild) {
			return;
		}

		for (const [, member] of [...guild.members.valueOf()]) {
			updateOrCreateUser(member);
		}
	});

	client.on('userUpdate', async (_, user) => {
		const databaseUser = await User.findByPk(user.id);

		const guild = client.guilds.cache.get(process.env.GUILD_ID);
		const member = guild?.members.cache.get(user.id);

		if (databaseUser && member) {
			await databaseUser.update(new UserDTO(member));
		} else if (member) {
			await updateOrCreateUser(member);
		}
	});

	client.on('presenceUpdate', async (_, presence) => {
		if (!presence.member) {
			return;
		}

		const user = await User.findByPk(presence.userId);
		if (user === null) {
			await updateOrCreateUser(presence.member);
			return;
		}

		await updateOrCreateActivity(presence, user);
	});

	client.on('guildMemberAdd', (member) => {
		void updateOrCreateUser(member);
	});

	client.on('guildMemberRemove', async (member) => {
		await User.destroy({ where: { id: member.id } });
		await UserActivity.destroy({ where: { userId: member.id } });
	});

	await client.login(process.env.BOT_TOKEN);
};

void boostrap();
