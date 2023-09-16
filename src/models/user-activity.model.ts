import { db } from '@/db';
import { DataTypes, Model } from 'sequelize';
import { renderUserBanner } from '@/utils/renderUserBanner';
import fs from 'fs';
import path from 'path';

export interface UserActivityProps {
	id: string;
	userId: string;
	type: number;
	state?: string | null;
	name: string;
	start?: Date | null;
	image?: string | null;
}

export type UserActivityModel = Model<
	UserActivityProps,
	Omit<UserActivityProps, 'id'>
>;

const writeBannerToFS = async (model: UserActivityModel) => {
	const userId = model.getDataValue('userId');

	const canvas = await renderUserBanner(userId, model);

	fs.writeFileSync(
		path.resolve(__dirname, `../../static/${userId}.png`),
		canvas!.toBuffer('image/png'),
	);
};

export const UserActivity = db.define<UserActivityModel>(
	'UserActivity',
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		userId: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		type: {
			type: DataTypes.NUMBER,
			allowNull: false,
		},
		state: {
			type: DataTypes.STRING,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		start: {
			type: DataTypes.DATE,
		},
		image: {
			type: DataTypes.STRING,
		},
	},
	{
		hooks: {
			afterCreate: writeBannerToFS,
			afterUpdate: writeBannerToFS,
			afterSave: writeBannerToFS,
		},
	},
);
