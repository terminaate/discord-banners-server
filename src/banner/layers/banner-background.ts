import { BaseBannerLayer } from '@/banner/lib/base-banner-layer';
import { MeasurementUnit } from '@/banner/lib/base-canvas';
import { UserDataForCanvas } from '@/banner/types/user-data-for-canvas';
import { BannerColors } from '@/banner/const';

export class BannerBackground extends BaseBannerLayer {
  x = 0;
  y = 0;
  height: MeasurementUnit = 100;
  width!: number;

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
      height: this.canvas.height - this.canvas.toPixelsY(this.height),
    });
  }

  protected beforeRender() {
    this.width = this.canvas.width;
  }
}
