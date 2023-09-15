import { db } from '@/db';
import { DataTypes, Model } from 'sequelize';

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

export const UserActivity = db.define<UserActivityModel>('UserActivity', {
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
});
