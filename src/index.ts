import dotenv from 'dotenv';
import * as process from 'process';
import { ActivityType, Client, GatewayIntentBits } from 'discord.js';
import { db } from '@/db';
import { User } from '@/models/user.model';
import { createNewUser } from '@/utils/createNewUser';
import { UserDTO } from '@/dto/user.dto';
import { UserActivity } from '@/models/user-activity.model';
import { boostrapServer } from '@/server';
import { UserActivityDTO } from '@/dto/user-activity.dto';

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
	});

	client.on('messageCreate', (msg) => {
		console.log(msg.author);
	});

	client.on('userUpdate', async (_, user) => {
		const databaseUser = await User.findByPk(user.id);

		const guild = client.guilds.cache.get(process.env.GUILD_ID);
		const member = guild?.members.cache.get(user.id);

		if (databaseUser && member) {
			await databaseUser.update(new UserDTO(member));
		} else if (member) {
			await createNewUser(member);
		}
	});

	client.on('presenceUpdate', async (_, presence) => {
		if (!presence.member) {
			return;
		}

		const user = await User.findByPk(presence.userId);
		if (user === null) {
			await createNewUser(presence.member);
			return;
		}

		const newCustomStatus = presence.activities.find(
			(o) => o.type === ActivityType.Custom,
		);
		const newActivity = presence.activities.find(
			(o) => o.type !== ActivityType.Custom,
		);
		const userActivity = await UserActivity.findOne({
			where: { userId: presence.member.id },
		});

		if (newActivity) {
			if (userActivity) {
				await userActivity.update(
					new UserActivityDTO(newActivity, presence.member),
				);
			} else {
				await UserActivity.create(
					new UserActivityDTO(newActivity, presence.member),
				);
			}
		} else {
			await UserActivity.destroy({
				where: { userId: presence.member.id },
			});
		}

		if (newCustomStatus) {
			// TODO: refactor?
			await user.update({
				...user.dataValues,
				customStatus: newCustomStatus.state,
			});
		} else {
			await user.update({
				...user.dataValues,
				customStatus: null,
			});
		}
	});

	client.on('guildMemberAdd', (member) => {
		void createNewUser(member);
	});

	client.on('guildMemberRemove', async (member) => {
		await User.destroy({ where: { id: member.id } });
		await UserActivity.destroy({ where: { userId: member.id } });
	});

	await client.login(process.env.BOT_TOKEN);
};

void boostrap();
