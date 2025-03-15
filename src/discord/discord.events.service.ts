import { Injectable, Logger } from '@nestjs/common';
import { Context, ContextOf, On, Once } from 'necord';
import { BannerCacheService } from '@/banner/banner-cache.service';
import { BannerService } from '@/banner/banner.service';

@Injectable()
export class DiscordEventsService {
  private readonly logger = new Logger(DiscordEventsService.name);

  constructor(
    private bannerCacheService: BannerCacheService,
    private bannerService: BannerService,
  ) {}

  @Once('ready')
  onReady(@Context() [client]: ContextOf<'ready'>) {
    this.logger.log(`Logged in as ${client.user?.tag}!`);
  }

  @On('guildMemberUpdate')
  async onMemberUpdate(@Context() [, member]: ContextOf<'guildMemberUpdate'>) {
    const cacheData = await this.bannerCacheService.getCachedBannerData({
      userId: member.id,
    });

    const overwrites = cacheData?.overwrites;
    const bannerOptions = cacheData?.bannerOptions;

    void this.bannerService.renderBanner(
      member,
      member.presence?.activities,
      overwrites,
      bannerOptions,
    );
  }

  @On('presenceUpdate')
  async onPresenceUpdate(@Context() [, presence]: ContextOf<'presenceUpdate'>) {
    const member = presence.member;
    if (!member) {
      return;
    }

    const cacheData = await this.bannerCacheService.getCachedBannerData({
      userId: member.id,
    });

    const overwrites = cacheData?.overwrites;
    const bannerOptions = cacheData?.bannerOptions;

    void this.bannerService.renderBanner(
      member,
      presence.activities,
      overwrites,
      bannerOptions,
    );
  }

  @On('guildMemberAdd')
  onMemberAdd(@Context() [member]: ContextOf<'guildMemberAdd'>) {
    void this.bannerService.renderBanner(member, member.presence?.activities);
  }
}
