import { Injectable, Logger } from '@nestjs/common';
import { registerFont } from 'canvas';
import * as path from 'path';
import {
  AssetsPath,
  BANNER_DEFAULT_HEIGHT,
  BANNER_DEFAULT_WIDTH,
  BANNER_START_CONTENT_X,
  BannerColors,
  BannerDynamicHeights,
  FlagsImages,
  StatusColors,
} from '@/banner/const';
import { BannerOptions } from '@/banner/types/banner-options';
import { BaseCanvas, MeasurementUnit } from '@/banner/lib/base-canvas';
import { UserDTO } from '@/common/dto/user.dto';
import { UserActivityDTO } from '@/common/dto/user-activity.dto';
import { BaseBannerLayer } from '@/banner/lib/base-banner-layer';
import { UserDataForCanvas } from '@/banner/types/user-data-for-canvas';
import { BorderRadius } from '@/banner/types/border-radius';
import { ProfileEffectsService } from '@/fake-profile/profile-effects.service';
import { AvatarDecorationsService } from '@/fake-profile/avatar-decorations.service';
import { UserFlags } from 'discord.js';
import { pickBy } from 'lodash';
import { getFontInfo } from '@/banner/lib/get-font-info';

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
    const startTime = Date.now();

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

    const layers: (BaseBannerLayer | undefined)[] = [
      new BannerBackground(canvas),
      new BannerAvatar(canvas),
      new BannerStatus(canvas),
      new BannerUsername(canvas),
      new BannerPublicFlags(canvas),
      new BannerActivities(canvas),
      // new BannerCustomStatus(canvas),
      // separator ? new BannerSeparator(canvas) : undefined,
      new BannerProfileEffect(canvas),
    ];

    for (const layer of layers) {
      await layer?.create(userData, bannerOptions);
    }

    const endTime = Date.now();

    this.logger.log(`Time to render a banner spend - ${endTime - startTime}`);

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

class BannerBackground extends BaseBannerLayer {
  x = 0;
  y = 0;
  height: MeasurementUnit = '32%';
  width!: number;

  infoHeight: MeasurementUnit = '75%';

  async render({ user }: UserDataForCanvas) {
    const userBannerURL = user.banner;
    const accentColor = user.accentColor;

    if (userBannerURL) {
      const backgroundImage = await this.canvas.createImage(userBannerURL);

      const scaleX = this.width / backgroundImage.naturalWidth;

      await this.canvas.drawImage({
        image: backgroundImage,
        translate: false,
        x: this.x,
        y:
          (this.canvas.toPixelsY(this.height) - backgroundImage.naturalHeight) /
          2,
        scale: () => ({
          scaleX,
          scaleY: scaleX,
        }),
      });
    } else {
      this.canvas.fillStyle = accentColor ?? BannerColors.DEFAULT_ACCENT_COLOR;

      this.canvas.fillRect({
        x: 0,
        y: 0,
        width: this.width,
        height: this.height,
      });
    }

    // @note: draw an info background
    this.canvas.fillStyle = BannerColors.INFO_BACKGROUND_COLOR;
    this.canvas.fillRect({
      x: 0,
      y: this.height,
      width: this.canvas.width,
      height: this.infoHeight,
    });
  }

  protected beforeRender() {
    this.width = this.canvas.width;
  }
}

class BannerProfileEffect extends BaseBannerLayer {
  x = 0;
  y = 0;
  width: number;
  height: number;

  async render({ user }: UserDataForCanvas) {
    if (!user.profileEffect) {
      return;
    }

    await this.canvas.drawImage({
      x: this.x,
      y: this.y,
      url: user.profileEffect,
      scale: (img) => ({
        scaleX: this.width / img.naturalWidth,
        scaleY: this.width / img.naturalWidth,
      }),
    });
  }

  protected beforeRender(): Promise<void> | void {
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }
}

class BannerAvatar extends BaseBannerLayer {
  x: MeasurementUnit = '18%';
  y: MeasurementUnit = '35%';

  width: MeasurementUnit = '25%';
  height: MeasurementUnit = '50%';
  radius: MeasurementUnit = '50%';

