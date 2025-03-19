import { BaseBannerLayer } from '@/banner/lib/base-banner-layer';
import {
  ActivitiesText,
  AssetsPath,
  BANNER_START_CONTENT_X,
  BannerColors,
} from '@/banner/const';
import {
  BaseCanvas,
  FontInfo,
  MeasurementUnit,
} from '@/banner/lib/base-canvas';
import { UserActivityDTO } from '@/common/dto/user-activity.dto';
import { UserDataForCanvas } from '@/banner/types/user-data-for-canvas';
import { BannerPublicFlags } from '@/banner/layers/banner-public-flags';
import * as path from 'node:path';
import { ActivityType } from 'discord.js';

class BannerActivity {
  width: MeasurementUnit = '90%';
  height = 90;
  radius = 10;
  padding = 10;

  imageSize = 60;
  imageRadius = 5;

  font = new FontInfo(10, 'ABCGintoNormal');

  constructor(
    private activity: UserActivityDTO,
    private canvas: BaseCanvas,
    private x: MeasurementUnit,
    private y: MeasurementUnit,
  ) {}

  async render() {
    this.drawBackground();
    this.drawType();
    await this.drawImage();
    this.drawInfo();
  }

  private drawType() {
    const text = ActivitiesText[this.activity.type];
    if (!text) {
      return;
    }

    const x = this.canvas.toPixelsX(this.x) + this.padding;
    const y = this.canvas.toPixelsY(this.y) + this.font.size + this.padding / 2;

    this.canvas.font = this.font;
    this.canvas.fillStyle = BannerColors.SECOND_TEXT_COLOR;
    this.canvas.fillText({
      text,
      x,
      y,
    });
  }

  private drawListeningInfo() {}

  private drawDefaultInfo() {
    const font = new FontInfo(10, 'ABCGintoNormal');
    const marginLeft = 5;

    const x =
      this.canvas.toPixelsX(this.x) +
      this.padding +
      this.imageSize +
      marginLeft;
    const y =
      this.canvas.toPixelsY(this.y) +
      font.size +
      this.imageSize / 2 +
      this.padding / 2;

    this.canvas.fillStyle = BannerColors.BASE_TEXT_COLOR;
    this.canvas.font = font;
    this.canvas.fillText({
      x,
      y,
      text: this.activity.name,
    });

    const currentTime = Date.now();
    const difference = currentTime - +this.activity.startTimestamp!;

    const differenceInMinutes = String(
      Math.trunc(difference / (1000 * 60)),
    ).padStart(2, '0');
    const differenceInSeconds = String(
      Math.trunc((difference / 1000) % 60),
    ).padStart(2, '0');

    this.canvas.fillStyle = '#00bc40';
    this.canvas.font = font;
    this.canvas.fillText({
      text: `${differenceInMinutes}:${differenceInSeconds}`,
      x,
      y: y + font.size + this.padding / 2,
    });
  }

  private drawInfo() {
    switch (this.activity.type) {
      case ActivityType.Listening: {
        this.drawListeningInfo();
        break;
      }

      default: {
        this.drawDefaultInfo();
        break;
      }
    }
  }

  private async drawImage() {
    const x = this.canvas.toPixelsX(this.x) + this.padding;
    const y =
      this.canvas.toPixelsY(this.y) +
      (this.height - this.imageSize) -
      this.padding;

    const defaultActivityImageURL = path.resolve(
      AssetsPath,
      'icons/activity.svg',
    );
    const activityImageURL =
      this.activity.largeImageURL ?? defaultActivityImageURL;

    const activityImage = await this.canvas.createImage(
      activityImageURL,
      activityImageURL === defaultActivityImageURL,
    );

    this.canvas.ctx.save();

    this.canvas.roundRect({
      x,
      y,
      width: this.imageSize,
      height: this.imageSize,
      fill: false,
      stroke: false,
      radius: this.imageRadius,
    });
    this.canvas.ctx.clip();

    // @note: thx to chatlgbt for this code ;) (cuz im bad at math)
    const scaledWidth =
      activityImage.naturalWidth *
      (this.imageSize / activityImage.naturalHeight);

    await this.canvas.drawImage({
      x: x - (scaledWidth - this.imageSize) / 2,
      y,
      image: activityImage,
      calculate: (img) => ({
        scaleX: this.imageSize / img.naturalHeight,
        scaleY: this.imageSize / img.naturalHeight,
      }),
    });

    this.canvas.ctx.restore();
  }

  private drawBackground() {
    this.canvas.fillStyle = BannerColors.SECONDARY_BACKGROUND_COLOR;
    this.canvas.roundRect({
      x: this.x,
      y: this.y,
      height: this.height,
      width: this.width,
      radius: this.radius,
    });
  }
}

export class BannerActivities extends BaseBannerLayer {
  x = BANNER_START_CONTENT_X;
  y: MeasurementUnit;

  gapBetweenActivities = 10;

  width: MeasurementUnit = '90%';
  height?: number;

  async render({ activities }: UserDataForCanvas): Promise<void> {
    let currentActivityY = this.canvas.toPixelsY(this.y);

    for (const activity of activities) {
      const baseY = currentActivityY;
      const baseX = this.x;
      const activityLayer = new BannerActivity(
        activity,
        this.canvas,
        baseX,
        baseY,
      );

      await activityLayer.render();

      currentActivityY +=
        this.canvas.toPixelsY(activityLayer.height) + this.gapBetweenActivities;
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
}
