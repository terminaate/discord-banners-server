import { BorderRadius, BorderRadiusObject } from '@/banner/types/border-radius';
import { Canvas, CanvasRenderingContext2D, Image } from 'canvas';
import * as fs from 'fs/promises';
import axios from 'axios';

export type MeasurementUnit = number | `${number}%`;

export type FontFamily = 'Whitney' | 'ABCGintoNormal';

export type FontInfo = {
  size: number;
  family: FontFamily;
  value: string;
};

type Coords = {
  x: MeasurementUnit;
  y: MeasurementUnit;
};

type RoundRectOpts = Coords & {
  width: MeasurementUnit;
  height: MeasurementUnit;
  radius: BorderRadius;
  fill?: boolean;
  stroke?: boolean;
};

// type RoundImageOpts = Coords & {
//   url?: string;
//   local?: boolean;
//   image?: Image;
//   scale?: (image: Image) => {
//     scaleX?: number;
//     scaleY?: number;
//   };
//   width?: MeasurementUnit;
//   height?: MeasurementUnit;
//   radius: BorderRadius;
// };

type DrawImageOpts = Coords & {
  url?: string;
  local?: boolean;
  image?: Image;
  scale?: (image: Image) => {
    scaleX?: number;
    scaleY?: number;
  };
  translate?: boolean;
  width?: MeasurementUnit;
  height?: MeasurementUnit;
  radius?: BorderRadius;
};

type FillRectOpts = Coords & {
  width: MeasurementUnit;
  height: MeasurementUnit;
};

type FillCircleOpts = Coords & {
  radius: number;
  fill?: boolean;
  stroke?: boolean;
};

type FillTextOpts = Coords & {
  text: string;
  maxWidth?: number;
};

const mimeTypeMap: { [key: string]: string } = {
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
};

// TODO: turn it to cache-manager instance with ttl
const imagesCache = new Map<string, string>();

// TODO: maybe move this to separated module?
export class BaseCanvas extends Canvas {
  ctx: CanvasRenderingContext2D;

  constructor(width: number, height: number, type?: 'pdf' | 'svg') {
    super(width, height, type);

    this.ctx = this.getContext('2d');
  }

  set fillStyle(newValue: string | CanvasGradient | CanvasPattern) {
    this.ctx.fillStyle = newValue;
  }

  set strokeStyle(newValue: string | CanvasGradient | CanvasPattern) {
    this.ctx.strokeStyle = newValue;
  }

  set font(newValue: FontInfo | string) {
    this.ctx.font = typeof newValue === 'object' ? newValue.value : newValue;
  }

  async createImage(url: string, local = false) {
    const base64 = await this.loadImageBase64(url, local);

    return await this.createImageFromBuffer(base64);
  }

