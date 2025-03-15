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
