import { Injectable, NotFoundException } from '@nestjs/common';
import { BannerRenderService } from '@/banner/banner-render.service';
import { Activity, ActivityType, GuildMember } from 'discord.js';
import { UserDTO } from '@/common/dto/user.dto';
import { BannerOptions } from '@/banner/types/banner-options';
import { sum } from 'lodash';
import { DiscordService } from '@/discord/discord.service';
import { formatBytes } from '@/utils/formatBytes';
import { UserActivityDTO } from '@/common/dto/user-activity.dto';

@Injectable()
export class BannerService {
  constructor(
    private renderService: BannerRenderService,
    private discordService: DiscordService,
  ) {}

  async benchmarkBannerRender(
    memberId: string,
    overwrites: Partial<Record<keyof UserDTO, string>>,
    bannerOptions: BannerOptions,
  ) {
    // TODO: expand this function, remove rendering users, and add two data sets with most complex and most easiest data's

    const member = await this.discordService.getMemberByIdOrUsername(memberId);
    if (!member) {
      throw new NotFoundException();
    }

    const results: Record<string, number> = {};

    for (let i = 0; i < 100; i++) {
      const startDate = Date.now();

      await this.renderBanner(
        member,
        member.presence?.activities,
        overwrites,
        bannerOptions,
      );

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
    const filteredActivities =
      activities
        ?.filter((o) => o.type !== ActivityType.Custom)
        .map((o) => new UserActivityDTO(o))
        .slice(0, 2) ?? [];

    const userDto = new UserDTO(member);
    Object.assign(userDto, overwrites);

    const canvas = await this.renderService.create(
      userDto,
      filteredActivities,
      bannerOptions,
    );

    const svg = canvas.toBuffer().toString();

    console.log('svg size', formatBytes(svg.length));

    return svg;
  }
}
