import { Injectable, NotFoundException } from '@nestjs/common';
import { BannerRenderService } from '@/banner/banner-render.service';
import { BannerCacheService } from '@/banner/banner-cache.service';
import { Activity, ActivityType, GuildMember } from 'discord.js';
import { UserDTO } from '@/common/dto/user.dto';
import { BannerOptions } from '@/banner/types/banner-options';
import { UserActivityDTO } from '@/common/dto/user-activity.dto';
import { sum } from 'lodash';
import { DiscordService } from '@/discord/discord.service';

@Injectable()
export class BannerService {
  constructor(
    private renderService: BannerRenderService,
    private cacheService: BannerCacheService,
    private discordService: DiscordService,
  ) {}

  async benchmarkBannerRender(
    memberId: string,
    overwrites: Partial<Record<keyof UserDTO, string>>,
    bannerOptions: BannerOptions,
    cache = false,
  ) {
    const member = await this.discordService.getMemberByIdOrUsername(memberId);
    if (!member) {
      throw new NotFoundException();
    }

    const results: Record<string, number> = {};

    for (let i = 0; i < 100; i++) {
      const startDate = Date.now();

      if (cache) {
        const cachedBanner = await this.cacheService.getBannerFromCache({
          userId: memberId,
          overwrites,
          bannerOptions,
        });

        if (!cachedBanner) {
          await this.renderBanner(
            member,
            member.presence?.activities,
            overwrites,
            bannerOptions,
          );
        }
      } else {
        await this.renderBanner(
          member,
          member.presence?.activities,
          overwrites,
          bannerOptions,
        );
      }

      const endDate = Date.now();

      results[i] = endDate - startDate;
    }

    const values = Object.values(results);

    const averageTime = sum(values) / values.length;

    return { averageTime, values };
  }

  // TODO: add statistics of rendered banners

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
