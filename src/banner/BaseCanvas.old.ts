// import { BorderRadius, BorderRadiusObject } from '@/types/BorderRadius';
// import { Canvas, CanvasRenderingContext2D, Image } from 'canvas';
//
// type RoundRectOpts = {
// 	x: number;
// 	y: number;
// 	width: number;
// 	height: number;
// 	radius?: BorderRadius;
// 	fill?: boolean;
// 	stroke?: boolean;
// 	relativeToHeight?: boolean;
// };
//
// type RoundImageOpts = {
// 	image: Image;
// 	x: number;
// 	y: number;
// 	width?: number;
// 	height?: number;
// 	radius?: BorderRadius;
// 	relativeToHeight?: boolean;
// };
//
// type FillRectOpts = {
// 	x: number;
// 	y: number;
// 	width: number;
// 	height: number;
// 	relativeToHeight?: boolean;
// };
//
// type FillCircleOpts = {
// 	x: number;
// 	y: number;
// 	radius: number;
// 	relativeToHeight?: boolean;
// 	fill?: boolean;
// 	stroke?: boolean;
// };
//
// type FillTextOpts = {
// 	x: number;
// 	y: number;
// 	text: string;
// 	maxWidth?: number;
// 	relativeToHeight?: boolean;
// };
//
// export class BaseCanvas extends Canvas {
// 	ctx: CanvasRenderingContext2D;
// 	heightScale: number;
// 	borderRadius: Required<BorderRadiusObject>;
//
// 	constructor(
// 		width: number,
// 		height: number,
// 		borderRadius: BorderRadius = 14,
// 		type?: 'pdf' | 'svg',
// 	) {
// 		super(width, height, type);
//
// 		this.ctx = this.getContext('2d');
// 		this.borderRadius = this.getBorderRadiusObject(borderRadius);
// 	}
//
// 	set fillStyle(newValue: string | CanvasGradient | CanvasPattern) {
// 		this.ctx.fillStyle = newValue;
// 	}
//
// 	set font(newValue: string) {
// 		this.ctx.font = newValue;
// 	}
//
// 	roundImage({
// 		x,
// 		y,
// 		relativeToHeight,
// 		height,
// 		width,
// 		radius,
// 		image,
// 	}: RoundImageOpts) {
// 		if (relativeToHeight) {
// 			y = y * this.heightScale;
// 		}
//
// 		this.ctx.save();
//
// 		width ??= image.width;
// 		height ??= image.height;
//
// 		this.ctx.beginPath();
// 		this.roundRect({
// 			x,
// 			y,
// 			radius,
// 			width,
// 			height,
// 			fill: false,
// 			stroke: false,
// 		});
// 		this.ctx.closePath();
// 		this.ctx.clip();
// 		this.ctx.drawImage(image, 0, 0, width, height);
//
// 		this.ctx.restore();
// 	}
//
// 	roundRect({
// 		x,
// 		y,
// 		height,
// 		width,
// 		relativeToHeight,
// 		stroke = false,
// 		fill = true,
// 		radius = 5,
// 	}: RoundRectOpts) {
// 		const radiusObject = this.getBorderRadiusObject(radius);
//
// 		if (relativeToHeight) {
// 			y = y * this.heightScale;
// 		}
//
// 		this.ctx.beginPath();
// 		this.ctx.moveTo(x + radiusObject.tl, y);
// 		this.ctx.lineTo(x + width - radiusObject.tr, y);
// 		this.ctx.quadraticCurveTo(x + width, y, x + width, y + radiusObject.tr);
// 		this.ctx.lineTo(x + width, y + height - radiusObject.br);
// 		this.ctx.quadraticCurveTo(
// 			x + width,
// 			y + height,
// 			x + width - radiusObject.br,
// 			y + height,
// 		);
// 		this.ctx.lineTo(x + radiusObject.bl, y + height);
// 		this.ctx.quadraticCurveTo(x, y + height, x, y + height - radiusObject.bl);
// 		this.ctx.lineTo(x, y + radiusObject.tl);
// 		this.ctx.quadraticCurveTo(x, y, x + radiusObject.tl, y);
// 		this.ctx.closePath();
// 		if (fill) {
// 			this.ctx.fill();
// 		}
// 		if (stroke) {
// 			this.ctx.stroke();
// 		}
// 	}
//
// 	fillRect({ x, y, width, height, relativeToHeight }: FillRectOpts) {
// 		if (relativeToHeight) {
// 			y = y * this.heightScale;
// 		}
//
// 		this.ctx.fillRect(x, y, width, height);
// 	}
//
// 	fillCircle({
// 		x,
// 		y,
// 		radius,
// 		relativeToHeight,
// 		fill = true,
// 		stroke = false,
// 	}: FillCircleOpts) {
// 		if (relativeToHeight) {
// 			y = y * this.heightScale;
// 		}
//
// 		this.ctx.beginPath();
// 		this.ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
// 		this.ctx.closePath();
//
// 		if (fill) {
// 			this.ctx.fill();
// 		}
//
// 		if (stroke) {
// 			this.ctx.stroke();
// 		}
// 	}
//
// 	fillText({ text, x, y, relativeToHeight, maxWidth }: FillTextOpts) {
// 		if (relativeToHeight) {
// 			y = y * this.heightScale;
// 		}
//
// 		this.ctx.fillText(text, x, y, maxWidth);
// 	}
//
// 	private getBorderRadiusObject(
// 		radius: BorderRadius,
// 	): Required<BorderRadiusObject> {
// 		let radiusObject = { tl: 0, tr: 0, br: 0, bl: 0 };
//
// 		if (typeof radius === 'number') {
// 			radiusObject = { tl: radius, tr: radius, br: radius, bl: radius };
// 		} else {
// 			for (const side in radiusObject) {
// 				radiusObject[side] = radius[side] || 0;
// 			}
// 		}
//
// 		return radiusObject;
// 	}
// }
