import { Activity } from 'discord.js';

export class UserActivityDTO {
  type: number;
  name: string;
  state: string | null;
  createTimestamp: Date;
  largeImageURL?: string | null;
  startTimestamp?: Date | null;
  endTimestamp?: Date | null;

  constructor(activity: Activity) {
    this.type = activity.type;
    this.name = activity.name;
    this.startTimestamp = activity.timestamps?.start;
    this.endTimestamp = activity.timestamps?.end;
    this.createTimestamp = new Date(activity.createdTimestamp);
    this.state = activity.state;
    this.largeImageURL = activity.assets?.largeImageURL({ size: 128 });
    // activity;
  }
}
