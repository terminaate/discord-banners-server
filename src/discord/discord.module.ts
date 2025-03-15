import { Module } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { DiscordEventsService } from '@/discord/discord.events.service';

@Module({
  providers: [DiscordEventsService, DiscordService],
  exports: [DiscordService],
})
export class DiscordModule {}