  backgroundWidth: MeasurementUnit = '30%';
  backgroundHeight: MeasurementUnit = '60%';
  backgroundRadius: MeasurementUnit = '50%';

  async render({ user }: UserDataForCanvas): Promise<void> {
    this.drawBackground();
    await this.drawAvatar(user);
    await this.drawDecoration(user);
  }

  private async drawAvatar(user: UserDTO) {
    const size = Math.min(
      this.canvas.toPixelsX(this.width),
      this.canvas.toPixelsY(this.height),
    );
    const radiusInPixels = this.canvas.toPixels(this.radius, size);

    this.canvas.ctx.save();

    this.canvas.fillCircle({
      x: this.x,
      y: this.y,
      radius: radiusInPixels,
      fill: false,
      stroke: false,
    });
    this.canvas.ctx.clip();
    await this.canvas.drawImage({
      url: user.avatar,
      x: this.canvas.toPixelsX(this.x) - size / 2,
      y: this.canvas.toPixelsY(this.y) - size / 2,
      scale: (img) => ({
        scaleX: size / img.naturalWidth,
        scaleY: size / img.naturalHeight,
      }),
    });

    this.canvas.ctx.restore();
  }

  private async drawDecoration(user: UserDTO) {
    if (!user.avatarDecoration) {
      return;
    }

    const size = Math.min(
      this.canvas.toPixelsX(this.backgroundWidth),
      this.canvas.toPixelsY(this.backgroundHeight),
    );

    await this.canvas.drawImage({
      x: this.canvas.toPixelsX(this.x) - size / 2,
      y: this.canvas.toPixelsY(this.y) - size / 2,
      url: user.avatarDecoration,
      scale: (img) => ({
        scaleX: size / img.naturalWidth,
        scaleY: size / img.naturalHeight,
      }),
    });
  }

  private drawBackground() {
    const size = Math.min(
      this.canvas.toPixelsX(this.backgroundWidth),
      this.canvas.toPixelsY(this.backgroundHeight),
    );
    const radius = this.canvas.toPixels(this.backgroundRadius, size);

    this.canvas.fillStyle = BannerColors.INFO_BACKGROUND_COLOR;
    this.canvas.fillCircle({
      x: this.x,
      y: this.y,
      radius,
      fill: true,
    });
  }
}

class BannerStatus extends BaseBannerLayer {
  x: MeasurementUnit;
  y: MeasurementUnit;

  width?: number;
  height?: number;

  // TODO: transform these into percentages
  backgroundRadius = 15;
  radius = 10;

  marginFromAvatar = -25;

  render({ user }: UserDataForCanvas): void {
    const userStatus = user.status;
    if (!userStatus) {
      return;
    }

    this.drawBackground();

    this.canvas.fillStyle = StatusColors[userStatus] as string;
    this.canvas.fillCircle({
      x: this.x,
      y: this.y,
      radius: this.radius,
      fill: true,
      stroke: false,
    });
  }

  protected beforeRender(): Promise<void> | void {
    const avatarLayer = this.getRenderedLayer<BannerAvatar>(BannerAvatar.name);

    const size =
      Math.min(
        this.canvas.toPixelsX(avatarLayer.width),
        this.canvas.toPixelsY(avatarLayer.height),
      ) + this.marginFromAvatar;

    this.x = this.canvas.toPixelsX(avatarLayer.x) + size / 2;
    this.y = this.canvas.toPixelsY(avatarLayer.y) + size / 2;
  }

  private drawBackground() {
    this.canvas.fillStyle = BannerColors.INFO_BACKGROUND_COLOR;
    this.canvas.fillCircle({
      x: this.x,
      y: this.y,
      radius: this.backgroundRadius,
      fill: true,
      stroke: false,
    });
  }
}

class BannerUsername extends BaseBannerLayer {
  y: MeasurementUnit;
  x = BANNER_START_CONTENT_X;

  secondaryFillStyle = BannerColors.THIRD_TEXT_COLOR;
  secondaryFont = getFontInfo(13, 'ABCGintoNormal');

  width?: MeasurementUnit;
  height?: MeasurementUnit;

  fillStyle = BannerColors.BASE_TEXT_COLOR;
  font = getFontInfo(20, 'ABCGintoNormal');

