import { BannerOptions } from '@/banner/types/banner-options';
import { UserDataForCanvas } from '@/banner/types/user-data-for-canvas';
import { MeasurementUnit } from '@/banner/lib/base-canvas';

export abstract class BaseBannerLayer {
  abstract x: MeasurementUnit;
  abstract y: MeasurementUnit;
  abstract height?: MeasurementUnit;
  abstract width?: MeasurementUnit;

  abstract render(
    userData: UserDataForCanvas,
    bannerOptions?: BannerOptions,
  ): Promise<void> | void;
}

export class BaseBannerLayerImpl extends BaseBannerLayer {
  x: MeasurementUnit;
  y: MeasurementUnit;
  height?: MeasurementUnit;
  width?: MeasurementUnit;

  render(
    userData: UserDataForCanvas,
    bannerOptions?: BannerOptions,
  ): Promise<void> | void {
    return undefined;
  }
}
