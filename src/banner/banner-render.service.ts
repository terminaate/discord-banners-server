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
import { UserFlags } from 'discord.js';
import { BannerBackground } from '@/banner/layers/banner-background';
import { BannerAvatar } from '@/banner/layers/banner-avatar';
import { BannerStatus } from '@/banner/layers/banner-status';
import { BannerUsername } from '@/banner/layers/banner-username';
import { BannerPublicFlags } from '@/banner/layers/banner-public-flags';
import { BannerActivities } from '@/banner/layers/banner-activities';
import { BannerProfileEffect } from '@/banner/layers/banner-profile-effect';

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
    // TODO: add user ability to choose height of banner, add scale parameter
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

    this.logger.log(`Time to render a banner spend`, stats);

    return canvas;
  }

  private calculateHeight({ user, activities }: UserDataForCanvas) {
    const heightCandidate = BannerDynamicHeights.find((o) =>
      o.condition(user, activities),
    );
    let height = this.height;
    let separator = true;

    if (heightCandidate) {
      height = heightCandidate.height;
      separator = Boolean(heightCandidate.separator);
    }

    return { height, separator };
  }
}

// class BannerActivity extends BaseBannerLayer {
//   x = BANNER_START_CONTENT_X;
//   y = 371;
//
//
//   activityTypeFont = "18px 'ABCGintoNormal'";
//   activityTypeFillStyle = BannerColors.SECOND_TEXT_COLOR;
//
//   activityImageY = 384;
//   activityImageHeight = 42;
//   activityImageWidth = 42;
//
//   // TODO?: refactor these variables
//   activityNameFont = "normal 500 18px 'ABCGintoNormal'";
//   activityNameFillStyle = BannerColors.THIRD_TEXT_COLOR;
//   activityNameY = 402;
//   activityNameX = 312;
//
//   activityStartTimeFont = "18px 'Whitney'";
//   activityStartTimeFillStyle = BannerColors.THIRD_TEXT_COLOR;
//   activityStartTimeX = 312;
//   activityStartTimeY = 422;
//
//   constructor(private canvas: BaseCanvas) {
//     super();
//   }
//
//   async render({ activity }: UserDataForCanvas): Promise<void> {
//     if (!activity) {
//       return;
//     }
//
//     this.drawActivityType(activity);
//     await this.drawActivityImage(activity);
//     this.drawActivityName(activity);
//     this.drawActivityStartTime(activity);
//   }
//
//   private drawActivityType(activity: UserActivityDTO) {
//     const activityType = activity.type;
//
//     this.canvas.fillStyle = this.activityTypeFillStyle;
//     this.canvas.font = this.activityTypeFont;
//     this.canvas.fillText({
//       text: ActivitiesText[activityType] as string,
//       x: this.x,
//       y: this.y,
//     });
//   }
//
//   private async drawActivityImage(activity: UserActivityDTO) {
//     const defaultActivityImage = path.resolve(AssetsPath, 'icons/activity.svg');
//
//     const activityImageURL = activity.largeImageURL ?? defaultActivityImage;
//     const isLocalImage = activityImageURL === defaultActivityImage;
//
//     const activityImage = await this.canvas.createImage(
//       activityImageURL,
//       isLocalImage,
//     );
//
//     // this.canvas.ctx.drawImage(
//     //   activityImage,
//     //   this.x,
//     //   this.activityImageY * this.canvas.heightScale,
//     //   this.activityImageWidth,
//     //   this.activityImageHeight,
//     // );
//   }
//
//   private drawActivityName(activity: UserActivityDTO) {
//     const activityName = activity.name;
//
//     this.canvas.fillStyle = this.activityNameFillStyle;
//     this.canvas.font = this.activityNameFont;
//     this.canvas.fillText({
//       text: activityName,
//       x: this.activityNameX,
//       y: this.activityNameY,
//     });
//   }
//
//   private drawActivityStartTime(activity: UserActivityDTO) {
//     const activityStartTime = activity.start;
//     const activityType = activity.type;
//     if (!activityStartTime) {
//       return;
//     }
//
//     const activityText = ActivitiesText[activityType] as string;
//
//     const startTimestamp = +activityStartTime;
//
//     const currentTime = +new Date();
//     const differenceInMin = (currentTime - startTimestamp) / 100_000;
//     const differenceInHour = (currentTime - startTimestamp) / 100_000 / 60;
//     let timeText: string = `Just started ${activityText.toLowerCase()}`;
//
//     if (differenceInMin >= 1) {
//       timeText = `for ${Math.ceil(differenceInMin)} minutes`;
//     }
//
//     if (differenceInHour >= 1) {
//       timeText = `for ${Math.ceil(differenceInHour)} hours`;
//     }
//
//     this.canvas.fillStyle = this.activityStartTimeFillStyle;
//     this.canvas.font = this.activityStartTimeFont;
//     this.canvas.fillText({
//       text: timeText,
//       x: this.activityStartTimeX,
//       y: this.activityStartTimeY,
//     });
//   }
// }
