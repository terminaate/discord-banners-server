import { db } from '@/db';
import { DataTypes, Model } from 'sequelize';
import * as fs from 'fs';
import * as path from 'path';
import { renderUserBanner } from '@/utils/renderUserBanner';

export interface UserProps {
	id: string;
	username: string;
	avatar: string;
	banner?: string | null;
	status?: string | null;
	customStatus?: string | null;
	publicFlags?: number | null;
	accentColor?: string | null;
	premiumSince?: number | null;
}

export type UserModel = Model<UserProps, UserProps>;

const writeBannerToFS = async (model: UserModel) => {
	const userId = model.getDataValue('id');

	const canvas = await renderUserBanner(model);

	fs.writeFileSync(
		path.resolve(__dirname, `../static/${userId}.png`),
		canvas!.toBuffer('image/png'),
	);
};

export const User = db.define<UserModel>(
	'User',
	{
		id: {
			type: DataTypes.STRING,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		username: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		avatar: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		banner: {
			type: DataTypes.STRING,
		},
		status: {
			type: DataTypes.STRING,
		},
		customStatus: {
			type: DataTypes.STRING,
		},
		publicFlags: {
			type: DataTypes.NUMBER,
		},
		accentColor: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		premiumSince: {
			type: DataTypes.NUMBER,
		},
	},
	{
		hooks: {
			afterCreate: writeBannerToFS,
			afterUpdate: writeBannerToFS,
			afterSave: writeBannerToFS,
			afterDestroy(model) {
				const userId = model.getDataValue('id');

				fs.rmSync(path.resolve(__dirname, `../../static/${userId}.png`));
			},
		},
	},
);
