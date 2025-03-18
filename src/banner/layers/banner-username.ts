import { BaseBannerLayer } from '@/banner/lib/base-banner-layer';
import { FontInfo, MeasurementUnit } from '@/banner/lib/base-canvas';
import { BANNER_START_CONTENT_X, BannerColors } from '@/banner/const';
import { UserDataForCanvas } from '@/banner/types/user-data-for-canvas';
import { BannerAvatar } from '@/banner/layers/banner-avatar';

export class BannerUsername extends BaseBannerLayer {
  y: MeasurementUnit;
  x = BANNER_START_CONTENT_X;

  secondaryFillStyle = BannerColors.THIRD_TEXT_COLOR;
  secondaryFont = new FontInfo(13, 'ABCGintoNormal');

  width?: MeasurementUnit;
  height!: MeasurementUnit;

  fillStyle = BannerColors.BASE_TEXT_COLOR;
  font = new FontInfo(20, 'ABCGintoNormal');

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
