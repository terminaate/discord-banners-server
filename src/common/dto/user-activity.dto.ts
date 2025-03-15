import { Activity } from 'discord.js';

export class UserActivityDTO {
	type: number;
	name: string;
	state: string | null;
	largeImageURL?: string | null;
	start?: Date | null;

	constructor(activity: Activity) {
		this.type = activity.type;
		this.name = activity.name;
		this.start = activity.timestamps?.start;
		this.state = activity.state;
		this.largeImageURL = activity.assets?.largeImageURL({ size: 128 });
	}
}
