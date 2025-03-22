import { Injectable } from '@nestjs/common';
import { ProfileEffectsService } from '@/fake-profile/profile-effects.service';
import { AvatarDecorationsService } from '@/fake-profile/avatar-decorations.service';
import { DiscordService } from '@/discord/discord.service';
import { UserDTO } from '@/common/dto/user.dto';
import { UserActivityDTO } from '@/common/dto/user-activity.dto';
import { Activity, ActivityType, ImageURLOptions } from 'discord.js';
import { BannerRenderService } from '@/banner/banner-render.service';
import { BannerOptions } from '@/banner/types/banner-options';
import { sum } from 'lodash';

const DEFAULT_ACTIVITY_IMAGE =
  'https://media.discordapp.net/external/Pgc0VfJ5EpywSMFL5AJb2ReOsBel5nnbzW3XfRwEASU/https/lh3.googleusercontent.com/HsJJhD-IgDeoW_uM9AcR3gfM17IlK5RLCWd1BS9ItUUw0tKhVkRfDpsZ4arHCkMPYkm34wIhviYcvp4%3Dw544-h544-l90-rj';

@Injectable()
export class BannerBenchmarkService {
  constructor(
    private profileEffectsService: ProfileEffectsService,
    private avatarDecorationService: AvatarDecorationsService,
    private discordService: DiscordService,
    private renderService: BannerRenderService,
  ) {}

  async benchmarkBannerRender(complex: boolean) {
    const randomUser = this.discordService.getRandomUser()!;

    const userDto = new UserDTO(randomUser);

    if (complex) {
      Object.assign(userDto, {
        profileEffect: this.getRandomProfileEffect(),
        avatarDecoration: this.getRandomAvatarDecoration(),
      });
    } else {
      userDto.profileEffect = undefined;
      userDto.avatarDecoration = undefined;
    }

    const activities: UserActivityDTO[] = [];

    if (complex) {
      const baseActivity = new UserActivityDTO({
        type: ActivityType.Listening,
        timestamps: { start: Date.now(), end: Date.now() },
        createdTimestamp: Date.now(),
        state: 'ASJDHAJDHASJKHDKJASHDKJASHDJ',
        assets: {
          largeImageURL(options?: ImageURLOptions): string | null {
            return DEFAULT_ACTIVITY_IMAGE;
          },
        },
        details: 'DKASJDLKASLKDJASLKDJKAS',
      } as unknown as Activity);

      activities.push(baseActivity, baseActivity);
    }

    const bannerOptions: BannerOptions = { animated: false };
    if (complex) {
      bannerOptions.animated = true;
    }

    const results: Record<string, number> = {};

    for (let i = 0; i < 100; i++) {
      const startDate = Date.now();

      await this.renderService.create(userDto, activities, bannerOptions);

      const endDate = Date.now();

      results[i] = endDate - startDate;
    }

    const values = Object.values(results);

    const averageTime = sum(values) / values.length;

    return { averageTime, values };
  }

  private getRandomProfileEffect() {
    const data = Object.keys(this.profileEffectsService.getAll());

    return data[Math.floor(Math.random() * data.length)];
  }

  private getRandomAvatarDecoration() {
    const data = Object.keys(this.avatarDecorationService.getAll());

    return data[Math.floor(Math.random() * data.length)];
  }
}
