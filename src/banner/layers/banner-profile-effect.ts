import { BaseBannerLayer } from '@/banner/lib/base-banner-layer';
import { UserDataForCanvas } from '@/banner/types/user-data-for-canvas';

export class BannerProfileEffect extends BaseBannerLayer {
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
      calculate: (img) => ({
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
