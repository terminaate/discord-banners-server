import { BannerOptions } from '@/banner/types/banner-options';
import { UserDataForCanvas } from '@/banner/types/user-data-for-canvas';
import { BaseCanvas, MeasurementUnit } from '@/banner/lib/base-canvas';

const renderedLayers: Record<string, BaseBannerLayer> = {};

// type CalculateMarginVariable = (previousLayer: BaseBannerLayer) => number;

export abstract class BaseBannerLayer {
  abstract x: MeasurementUnit;
  abstract y: MeasurementUnit;
  height?: MeasurementUnit;
  width?: MeasurementUnit;

  // marginTop?: MeasurementUnit | CalculateMarginVariable;
  // marginLeft?: MeasurementUnit | CalculateMarginVariable;

  constructor(protected canvas: BaseCanvas) {}

  async create(userData: UserDataForCanvas, bannerOptions?: BannerOptions) {
    // const previousLayer =
    //   renderedLayers[Object.keys(renderedLayers).length - 2];
    //
    // let marginTop = 0;
    // let marginLeft = 0;
    //
    // if (previousLayer) {
    //   marginTop =
    //     typeof this.marginTop === 'function'
    //       ? this.marginTop(previousLayer)
    //       : this.canvas.toPixelsY(previousLayer.y) +
    //         this.canvas.toPixelsY(previousLayer.height ?? 0) +
    //         this.canvas.toPixelsY(this.marginTop ?? 0);
    //
    //   marginLeft =
    //     typeof this.marginLeft === 'function'
    //       ? this.marginLeft(previousLayer)
    //       : this.canvas.toPixelsX(previousLayer.x) +
    //         this.canvas.toPixelsX(previousLayer.width ?? 0) +
    //         this.canvas.toPixelsX(this.marginLeft ?? 0);
    // }
    //
    // console.log(marginTop, marginLeft);
    //
    // this.x = this.canvas.toPixelsX(this.x) + marginLeft;
    // this.y = this.canvas.toPixelsY(this.y) + marginTop;
    //
    // // const marginTop =
    //
    // // this.y =
    // //   this.canvas.toPixelsY(this.y) +
    // //   this.canvas.toPixelsY(this.marginTop );

    await this.beforeRender(userData, bannerOptions);
    renderedLayers[this.constructor.name] = this;
    await this.render(userData, bannerOptions);
  }

  protected beforeRender(
    userData: UserDataForCanvas,
    bannerOptions?: BannerOptions,
  ): Promise<void> | void {}

  protected getRenderedLayer<R = BaseBannerLayer>(layerName: string): R {
    return renderedLayers[layerName] as R;
  }

  protected abstract render(
    userData: UserDataForCanvas,
    bannerOptions?: BannerOptions,
  ): Promise<void> | void;
}
