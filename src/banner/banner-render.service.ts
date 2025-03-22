import { Injectable, Logger } from '@nestjs/common';
import { registerFont } from 'canvas';
import * as path from 'path';
import {
  AssetsPath,
  BANNER_DEFAULT_HEIGHT,
  BANNER_DEFAULT_WIDTH,
  BannerDynamicHeights,
} from '@/banner/const';
import { BannerOptions } from '@/banner/types/banner-options';
import { BaseCanvas } from '@/banner/lib/base-canvas';
import { UserDTO } from '@/common/dto/user.dto';
import { UserActivityDTO } from '@/common/dto/user-activity.dto';
import { BaseBannerLayer } from '@/banner/lib/base-banner-layer';
import { UserDataForCanvas } from '@/banner/types/user-data-for-canvas';
import { BorderRadius } from '@/banner/types/border-radius';
import { ProfileEffectsService } from '@/fake-profile/profile-effects.service';
import { AvatarDecorationsService } from '@/fake-profile/avatar-decorations.service';
import { BannerBackground } from '@/banner/layers/banner-background';
import { BannerAvatar } from '@/banner/layers/banner-avatar';
import { BannerStatus } from '@/banner/layers/banner-status';
import { BannerUsername } from '@/banner/layers/banner-username';
import { BannerPublicFlags } from '@/banner/layers/banner-public-flags';
import { BannerActivities } from '@/banner/layers/banner-activities';
import { BannerProfileEffect } from '@/banner/layers/banner-profile-effect';

// TODO: add custom status layer

@Injectable()
export class BannerRenderService {
  private readonly logger = new Logger(BannerRenderService.name);

  private readonly width = BANNER_DEFAULT_WIDTH;
  private readonly height = BANNER_DEFAULT_HEIGHT;
  private readonly borderRadius: BorderRadius = 15;

  constructor(
    private profileEffectsService: ProfileEffectsService,
    private avatarDecorationsService: AvatarDecorationsService,
  ) {
    registerFont(path.resolve(AssetsPath, 'fonts/ABCGintoNormal.otf'), {
      family: 'ABCGintoNormal',
      style: 'normal',
    });
    registerFont(path.resolve(AssetsPath, 'fonts/Whitney.otf'), {
      family: 'Whitney',
      style: 'normal',
    });
  }

  async create(
    user: UserDTO,
    activities: UserActivityDTO[] = [],
    bannerOptions?: BannerOptions,
  ) {
    if (user.profileEffect) {
      user.profileEffect = this.profileEffectsService.getProfileEffectURL(
        user.profileEffect,
        bannerOptions?.animated,
      );
    }

    if (user.avatarDecoration) {
      user.avatarDecoration = this.avatarDecorationsService.getDecorationUrl(
        user.avatarDecoration,
        bannerOptions?.animated,
      );
    }

    const userData: UserDataForCanvas = { user, activities };
    const { height } = this.calculateHeight(userData);

    const canvas = new BaseCanvas(this.width, height, 'svg');

    canvas.roundRect({
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
      radius: this.borderRadius,
      fill: false,
      stroke: false,
    });

    canvas.ctx.clip();

    const layers: BaseBannerLayer[] = [
      new BannerBackground(canvas),
      new BannerAvatar(canvas),
      new BannerStatus(canvas),
      new BannerUsername(canvas),
      new BannerPublicFlags(canvas),
      new BannerActivities(canvas),
      new BannerProfileEffect(canvas),
    ];

    const stats: Record<string, number> = {};

    for (const layer of layers) {
      const startTime = Date.now();
      await layer.create(userData, bannerOptions);
      const endTime = Date.now();

      stats[layer.constructor.name] = endTime - startTime;
    }

    return { canvas, stats };
  }

  private calculateHeight({ user, activities }: UserDataForCanvas) {
    const heightCandidate = BannerDynamicHeights.find((o) =>
      o.condition(user, activities),
    );
    const height = heightCandidate?.height ?? this.height;

    return { height };
  }
}
