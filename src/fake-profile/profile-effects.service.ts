import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ProfileEffect } from '@/fake-profile/types/profile-effect';

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

  private async init() {
    const { data: effects } =
      await this.httpService.axiosRef.get<typeof this.profileEffects>(
        '/profile-effects',
      );

    this.profileEffects = effects;

    this.logger.log('Profile effects retrieved');
  }
}
