import { Activity, ActivityType } from 'discord.js';

export class UserActivityDTO {
  type: ActivityType;
  name: string;
  state: string | null;
  createTimestamp: Date;
  details: string | null;
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
    this.details = activity.details;
  }
}
