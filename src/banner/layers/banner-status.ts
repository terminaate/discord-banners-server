import { BaseBannerLayer } from '@/banner/lib/base-banner-layer';
import { MeasurementUnit } from '@/banner/lib/base-canvas';
import { UserDataForCanvas } from '@/banner/types/user-data-for-canvas';
import { BannerColors, StatusColors } from '@/banner/const';
import { BannerAvatar } from '@/banner/layers/banner-avatar';

export class BannerStatus extends BaseBannerLayer {
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
