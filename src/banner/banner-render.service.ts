import { Injectable } from '@nestjs/common';
import { registerFont } from 'canvas';
import * as path from 'path';
import {
  ActivitiesText,
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

// TODO: add dynamic measurements like %

@Injectable()
export class BannerRenderService {
  private readonly width = BANNER_DEFAULT_WIDTH;
  private readonly height = BANNER_DEFAULT_HEIGHT;
  private readonly borderRadius: BorderRadius = 14;

  constructor(
    private profileEffectsService: ProfileEffectsService,
    private avatarDecorationsService: AvatarDecorationsService,
  ) {
    registerFont(path.resolve(AssetsPath, 'fonts/ABCGintoNormal.otf'), {
      family: 'ABCGintoNormal',
      style: 'normal',
      weight: '700',
    });
    registerFont(path.resolve(AssetsPath, 'fonts/Whitney.otf'), {
      family: 'Whitney',
      style: 'normal',
    });
  }

  async create(
    user: UserDTO,
    activity?: UserActivityDTO,
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

    const userData: UserDataForCanvas = { user, activity };
    const { height, separator } = this.calculateHeight(userData);

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

    // TODO: add cliping canvas border-radius

    const layers: (BaseBannerLayer | undefined)[] = [
      new BannerBackground(canvas),
      new BannerAvatar(canvas),
      new BannerStatus(canvas),
      new BannerUsername(canvas),
      new BannerPublicFlags(canvas),
      new BannerNitro(canvas),
      new BannerActivity(canvas),
      new BannerCustomStatus(canvas),
      separator ? new BannerSeparator(canvas) : undefined,
      new BannerProfileEffect(canvas),
    ];

    for (const layer of layers) {
      await layer?.render(userData, bannerOptions);
    }

    return canvas;
  }

  private calculateHeight({ user, activity }: UserDataForCanvas) {
    const heightCandidate = BannerDynamicHeights.find((o) =>
      o.condition(user, activity),
    );
    let height = BANNER_DEFAULT_HEIGHT;
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
  height: MeasurementUnit = '48%';
  width!: number;

  infoHeight: MeasurementUnit = '52%';

  constructor(private canvas: BaseCanvas) {
    super();

    this.width = canvas.width;
  }

  async render({ user }: UserDataForCanvas) {
    const userBannerURL = user.banner;
    const accentColor = user.accentColor;

    if (userBannerURL) {
      await this.canvas.drawImage({
        url: userBannerURL,
        x: this.x,
        y: this.y,
        scale: (img) => ({
          scaleX: this.width / img.naturalWidth,
          scaleY: this.width / img.naturalWidth,
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
    this.canvas.fillStyle = BannerColors.INFO_COLOR;
    this.canvas.fillRect({
      x: 0,
      y: this.height,
      width: this.canvas.width,
      height: this.infoHeight,
    });
  }
}

class BannerProfileEffect extends BaseBannerLayer {
  x = 0;
  y = 0;
  width: number;
  height: number;

  constructor(private canvas: BaseCanvas) {
    super();

    this.width = canvas.width;
    this.height = canvas.height;
  }

  async render({ user }: UserDataForCanvas, bannerOptions?: BannerOptions) {
    if (!user.profileEffect) {
      return;
    }

    const profileEffectImage = await this.canvas.createImage(
      user.profileEffect,
    );

    // this.canvas.ctx.save();
    //
    // this.canvas.ctx.translate(
    //   this.x,
    //   bannerOptions?.compact
    //     ? 0
    //     : (this.canvas.height - profileEffectImage.naturalHeight) / 2,
    // );
    //
    // const x = this.width / profileEffectImage.naturalWidth;
    //
    // this.canvas.ctx.scale(x, x);
    // this.canvas.roundImage({
    //   x: 0,
    //   y: 0,
    //   image: profileEffectImage,
    //   radius: this.canvas.borderRadius,
    // });
    //
    // this.canvas.ctx.restore();
  }
}

class BannerAvatar extends BaseBannerLayer {
  x = 73;
  y = 136;
  height = 159;
  width = 159;

  radius = 79.5;

  backgroundX = 152.5;
  backgroundY = 215.5;
  backgroundRadius = 94.5;

  decorationHeight = 189;
  decorationWidth = 189;
  decorationX = 58;
  decorationY = 121;

  constructor(private canvas: BaseCanvas) {
    super();
  }

  async render({ user }: UserDataForCanvas): Promise<void> {
    this.drawBackground();
    await this.drawAvatar(user);
    await this.drawDecoration(user);
  }

  private async drawAvatar(user: UserDTO) {
    const ctx = this.canvas.ctx;

    // TODO: refactor?
    const avatarImage = await this.canvas.createImage(user.avatar);

    ctx.save();

    ctx.beginPath();
    ctx.arc(
      this.backgroundX,
      this.backgroundY,
      this.radius,
      0,
      2 * Math.PI,
      false,
    );
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImage, this.x, this.y, this.width, this.height);

    ctx.restore();
  }

  private async drawDecoration(user: UserDTO) {
    if (!user.avatarDecoration) {
      return;
    }

    const decorationImage = await this.canvas.createImage(
      user.avatarDecoration,
    );

    this.canvas.ctx.save();

    this.canvas.ctx.translate(this.decorationX, this.decorationY);
    this.canvas.ctx.scale(
      this.decorationWidth / decorationImage.naturalWidth,
      this.decorationHeight / decorationImage.naturalHeight,
    );
    this.canvas.ctx.drawImage(decorationImage, 0, 0);

    this.canvas.ctx.restore();
  }

  private drawBackground() {
    this.canvas.fillStyle = BannerColors.INFO_COLOR;
    this.canvas.fillCircle({
      x: this.backgroundX,
      y: this.backgroundY,
      radius: this.backgroundRadius,
      fill: true,
    });
  }
}

class BannerStatus extends BaseBannerLayer {
  x = 206.5;
  y = 270.5;

  width?: number;
  height?: number;

  backgroundRadius = 27.5;
  radius = 17.5;

  constructor(private canvas: BaseCanvas) {
    super();
  }

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

  private drawBackground() {
    this.canvas.fillStyle = BannerColors.INFO_COLOR;
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
  y = 234;
  x = BANNER_START_CONTENT_X;

  width?: MeasurementUnit;
  height?: MeasurementUnit;

  fillStyle = BannerColors.BASE_TEXT_COLOR;
  font = "34px 'ABCGintoNormal'";

  constructor(private canvas: BaseCanvas) {
    super();
  }

  render({ user }: UserDataForCanvas) {
    const { username } = user;

    this.canvas.fillStyle = this.fillStyle;
    this.canvas.font = this.font;
    this.canvas.fillText({
      text: username,
      x: this.x,
      y: '55%',
    });
  }
}

class BannerPublicFlags extends BaseBannerLayer {
  x = 901;
  y = 212;
  width = 24;
  height = 24;

  constructor(private canvas: BaseCanvas) {
    super();

    this.x = this.canvas.width - 60;
  }

  async render({ user }: UserDataForCanvas): Promise<void> {
    // TODO add support for multiple flags
    const { flags } = user;
    if (!flags || !flags.length) {
      return;
    }

    const hypesquadImage = await this.canvas.createImage(
      FlagsImages[flags[0]]!,
      true,
    );

    this.canvas.ctx.drawImage(
      hypesquadImage,
      this.x,
      this.y,
      this.width,
      this.height,
    );
  }
}

class BannerNitro extends BaseBannerLayer {
  x = 857;
  y = 212;
  width = 34;
  height = 24;

  constructor(private canvas: BaseCanvas) {
    super();

    this.x = this.canvas.width - 104;
  }

  async render({ user }: UserDataForCanvas) {
    const { premiumSince } = user;
    if (!premiumSince) {
      return;
    }

    const nitroImage = await this.canvas.createImage(
      path.resolve(AssetsPath, 'icons/nitro.svg'),
      true,
    );

    this.canvas.ctx.drawImage(
      nitroImage,
      this.x,
      this.y,
      this.width,
      this.height,
    );
  }
}

class BannerActivity extends BaseBannerLayer {
  x = BANNER_START_CONTENT_X;
  y = 371;

  width?: number;
  height?: number;

  activityTypeFont = "18px 'ABCGintoNormal'";
  activityTypeFillStyle = BannerColors.SECOND_TEXT_COLOR;

  activityImageY = 384;
  activityImageHeight = 42;
  activityImageWidth = 42;

  // TODO?: refactor these variables
  activityNameFont = "normal 500 18px 'ABCGintoNormal'";
  activityNameFillStyle = BannerColors.THIRD_TEXT_COLOR;
  activityNameY = 402;
  activityNameX = 312;

  activityStartTimeFont = "18px 'Whitney'";
  activityStartTimeFillStyle = BannerColors.THIRD_TEXT_COLOR;
  activityStartTimeX = 312;
  activityStartTimeY = 422;

  constructor(private canvas: BaseCanvas) {
    super();
  }

  async render({ activity }: UserDataForCanvas): Promise<void> {
    if (!activity) {
      return;
    }

    this.drawActivityType(activity);
    await this.drawActivityImage(activity);
    this.drawActivityName(activity);
    this.drawActivityStartTime(activity);
  }

  private drawActivityType(activity: UserActivityDTO) {
    const activityType = activity.type;

    this.canvas.fillStyle = this.activityTypeFillStyle;
    this.canvas.font = this.activityTypeFont;
    this.canvas.fillText({
      text: ActivitiesText[activityType] as string,
      x: this.x,
      y: this.y,
      relativeToHeight: true,
    });
  }

  private async drawActivityImage(activity: UserActivityDTO) {
    const defaultActivityImage = path.resolve(AssetsPath, 'icons/activity.svg');

    const activityImageURL = activity.largeImageURL ?? defaultActivityImage;
    const isLocalImage = activityImageURL === defaultActivityImage;

    const activityImage = await this.canvas.createImage(
      activityImageURL,
      isLocalImage,
    );

    // this.canvas.ctx.drawImage(
    //   activityImage,
    //   this.x,
    //   this.activityImageY * this.canvas.heightScale,
    //   this.activityImageWidth,
    //   this.activityImageHeight,
    // );
  }

  private drawActivityName(activity: UserActivityDTO) {
    const activityName = activity.name;

    this.canvas.fillStyle = this.activityNameFillStyle;
    this.canvas.font = this.activityNameFont;
    this.canvas.fillText({
      text: activityName,
      x: this.activityNameX,
      y: this.activityNameY,
      relativeToHeight: true,
    });
  }

  private drawActivityStartTime(activity: UserActivityDTO) {
    const activityStartTime = activity.start;
    const activityType = activity.type;
    if (!activityStartTime) {
      return;
    }

    const activityText = ActivitiesText[activityType] as string;

    const startTimestamp = +activityStartTime;

    const currentTime = +new Date();
    const differenceInMin = (currentTime - startTimestamp) / 100_000;
    const differenceInHour = (currentTime - startTimestamp) / 100_000 / 60;
    let timeText: string = `Just started ${activityText.toLowerCase()}`;

    if (differenceInMin >= 1) {
      timeText = `for ${Math.ceil(differenceInMin)} minutes`;
    }

    if (differenceInHour >= 1) {
      timeText = `for ${Math.ceil(differenceInHour)} hours`;
    }

    this.canvas.fillStyle = this.activityStartTimeFillStyle;
    this.canvas.font = this.activityStartTimeFont;
    this.canvas.fillText({
      text: timeText,
      x: this.activityStartTimeX,
      y: this.activityStartTimeY,
      relativeToHeight: true,
    });
  }
}

class BannerCustomStatus extends BaseBannerLayer {
  x = BANNER_START_CONTENT_X;
  y = 269;

  width?: number;
  height?: number;

  maxLength = 45;
  fillStyle = BannerColors.THIRD_TEXT_COLOR;
  font = "18px 'Whitney'";

  constructor(private canvas: BaseCanvas) {
    super();
  }

  render({ user }: UserDataForCanvas): void {
    const { customStatus } = user;
    if (typeof customStatus !== 'string') {
      return;
    }

    let text = customStatus;

    if (text.length > this.maxLength) {
      text = `${text.slice(0, this.maxLength)}...`;
    }

    this.canvas.fillStyle = this.fillStyle;
    this.canvas.font = this.font;
    this.canvas.fillText({
      text,
      x: this.x,
      y: this.y,
    });
  }
}

class BannerSeparator extends BaseBannerLayer {
  x = BANNER_START_CONTENT_X;
  y = 310;
  height = 1;
  width = 663;

  fillStyle = 'rgba(255, 255, 255, 0.1)';

  constructor(private canvas: BaseCanvas) {
    super();
  }

  render(): void {
    this.canvas.fillStyle = this.fillStyle;
    this.canvas.fillRect({
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      relativeToHeight: true,
    });
  }
}
