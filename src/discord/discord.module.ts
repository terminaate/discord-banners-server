import { forwardRef, Module } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { DiscordEventsService } from '@/discord/discord.events.service';
import { BannerModule } from '@/banner/banner.module';

@Module({
  imports: [forwardRef(() => BannerModule)],
  providers: [DiscordEventsService, DiscordService],
  exports: [DiscordService],
})
export class DiscordModule {}
