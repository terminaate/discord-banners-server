import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ProfileEffect } from '@/fake-profile/types/profile-effect';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ProfileEffectsService {
  private readonly logger = new Logger(ProfileEffectsService.name);

  private profileEffects: Record<string, ProfileEffect> = {};

  constructor(private httpService: HttpService) {
    void this.init();
  }

  getAll() {
    return this.profileEffects;
  }

  getProfileEffectURL(effect: string, animated = true) {
    const profileEffectObject = this.getProfileEffectById(effect);
    if (!profileEffectObject) {
      return;
    }

    return animated
      ? profileEffectObject.config.effects[0].src
      : profileEffectObject.config.reducedMotionSrc;
  }

  getProfileEffectById(id: string) {
    return this.profileEffects[id];
  }

  @Cron('0 * * * *')
  private async init() {
    const response = await this.httpService.axiosRef
      .get<typeof this.profileEffects>('/profile-effects')
      .catch(() => null);
    if (!response) {
      return;
    }

    this.profileEffects = response.data;

    this.logger.log('Profile effects retrieved');
  }
}
