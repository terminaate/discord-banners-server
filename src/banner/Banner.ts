import { CanvasRenderingContext2D, loadImage } from 'canvas';
import { UserDTO } from '@/dto/user.dto';
import { BorderRadius } from '@/types/BorderRadius';
import { UserActivityDTO } from '@/dto/user-activity.dto';
import { BannerColors, BannerDynamicHeights } from '@/banner/const';
import { BaseCanvas } from '@/banner/BaseCanvas';

type UserDataForCanvas = {
	user: UserDTO;
	activity?: UserActivityDTO;
};

class BannerCanvas {
	public width = 961;
	public height = 466;
	public borderRadius: BorderRadius = 14;
	public canvas: BaseCanvas;
	public ctx: CanvasRenderingContext2D;
	public heightScale = 1;
	public separator = true;
	private readonly DEFAULT_HEIGHT = 466;

	private readonly user: UserDTO;
	private readonly activity?: UserActivityDTO;

	constructor(userData: UserDataForCanvas) {
		this.user = userData.user;
		this.activity = userData.activity;

		this.initCanvas();
	}

	private calculateHeight() {
		const heightCandidate = BannerDynamicHeights.find((o) =>
			o.condition(this.user, this.activity),
		);
		let height = this.DEFAULT_HEIGHT;

		if (heightCandidate) {
			height = heightCandidate.height;
			this.separator = Boolean(heightCandidate.separator);
		}

		this.heightScale = height / this.DEFAULT_HEIGHT;
		this.height = height;
	}

	private initCanvas() {
		this.calculateHeight();

		this.canvas = new BaseCanvas(
			this.width,
			this.height,
			this.borderRadius,
			'svg',
		);
		this.canvas.heightScale = this.heightScale;

		this.ctx = this.canvas.ctx;
	}
}

abstract class BaseBannerEntity {
	abstract x: number;
	abstract y: number;
	abstract height?: number;
	abstract width?: number;

	abstract render(userData: UserDataForCanvas): Promise<void> | void;
}

class BannerBackground extends BaseBannerEntity {
	x = 0;
	y = 0;
	height = 185;
	width!: number;

	constructor(private canvas: BaseCanvas) {
		super();

		this.width = canvas.width;
	}

	async render({ user }: UserDataForCanvas) {
		const userBannerURL = user.banner;
		const accentColor = user.accentColor;
		const borderRadius = this.canvas.borderRadius;

		if (userBannerURL) {
			const backgroundImage = await loadImage(userBannerURL);

			this.canvas.roundImage({
				image: backgroundImage,
				x: 0,
				y: 0,
				width: this.width,
				height: this.height,
				relativeToHeight: false,
				radius: {
					tl: borderRadius.tl,
					tr: borderRadius.tr,
				},
			});
		} else {
			this.canvas.fillStyle = accentColor ?? BannerColors.DEFAULT_ACCENT_COLOR;

			this.canvas.roundRect({
				x: 0,
				y: 0,
				width: this.width,
				height: this.height,
				relativeToHeight: true,
				radius: {
					tl: borderRadius.tl,
					tr: borderRadius.tr,
				},
				fill: true,
				stroke: false,
			});
		}

		this.canvas.fillStyle = BannerColors.INFO_COLOR;
		this.canvas.roundRect({
			x: 0,
			y: this.height,
			width: this.canvas.width,
			height: this.canvas.height - this.height,
			radius: {
				bl: borderRadius.bl,
				br: borderRadius.br,
			},
			fill: true,
			stroke: false,
		});
	}
}

class BannerAvatar extends BaseBannerEntity {
	x = 73;
	y = 136;
	height = 159;
	width = 159;

	radius = 79.5;

	backgroundX = 152.5;
	backgroundY = 215.5;
	backgroundRadius = 94.5;

	constructor(private canvas: BaseCanvas) {
		super();
	}

	async render({ user }: UserDataForCanvas): Promise<void> {
		this.drawBackground();

		const ctx = this.canvas.ctx;

		// TODO: refactor
		const avatarImage = await loadImage(user.avatar);

		// this.canvas.roundImage({
		// 	x: this.x,
		// 	y: this.y,
		// 	height: this.height,
		// 	width: this.width,
		// 	radius: this.radius,
		// 	image: avatarImage,
		// });

		ctx.save();

		ctx.beginPath();
		ctx.arc(
			this.backgroundX,
			this.backgroundY,
			this.radius,
			0,
			2 * Math.PI,
			false,
		);
		ctx.closePath();
		ctx.clip();
		ctx.drawImage(avatarImage, this.x, this.y, this.width, this.height);

		ctx.restore();
	}

	private drawBackground() {
		this.canvas.fillStyle = BannerColors.INFO_COLOR;
		this.canvas.fillCircle({
			x: this.backgroundX,
			y: this.backgroundY,
			radius: this.backgroundRadius,
			fill: true,
		});
	}
}

export class Banner {
	static async create(user: UserDTO, activity?: UserActivityDTO) {
		const userData: UserDataForCanvas = { user, activity };

		const { canvas } = new BannerCanvas(userData);

		const layers = [new BannerBackground(canvas), new BannerAvatar(canvas)];

		for (const layer of layers) {
			await layer.render(userData);
		}

		return canvas;
	}
}
