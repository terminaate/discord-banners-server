import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscordModule } from './discord/discord.module';
import { BannerModule } from './banner/banner.module';
import { FakeProfileModule } from './fake-profile/fake-profile.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BannerRenderRecordEntity } from '@/banner/entities/banner-render-record.entity';

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
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number.parseInt(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      logging: true,
      synchronize: true,
      entities: [BannerRenderRecordEntity],
      subscribers: [],
      migrations: [],
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
