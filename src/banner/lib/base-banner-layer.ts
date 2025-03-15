import { BannerOptions } from '@/banner/types/banner-options';
import { UserDataForCanvas } from '@/banner/types/user-data-for-canvas';

export abstract class BaseBannerLayer {
  abstract x: number;
  abstract y: number;
  abstract height?: number;
  abstract width?: number;

  abstract render(
    userData: UserDataForCanvas,
    bannerOptions?: BannerOptions,
  ): Promise<void> | void;
}
