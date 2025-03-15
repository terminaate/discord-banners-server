// import { CanvasRenderingContext2D } from 'canvas';
// import { UserDTO } from '@/common/dto/user.dto';
// import { BorderRadius } from '@/banner/types/BorderRadius';
// import { UserActivityDTO } from '@/common/dto/user-activity.dto';
// import {
//   BANNER_COMPACT_WIDTH,
//   BANNER_DEFAULT_HEIGHT,
//   BANNER_DEFAULT_WIDTH,
//   BannerDynamicHeights,
// } from '@/banner/const';
// import { BaseCanvas } from '@/banner/lib/BaseCanvas';
// import { BannerOptions } from '@/banner/types/BannerOptions';
// import { UserDataForCanvas } from '@/banner/types/user-data-for-canvas';
//
// export class Banner {
//   public width = BANNER_DEFAULT_WIDTH;
//   public height = BANNER_DEFAULT_HEIGHT;
//   public borderRadius: BorderRadius = 14;
//   public canvas: BaseCanvas;
//   public ctx: CanvasRenderingContext2D;
//   public heightScale = 1;
//   public separator = true;
//
//   private readonly user: UserDTO;
//   private readonly activity?: UserActivityDTO;
//
//   constructor(
//     userData: UserDataForCanvas,
//     private bannerOptions?: BannerOptions,
//   ) {
//     this.user = userData.user;
//     this.activity = userData.activity;
//
//     if (bannerOptions?.compact) {
//       this.width = BANNER_COMPACT_WIDTH;
//     }
//
//     this.initCanvas();
//   }
//
//   static async create(
//     user: UserDTO,
//     activity?: UserActivityDTO,
//     bannerOptions?: BannerOptions,
//   ) {
//     const userData: UserDataForCanvas = { user, activity };
//
//     const { canvas, separator } = new Banner(userData, bannerOptions);
//
//     // Rounding corners
//     canvas.roundRect({
//       x: 0,
//       y: 0,
//       width: canvas.width,
//       height: canvas.height,
//       radius: canvas.borderRadius,
//       fill: false,
//       stroke: false,
//       relativeToHeight: false,
//     });
//     canvas.ctx.clip();
//
//     const layers: (BaseBannerEntity | undefined)[] = [
//       new BannerBackground(canvas),
//       new BannerAvatar(canvas),
//       new BannerStatus(canvas),
//       new BannerUsername(canvas),
//       new BannerPublicFlags(canvas),
//       new BannerNitro(canvas),
//       new BannerActivity(canvas),
//       new BannerCustomStatus(canvas),
//       separator ? new BannerSeparator(canvas) : undefined,
//       new BannerProfileEffect(canvas),
//     ];
//
//     for (const layer of layers) {
//       await layer?.render(userData, bannerOptions);
//     }
//
//     return canvas;
//   }
//
//   private calculateHeight() {
//     const heightCandidate = BannerDynamicHeights.find((o) =>
//       o.condition(this.user, this.activity),
//     );
//     let height = BANNER_DEFAULT_HEIGHT;
//
//     if (heightCandidate) {
//       height = heightCandidate.height;
//       this.separator = Boolean(heightCandidate.separator);
//     }
//
//     this.heightScale = height / BANNER_DEFAULT_HEIGHT;
//     this.height = height;
//   }
//
//   private initCanvas() {
//     this.calculateHeight();
//
//     this.canvas = new BaseCanvas(
//       this.width,
//       this.height,
//       this.borderRadius,
//       'svg',
//     );
//     this.canvas.heightScale = this.heightScale;
//
//     this.ctx = this.canvas.ctx;
//   }
// }
