import { forwardRef, Module } from '@nestjs/common';
import { BannerController } from './banner.controller';
import { BannerService } from './banner.service';
import { BannerRenderService } from '@/banner/banner-render.service';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { DiscordModule } from '@/discord/discord.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FakeProfileModule } from '@/fake-profile/fake-profile.module';

@Module({
  imports: [
    forwardRef(() => DiscordModule),
    FakeProfileModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisHost = configService.get('REDIS_HOST') as string;
        const redisPort = configService.get('REDIS_PORT') as string;

        return {
          stores: [createKeyv(`redis://${redisHost}:${redisPort}`)],
        };
      },
    }),
  ],
  controllers: [BannerController],
  providers: [BannerRenderService, BannerService],
  exports: [BannerService],
})
export class BannerModule {}
