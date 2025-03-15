import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NecordModule } from 'necord';
import { GatewayIntentBits } from 'discord.js';
import { DiscordModule } from './discord/discord.module';
import { BannerModule } from './banner/banner.module';
import { FakeProfileModule } from './fake-profile/fake-profile.module';

const config = () => ({
  IS_DEV: process.env.NODE_ENV === 'dev',
});

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [config],
    }),
    NecordModule.forRoot({
      token: process.env.BOT_TOKEN,
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
      ],
    }),

    DiscordModule,
    BannerModule,
    FakeProfileModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
