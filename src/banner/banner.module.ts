import { forwardRef, Module } from '@nestjs/common';
import { BannerController } from './banner.controller';
import { BannerService } from './banner.service';
import { BannerRenderService } from '@/banner/banner-render.service';
import { DiscordModule } from '@/discord/discord.module';
import { FakeProfileModule } from '@/fake-profile/fake-profile.module';
import { BannerRenderRecordEntity } from '@/banner/entities/banner-render-record.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([BannerRenderRecordEntity]),
    forwardRef(() => DiscordModule),
    FakeProfileModule,
  ],
  controllers: [BannerController],
  providers: [BannerRenderService, BannerService],
  exports: [BannerService],
})
export class BannerModule {}