  async drawImage({
    x,
    y,
    width,
    height,
    url,
    image: originalImage,
    local = false,
    scale,
    translate = !!scale,
    radius,
  }: DrawImageOpts) {
    x = this.toPixelsX(x);
    y = this.toPixelsY(y);
    if (width) {
      width = this.toPixelsX(width);
    }
    if (height) {
      height = this.toPixelsY(height);
    }

    const image = originalImage ?? (await this.createImage(url!, local));
    const radiusObject = radius ? this.getBorderRadiusObject(radius) : null;

    width ??= image.naturalWidth;
    height ??= image.naturalHeight;

    if (scale) {
      const { scaleX, scaleY } = scale(image);

      this.ctx.save();

      // TODO: fix rounding corners (for some reason rounding only one top left corner)
      if (radiusObject) {
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, width, height, Object.values(radiusObject));
        this.ctx.closePath();
        this.ctx.clip();
      }
      if (translate) {
        this.ctx.translate(x, y);
      }

      this.ctx.scale(
        scaleX ?? width / image.naturalWidth,
        scaleY ?? height / image.naturalHeight,
      );
      this.ctx.drawImage(image, translate ? 0 : x, translate ? 0 : y);

      this.ctx.restore();
    } else {
      if (radiusObject) {
        this.ctx.save();

        this.ctx.beginPath();
        this.ctx.roundRect(x, y, width, height, Object.values(radiusObject));
        this.ctx.closePath();
        this.ctx.clip();

        this.ctx.drawImage(image, x, y, width, height);

        this.ctx.restore();
      } else {
        this.ctx.drawImage(image, x, y, width, height);
      }
    }
  }

  roundRect({
    x,
    y,
    height,
    width,
    stroke = false,
    fill = true,
    radius = 5,
  }: RoundRectOpts) {
    x = this.toPixelsX(x);
    y = this.toPixelsY(y);
    if (width) {
      width = this.toPixelsX(width);
    }
    if (height) {
      height = this.toPixelsY(height);
    }

    const radiusObject = this.getBorderRadiusObject(radius);

    this.ctx.beginPath();
    this.ctx.moveTo(x + radiusObject.tl, y);
    this.ctx.lineTo(x + width - radiusObject.tr, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radiusObject.tr);
    this.ctx.lineTo(x + width, y + height - radiusObject.br);
    this.ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radiusObject.br,
      y + height,
    );
    this.ctx.lineTo(x + radiusObject.bl, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radiusObject.bl);
    this.ctx.lineTo(x, y + radiusObject.tl);
    this.ctx.quadraticCurveTo(x, y, x + radiusObject.tl, y);
    this.ctx.closePath();
    if (fill) {
      this.ctx.fill();
    }
    if (stroke) {
      this.ctx.stroke();
    }
  }

  fillRect({ x, y, width, height }: FillRectOpts) {
    x = this.toPixelsX(x);
    y = this.toPixelsY(y);
    if (width) {
      width = this.toPixelsX(width);
    }
    if (height) {
      height = this.toPixelsY(height);
    }

    this.ctx.fillRect(x, y, width, height);
  }

  fillCircle({ x, y, radius, fill = true, stroke = false }: FillCircleOpts) {
    x = this.toPixelsX(x);
    y = this.toPixelsY(y);

    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    this.ctx.closePath();

    if (fill) {
      this.ctx.fill();
    }

    if (stroke) {
      this.ctx.stroke();
    }
  }

  fillText({ text, x, y, maxWidth }: FillTextOpts) {
    x = this.toPixelsX(x);
    y = this.toPixelsY(y);

    this.ctx.fillText(text, x, y, maxWidth);
  }

  toPixels(value: number | `${number}%`, max: number) {
    if (typeof value === 'string' && value.endsWith('%')) {
      return (parseFloat(value) / 100) * max;
    }

    return typeof value === 'number' ? value : parseFloat(value);
  }

  getBorderRadiusObject(radius: BorderRadius): Required<BorderRadiusObject> {
    let radiusObject = { tl: 0, tr: 0, br: 0, bl: 0 };

    if (typeof radius === 'number') {
      radiusObject = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
      for (const side in radiusObject) {
        radiusObject[side] = (radius[side] || 0) as number;
      }
    }

    return radiusObject;
  }

  toPixelsX(value: number | `${number}%`) {
    return this.toPixels(value, this.width);
  }

  toPixelsY(value: number | `${number}%`) {
    return this.toPixels(value, this.height);
  }

  private createImageFromBuffer(src: string | Buffer) {
    const image = new Image();

    return new Promise<Image>((resolve) => {
      image.onload = () => {
        resolve(image);
      };
      image.src = src;
    });
  }

  private async loadImageBase64(url: string, local = false) {
    if (imagesCache.has(url)) {
      return imagesCache.get(url) as string;
    }

    let base64: string;

    if (local) {
      const ext = url.split('.').pop();

      const buffer = await fs.readFile(url);

      const dataType = mimeTypeMap[ext as string] || 'application/octet-stream';

      base64 = `data:${dataType};base64,${buffer.toString('base64')}`;
    } else {
      const { data, headers } = await axios<Buffer<ArrayBufferLike>>({
        url,
        responseType: 'arraybuffer',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36',
        },
      });

      const contentType = headers['Content-Type'] as string;

      base64 = `data:${contentType};base64,${data.toString('base64')}`;
    }

    imagesCache.set(url, base64);

    return base64;
  }
}
