import { db } from '@/db';
import { DataTypes, Model } from 'sequelize';

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

export const User = db.define<UserModel>('User', {
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
});
