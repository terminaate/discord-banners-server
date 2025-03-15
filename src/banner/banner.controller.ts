import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import { IsBooleanString, IsOptional, IsString } from 'class-validator';
import { BannerOptions } from '@/banner/types/banner-options';
import { UserDTO } from '@/common/dto/user.dto';
import { pickBy } from 'lodash';
import { DiscordService } from '@/discord/discord.service';
import { BannerService } from '@/banner/banner.service';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { BannerCacheService } from '@/banner/banner-cache.service';
import { FakeProfileService } from '@/fake-profile/fake-profile.service';

class GetBannerParams {
  @IsString()
  memberId: string;
}

// TODO: add profileEffect & decoration validation

class GetBannerQuery {
  @IsOptional()
  @IsBooleanString()
  cache?: boolean;

  @IsOptional()
  @IsBooleanString()
  animated?: boolean;

  @IsOptional()
  @IsBooleanString()
  compact?: boolean;

  @IsOptional()
  @IsBooleanString()
  fakeProfile?: boolean;

  @IsOptional()
  @IsString()
  profileEffect?: string;

  @IsOptional()
  @IsString()
  decoration?: string;
}

// TODO: improve
@Controller()
export class BannerController {
  constructor(
    private discordService: DiscordService,
    private bannerService: BannerService,
    private bannerCacheService: BannerCacheService,
    private configService: ConfigService,
    private fakeProfileService: FakeProfileService,
  ) {}

  @Get('/banner-benchmark/:memberId')
  @HttpCode(HttpStatus.OK)
  async getBannerBenchmark(
    @Param() params: GetBannerParams,
    @Query() query: GetBannerQuery,
  ) {
    const { memberId } = params;
    const { overwrites, bannerOptions } = await this.getBannerDataFromRequest(
      params,
      query,
    );
    const { cache = false } = query;

    return this.bannerService.benchmarkBannerRender(
      memberId,
      overwrites,
      bannerOptions,
      cache,
    );
  }

  @Get('/banner/:memberId')
  @HttpCode(HttpStatus.OK)
  async getBanner(
    @Param() params: GetBannerParams,
    @Query() query: GetBannerQuery,
    @Res() res: Response,
  ) {
    const { memberId } = params;
    const { overwrites, bannerOptions } = await this.getBannerDataFromRequest(
      params,
      query,
    );
    const { cache } = query;

    const cacheHeader = this.getCacheHeader(cache);

    if (this.configService.get('IS_DEV')) {
      const svg = await this.handleRenderRequest(
        memberId,
        overwrites,
        bannerOptions,
      );

      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', cacheHeader);
      return res.send(svg);
    }

    const cachedBanner = await this.bannerCacheService.getBannerFromCache({
      userId: memberId,
      overwrites,
      bannerOptions,
    });

    if (cachedBanner) {
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', cacheHeader);

      return res.send(cachedBanner);
    }

    const svg = await this.handleRenderRequest(
      memberId,
      overwrites,
      bannerOptions,
    );

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', cacheHeader);

    return res.send(svg);
  }

  private async handleRenderRequest(
    memberId: string,
    overwrites?: Partial<Record<keyof UserDTO, string>>,
    bannerOptions?: BannerOptions,
  ) {
    const candidate =
      await this.discordService.getMemberByIdOrUsername(memberId);
    if (!candidate) {
      throw new NotFoundException();
    }

    return await this.bannerService.renderBanner(
      candidate,
      candidate.presence?.activities,
      overwrites,
      bannerOptions,
    );
  }

  private async getBannerDataFromRequest(
    params: GetBannerParams,
    query: GetBannerQuery,
  ) {
    const {
      profileEffect,
      decoration,
      compact = false,
      animated = true,
      fakeProfile = false,
    } = query;
    const { memberId } = params;

    const bannerOptions: BannerOptions = {
      compact,
      animated,
    };

    const overwrites: Partial<Record<keyof UserDTO, string>> = pickBy(
      {
        profileEffect,
        avatarDecoration: decoration,
      },
      (p) => p !== undefined,
    );

    if (fakeProfile) {
      const user = await this.discordService.getMemberByIdOrUsername(memberId);
      const fakeProfileData = await this.fakeProfileService.getUserById(
        user?.id as string,
      );

      Object.assign(overwrites, fakeProfileData);
    }

    return { overwrites, bannerOptions };
  }

  private getCacheHeader(value?: boolean) {
    return value ? 'max-age=30000' : 'no-store, no-cache, must-revalidate';
  }
}
