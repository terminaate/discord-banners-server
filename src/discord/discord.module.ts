import { forwardRef, Module } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { BannerModule } from '@/banner/banner.module';
import { NecordModule } from 'necord';
import { GatewayIntentBits } from 'discord.js';

@Module({
  imports: [
    NecordModule.forRoot({
      token: process.env.BOT_TOKEN,
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
      ],
    }),
    forwardRef(() => BannerModule),
  ],
  providers: [DiscordService],
  exports: [DiscordService],
})
export class DiscordModule {}
