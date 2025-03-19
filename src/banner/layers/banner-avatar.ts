import { BaseBannerLayer } from '@/banner/lib/base-banner-layer';
import { MeasurementUnit } from '@/banner/lib/base-canvas';
import { UserDataForCanvas } from '@/banner/types/user-data-for-canvas';
import { UserDTO } from '@/common/dto/user.dto';
import { BannerColors } from '@/banner/const';
import { BannerBackground } from '@/banner/layers/banner-background';

export class BannerAvatar extends BaseBannerLayer {
  x: MeasurementUnit = '18%';
  y: MeasurementUnit;

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

  protected beforeRender(): Promise<void> | void {
    const backgroundLayer = this.getRenderedLayer<BannerBackground>(
      BannerBackground.name,
    );

    this.y = backgroundLayer.height;
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
      calculate: (img) => ({
        scaleX: size / img.naturalWidth,
        scaleY: size / img.naturalHeight,
      }),
      cacheId: user.id,
      cacheProperty: 'avatar',
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
      calculate: (img) => ({
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
