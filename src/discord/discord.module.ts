import { forwardRef, Module } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { BannerModule } from '@/banner/banner.module';

@Module({
  imports: [forwardRef(() => BannerModule)],
  providers: [DiscordService],
  exports: [DiscordService],
})
export class DiscordModule {}
