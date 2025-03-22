import { Injectable } from '@nestjs/common';
import { Client, Snowflake } from 'discord.js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiscordService {
  constructor(
    private readonly client: Client,
    private configService: ConfigService,
  ) {}

  getRandomUser() {
    const guild = this.client.guilds.cache.get(
      this.configService.get('GUILD_ID')!,
    );
    if (!guild) {
      return;
    }

    return guild.members.cache.random();
  }

  async getMemberByIdOrUsername(userId: Snowflake) {
    const guild = this.client.guilds.cache.get(
      this.configService.get('GUILD_ID')!,
    );
    if (!guild) {
      return;
    }

    const candidate = guild.members.cache.find(
      (o) => o.user.id === userId || o.user.username == userId,
    );

    try {
      return candidate || (await guild.members.fetch({ user: userId }));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return;
    }
  }
}
