import { BaseBannerLayer } from '@/banner/lib/base-banner-layer';
import { MeasurementUnit } from '@/banner/lib/base-canvas';
import {
  AssetsPath,
  BANNER_START_CONTENT_X,
  BannerColors,
  FlagsImages,
} from '@/banner/const';
import { UserDataForCanvas } from '@/banner/types/user-data-for-canvas';
import { pickBy } from 'lodash';
import { UserFlags } from 'discord.js';
import * as path from 'path';
import { BannerUsername } from '@/banner/layers/banner-username';

export class BannerPublicFlags extends BaseBannerLayer {
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
        calculate: (img) => ({
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

    const usernameLayerY = this.canvas.toPixelsY(usernameLayer.y);
    const usernameLayerHeight = this.canvas.toPixelsY(usernameLayer.height);

    this.y =
      usernameLayerY -
      usernameLayer.font.size +
      usernameLayerHeight +
      usernameLayer.secondaryFont.size;
  }
}