  render({ user }: UserDataForCanvas) {
    const { username, globalName } = user;

    const displayName = globalName ?? username;

    this.drawUsername(displayName);
    if (displayName !== username) {
      this.drawSecondaryUsername(username);
    }
  }

  protected beforeRender({ user }: UserDataForCanvas): Promise<void> | void {
    const avatarLayer = this.getRenderedLayer<BannerAvatar>(BannerAvatar.name);

    const size = Math.min(
      this.canvas.toPixelsX(avatarLayer.backgroundWidth),
      this.canvas.toPixelsY(avatarLayer.backgroundHeight),
    );

    this.y = this.canvas.toPixelsY(avatarLayer.y) + this.font.size + size / 2;
    this.height =
      this.font.size + (user.globalName ? this.secondaryFont.size : 0);
  }

  private drawUsername(username: string) {
    this.canvas.fillStyle = this.fillStyle;
    this.canvas.font = this.font;
    this.canvas.fillText({
      text: username,
      x: this.x,
      y: this.y,
    });
  }

  private drawSecondaryUsername(username: string) {
    const y = this.canvas.toPixelsY(this.y) + this.font.size;

    this.canvas.fillStyle = this.secondaryFillStyle;
    this.canvas.font = this.secondaryFont;
    this.canvas.fillText({
      text: username,
      x: this.x,
      y: y,
    });
  }
}

class BannerPublicFlags extends BaseBannerLayer {
  x: MeasurementUnit = BANNER_START_CONTENT_X;
  y: MeasurementUnit;
  width = 24;
  height = 24;

  marginBetweenFlags = 2.5;

  async render({ user }: UserDataForCanvas): Promise<void> {
    const { flags } = user;
    if (!flags || !flags.length) {
      return;
    }

    const images = Object.values(
      pickBy(FlagsImages, (value, key) =>
        flags.includes(key as keyof typeof UserFlags),
      ),
    );

    if (user.premiumSince) {
      images.push(path.resolve(AssetsPath, 'icons/flags/nitro.svg'));
    }

    let x = this.canvas.toPixelsX(this.x);

    this.canvas.fillStyle = BannerColors.SECONDARY_BACKGROUND_COLOR;
    this.canvas.roundRect({
      x: this.x,
      y: this.y,
      width:
        (this.width + this.marginBetweenFlags) * images.length -
        this.marginBetweenFlags,
      height: this.height,
      radius: 4.5,
    });

    for (const flagImage of images) {
      await this.canvas.drawImage({
        x,
        y: this.y,
        url: flagImage,
        local: true,
        scale: (img) => ({
          scaleX: this.width / img.naturalWidth,
          scaleY: this.height / img.naturalHeight,
        }),
      });

      x += this.width + this.marginBetweenFlags;
    }
  }

  protected beforeRender(): Promise<void> | void {
    const usernameLayer = this.getRenderedLayer<BannerUsername>(
      BannerUsername.name,
    );

    // todo? refactor?

    const zeroY =
      this.canvas.toPixelsY(usernameLayer.y) - usernameLayer.font.size;

    this.y =
      zeroY +
      this.canvas.toPixelsY(usernameLayer.height!) +
      usernameLayer.secondaryFont.size;
  }
}

class BannerActivities extends BaseBannerLayer {
  x = BANNER_START_CONTENT_X;
  y: MeasurementUnit;

  activityWidth: MeasurementUnit = '90%';
  activityHeight: MeasurementUnit = 80;
  activityRadius: number = 10;
  activityPadding = 10;

  activityImageSize = 60;
  activityImageRadius = 5;

  currentActivity: UserActivityDTO;
  currentActivityY: number;

  gapBetweenActivities = 10;

  width: MeasurementUnit = '90%';
  height?: number;

  async render({ activities }: UserDataForCanvas): Promise<void> {
    this.currentActivityY = this.canvas.toPixelsY(this.y);

    for (const activity of activities) {
      this.currentActivity = activity;
      await this.drawActivity();

      this.currentActivityY +=
        this.canvas.toPixelsY(this.activityHeight) + this.gapBetweenActivities;
    }
  }

