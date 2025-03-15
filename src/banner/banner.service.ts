import { Injectable } from '@nestjs/common';
import { BannerRenderService } from '@/banner/banner-render.service';
import { BannerCacheService } from '@/banner/banner-cache.service';
import { Activity, ActivityType, GuildMember } from 'discord.js';
import { UserDTO } from '@/common/dto/user.dto';
import { BannerOptions } from '@/banner/types/banner-options';
import { UserActivityDTO } from '@/common/dto/user-activity.dto';

@Injectable()
export class BannerService {
  constructor(
    private renderService: BannerRenderService,
    private cacheService: BannerCacheService,
  ) {}

  async renderBanner(
    member: GuildMember,
    activities?: Activity[],
    overwrites?: Partial<Record<keyof UserDTO, string>>,
    bannerOptions?: BannerOptions,
  ) {
    const activity = activities?.find((o) => o.type !== ActivityType.Custom);
    const activityDto = activity ? new UserActivityDTO(activity) : undefined;

    const userDto = new UserDTO(member);
    Object.assign(userDto, overwrites);

    const canvas = await this.renderService.create(
      userDto,
      activityDto,
      bannerOptions,
    );

    const svg = canvas.toBuffer().toString();

    await this.cacheService.setBannerInCache(
      {
        userId: userDto.id,
        username: userDto.username,
        bannerOptions,
        overwrites,
      },
      svg,
    );

    return svg;
  }
}
