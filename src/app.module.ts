import { BannerRenderRecordEntity } from '@/banner/entities/banner-render-record.entity';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BannerModule } from './banner/banner.module';
import { DiscordModule } from './discord/discord.module';
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
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const IS_DEV = configService.getOrThrow('NODE_ENV') === 'dev';

        return {
          type: 'postgres',
          host: configService.getOrThrow('POSTGRES_HOST'),
          port: configService.getOrThrow('POSTGRES_PORT'),
          username: configService.getOrThrow('POSTGRES_USER'),
          password: configService.getOrThrow('POSTGRES_PASSWORD'),
          database: configService.getOrThrow('POSTGRES_DB'),
          logging: IS_DEV,
          synchronize: IS_DEV,
          entities: [BannerRenderRecordEntity],
        };
      },
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),

    DiscordModule,
    BannerModule,
    FakeProfileModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