  protected beforeRender() {
    const publicFlagsLayer = this.getRenderedLayer<BannerPublicFlags>(
      BannerPublicFlags.name,
    );

    const marginTop = 10;

    this.y =
      this.canvas.toPixelsY(publicFlagsLayer.y) +
      this.canvas.toPixelsY(publicFlagsLayer.height) +
      marginTop;
  }

  private drawActivityBackground() {
    this.canvas.fillStyle = BannerColors.SECONDARY_BACKGROUND_COLOR;
    this.canvas.roundRect({
      x: this.x,
      y: this.currentActivityY,
      height: this.activityHeight,
      width: this.activityWidth,
      radius: this.activityRadius,
    });
  }

  private async drawActivityImage() {
    const x = this.canvas.toPixelsX(this.x) + this.activityPadding;
    const y = this.currentActivityY + this.activityPadding;

    const defaultActivityImageURL = path.resolve(
      AssetsPath,
      'icons/activity.svg',
    );
    const activityImageURL =
      this.currentActivity.largeImageURL ?? defaultActivityImageURL;
    const activityImage = await this.canvas.createImage(
      activityImageURL,
      activityImageURL === defaultActivityImageURL,
    );

    this.canvas.ctx.save();

    this.canvas.roundRect({
      x,
      y,
      width: this.activityImageSize,
      height: this.activityImageSize,
      fill: false,
      stroke: false,
      radius: this.activityImageRadius,
    });
    this.canvas.ctx.clip();

    const imageAspectRatio =
      activityImage.naturalWidth / activityImage.naturalHeight;

    await this.canvas.drawImage({
      // TODO: I SWEAR I DON'T KNOW THIS THING WORKS
      x: imageAspectRatio === 1 ? x : x - this.activityImageSize / 2,
      y,
      image: activityImage,
      scale: (img) => ({
        scaleX: this.activityImageSize / img.naturalHeight,
        scaleY: this.activityImageSize / img.naturalHeight,
      }),
    });

    this.canvas.ctx.restore();
  }

  private drawActivityInfo() {
    const font = getFontInfo(10, 'ABCGintoNormal');
    const marginLeft = 10;

    const x =
      this.canvas.toPixelsX(this.x) +
      this.activityPadding +
      this.activityImageSize +
      marginLeft;
    const y = this.currentActivityY + this.activityPadding + font.size;

    this.canvas.fillStyle = BannerColors.BASE_TEXT_COLOR;
    this.canvas.font = font;
    this.canvas.fillText({
      text: 'Hello world',
      x,
      y,
    });
  }

  private async drawActivity() {
    this.drawActivityBackground();
    await this.drawActivityImage();
    this.drawActivityInfo();
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

// class BannerCustomStatus extends BaseBannerLayer {
//   x = BANNER_START_CONTENT_X;
//   y = 269;
//
//   width?: number;
//   height?: number;
//
//   maxLength = 45;
//   fillStyle = BannerColors.THIRD_TEXT_COLOR;
//   font = "18px 'Whitney'";
//
//   constructor(canvas: BaseCanvas) {
//     super(canvas);
//   }
//
//   render({ user }: UserDataForCanvas): void {
//     const { customStatus } = user;
//     if (typeof customStatus !== 'string') {
//       return;
//     }
//
//     let text = customStatus;
//
//     if (text.length > this.maxLength) {
//       text = `${text.slice(0, this.maxLength)}...`;
//     }
//
//     this.canvas.fillStyle = this.fillStyle;
//     this.canvas.font = this.font;
//     this.canvas.fillText({
//       text,
//       x: this.x,
//       y: this.y,
//     });
//   }
// }

// class BannerSeparator extends BaseBannerLayer {
//   x = BANNER_START_CONTENT_X;
//   y = 310;
//   height = 1;
//   width = 663;
//
//   fillStyle = 'rgba(255, 255, 255, 0.1)';
//
//   constructor(canvas: BaseCanvas) {
//     super(canvas);
//   }
//
//   render(): void {
//     this.canvas.fillStyle = this.fillStyle;
//     this.canvas.fillRect({
//       x: this.x,
//       y: this.y,
//       width: this.width,
//       height: this.height,
//     });
//   }
// }
