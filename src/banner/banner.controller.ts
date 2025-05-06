import { BannerBenchmarkService } from '@/banner/banner-benchmark.service';
import { BannerService } from '@/banner/banner.service';
import { BannerOptions } from '@/banner/types/banner-options';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { UserDTO } from '@/common/dto/user.dto';
import { DiscordService } from '@/discord/discord.service';
import { FakeProfileService } from '@/fake-profile/fake-profile.service';
import {
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Response } from 'express';
import { pickBy } from 'lodash';
import ms from 'ms';

class GetBannerParams {
  @IsString()
  memberId: string;
}

class GetBannerQuery {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  animated?: boolean;

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

class BenchmarkBannerQuery {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  complex?: boolean;
}

@Controller()
export class BannerController {
  private readonly bannerCacheTTL = ms('30s');

  constructor(
    private discordService: DiscordService,
    private bannerService: BannerService,
    private bannerBenchmarkService: BannerBenchmarkService,
    private fakeProfileService: FakeProfileService,
    private configService: ConfigService,
  ) {}

  @Get('/banner-benchmark')
  @HttpCode(HttpStatus.OK)
  async getBannerBenchmark(@Query() { complex }: BenchmarkBannerQuery) {
    const IS_DEV = this.configService.get<boolean>('IS_DEV');
    if (!IS_DEV) {
      throw new HttpException(
        'Banner benchmark allowed only in dev mode!',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.bannerBenchmarkService.benchmarkBannerRender(
      complex !== undefined,
    );
  }

  @Get('/stats')
  @HttpCode(HttpStatus.OK)
  async getStats(@Query() paginationDto: PaginationDto) {
    return this.bannerService.getStats(paginationDto);
  }

  @Get('/banner/:memberId')
  @HttpCode(HttpStatus.OK)
  async getBanner(
    @Param() params: GetBannerParams,
    @Query() query: GetBannerQuery,
    @Res() res: Response,
  ) {
    throw new Error('my exception');
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
      animated = true,
      fakeProfile = false,
    } = query;
    const { memberId } = params;

    const bannerOptions: BannerOptions = {
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
