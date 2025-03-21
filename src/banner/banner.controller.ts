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
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { BannerOptions } from '@/banner/types/banner-options';
import { UserDTO } from '@/common/dto/user.dto';
import { pickBy } from 'lodash';
import { DiscordService } from '@/discord/discord.service';
import { BannerService } from '@/banner/banner.service';
import { Response } from 'express';
import { FakeProfileService } from '@/fake-profile/fake-profile.service';
import { Transform } from 'class-transformer';
import ms from 'ms';

class GetBannerParams {
  @IsString()
  memberId: string;
}

// TODO: add profileEffect & decoration validation

class GetBannerQuery {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  animated?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  compact?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  fakeProfile?: boolean;

  @IsOptional()
  @IsString()
  profileEffect?: string;

  @IsOptional()
  @IsString()
  decoration?: string;
}

@Controller()
export class BannerController {
  private readonly bannerCacheTTL = ms('30s');

  constructor(
    private discordService: DiscordService,
    private bannerService: BannerService,
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

    return this.bannerService.benchmarkBannerRender(
      memberId,
      overwrites,
      bannerOptions,
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

    const svg = await this.handleRenderRequest(
      memberId,
      overwrites,
      bannerOptions,
    );

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', `max-age=${this.bannerCacheTTL}`);

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
}
