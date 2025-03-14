import { CanvasRenderingContext2D } from 'canvas';
import { UserDTO } from '@/dto/user.dto';
import { BorderRadius } from '@/types/BorderRadius';
import { UserActivityDTO } from '@/dto/user-activity.dto';
import {
	ActivitiesText,
	AssetsPath,
	BANNER_COMPACT_WIDTH,
	BANNER_DEFAULT_HEIGHT,
	BANNER_DEFAULT_WIDTH,
	BannerColors,
	BannerDynamicHeights,
	PublicFlagsImages,
	StatusColors,
} from '@/banner/const';
import { BaseCanvas } from '@/banner/BaseCanvas';
import path from 'path';
import { loadImageBase64 } from '@/utils/loadImageBase64';
import { createImageFromBuffer } from '@/utils/createImageFromBuffer';
import { AvatarDecorationsService } from '@/services/AvatarDecorationsService';
import { ProfileEffectsService } from '@/services/ProfileEffectsService';
import { BannerOptions } from '@/types/BannerOptions';

type UserDataForCanvas = {
	user: UserDTO;
	activity?: UserActivityDTO;
};

export class Banner {
	public width = BANNER_DEFAULT_WIDTH;
	public height = BANNER_DEFAULT_HEIGHT;
	public borderRadius: BorderRadius = 14;
	public canvas: BaseCanvas;
	public ctx: CanvasRenderingContext2D;
	public heightScale = 1;
	public separator = true;

	private readonly user: UserDTO;
	private readonly activity?: UserActivityDTO;

	constructor(
		userData: UserDataForCanvas,
		private bannerOptions?: BannerOptions,
	) {
		this.user = userData.user;
		this.activity = userData.activity;

		if (bannerOptions?.compact) {
			this.width = BANNER_COMPACT_WIDTH;
		}

		this.initCanvas();
	}

	static async create(
		user: UserDTO,
		activity?: UserActivityDTO,
		bannerOptions?: BannerOptions,
	) {
		const userData: UserDataForCanvas = { user, activity };

		const { canvas, separator } = new Banner(userData, bannerOptions);

		// Rounding corners
		canvas.roundRect({
			x: 0,
			y: 0,
			width: canvas.width,
			height: canvas.height,
			radius: canvas.borderRadius,
			fill: false,
			stroke: false,
			relativeToHeight: false,
		});
		canvas.ctx.clip();

		const layers: (BaseBannerEntity | undefined)[] = [
			new BannerBackground(canvas),
			new BannerAvatar(canvas),
			new BannerStatus(canvas),
			new BannerUsername(canvas),
			new BannerPublicFlags(canvas),
			new BannerNitro(canvas),
			new BannerActivity(canvas),
			new BannerCustomStatus(canvas),
			separator ? new BannerSeparator(canvas) : undefined,
			new BannerProfileEffect(canvas),
		];

		for (const layer of layers) {
			await layer?.render(userData, bannerOptions);
		}

		return canvas;
	}

	private calculateHeight() {
		const heightCandidate = BannerDynamicHeights.find((o) =>
			o.condition(this.user, this.activity),
		);
		let height = BANNER_DEFAULT_HEIGHT;

		if (heightCandidate) {
			height = heightCandidate.height;
			this.separator = Boolean(heightCandidate.separator);
		}

		this.heightScale = height / BANNER_DEFAULT_HEIGHT;
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

	abstract render(
		userData: UserDataForCanvas,
		bannerOptions?: BannerOptions,
	): Promise<void> | void;
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
			const backgroundImage = await createImageFromBuffer(
				await loadImageBase64(userBannerURL),
			);

			const scaleX = this.width / backgroundImage.naturalWidth;

			this.canvas.ctx.save();

			this.canvas.ctx.scale(scaleX, scaleX);

			this.canvas.ctx.drawImage(
				backgroundImage,
				this.x,
				(this.height - backgroundImage.naturalHeight) / 2,
			);

			this.canvas.ctx.restore();
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

		// @note: draw an info background
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

class BannerProfileEffect extends BaseBannerEntity {
	x = 0;
	y = 0;
	width: number;
	height: number;

	constructor(private canvas: BaseCanvas) {
		super();

		this.width = canvas.width;
		this.height = canvas.height;
	}

	async render({ user }: UserDataForCanvas, bannerOptions?: BannerOptions) {
		if (!user.profileEffect) {
			return;
		}

		const profileEffectObject = ProfileEffectsService.getProfileEffectById(
			user.profileEffect,
		);
		if (!profileEffectObject) {
			return;
		}

		const profileEffectURL = bannerOptions?.animated
			? profileEffectObject.config.effects[0].src
			: profileEffectObject.config.reducedMotionSrc;

		const profileEffectImage = await createImageFromBuffer(
			await loadImageBase64(profileEffectURL),
		);

		this.canvas.ctx.save();

		this.canvas.ctx.translate(
			this.x,
			bannerOptions?.compact
				? 0
				: (this.canvas.height - profileEffectImage.naturalHeight) / 2,
		);

		const x = this.width / profileEffectImage.naturalWidth;

		this.canvas.ctx.scale(x, x);
		this.canvas.roundImage({
			x: 0,
			y: 0,
			image: profileEffectImage,
			radius: this.canvas.borderRadius,
		});

		this.canvas.ctx.restore();
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

	decorationHeight = 189;
	decorationWidth = 189;
	decorationX = 58;
	decorationY = 121;

	constructor(private canvas: BaseCanvas) {
		super();
	}

	async render(
		{ user }: UserDataForCanvas,
		bannerOptions?: BannerOptions,
	): Promise<void> {
		this.drawBackground();
		await this.drawAvatar(user);
		await this.drawDecoration(user, bannerOptions);
	}

	private async drawAvatar(user: UserDTO) {
		const ctx = this.canvas.ctx;

		// TODO: refactor
		const avatarImage = await createImageFromBuffer(
			await loadImageBase64(user.avatar),
		);

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

	private async drawDecoration(user: UserDTO, bannerOptions?: BannerOptions) {
		if (!user.avatarDecoration) {
			return;
		}

		const decorationURL = AvatarDecorationsService.getDecorationUrl(
			user.avatarDecoration,
			bannerOptions?.animated,
		);
		if (!decorationURL) {
			return;
		}

		const decorationImage = await createImageFromBuffer(
			await loadImageBase64(decorationURL),
		);

		// TODO: move most of this logic to separated function in BaseCanvas
		this.canvas.ctx.save();

		this.canvas.ctx.translate(this.decorationX, this.decorationY);
		this.canvas.ctx.scale(
			this.decorationWidth / decorationImage.naturalWidth,
			this.decorationHeight / decorationImage.naturalHeight,
		);
		this.canvas.ctx.drawImage(decorationImage, 0, 0);

		this.canvas.ctx.restore();
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

class BannerStatus extends BaseBannerEntity {
	x = 206.5;
	y = 270.5;

	width?: number;
	height?: number;

	backgroundRadius = 27.5;
	radius = 17.5;

	constructor(private canvas: BaseCanvas) {
		super();
	}

	render({ user }: UserDataForCanvas): void {
		const userStatus = user.status;
		if (!userStatus) {
			return;
		}

		this.drawBackground();

		this.canvas.fillStyle = StatusColors[userStatus];
		this.canvas.fillCircle({
			x: this.x,
			y: this.y,
			radius: this.radius,
			fill: true,
			stroke: false,
		});
	}

	private drawBackground() {
		this.canvas.fillStyle = BannerColors.INFO_COLOR;
		this.canvas.fillCircle({
			x: this.x,
			y: this.y,
			radius: this.backgroundRadius,
			fill: true,
			stroke: false,
		});
	}
}

const START_CONTENT_X = 262;

class BannerUsername extends BaseBannerEntity {
	y = 234;
	x = START_CONTENT_X;

	width?: number;
	height?: number;

	fillStyle = BannerColors.BASE_TEXT_COLOR;
	font = "34px 'ABCGintoNormal'";

	constructor(private canvas: BaseCanvas) {
		super();
	}

	render({ user }: UserDataForCanvas) {
		const { username } = user;

		this.canvas.fillStyle = this.fillStyle;
		this.canvas.font = this.font;
		this.canvas.fillText({
			text: username,
			x: this.x,
			y: this.y,
		});
	}
}

class BannerPublicFlags extends BaseBannerEntity {
	x = 901;
	y = 212;
	width = 24;
	height = 24;

	constructor(private canvas: BaseCanvas) {
		super();

		this.x = this.canvas.width - 60;
	}

	async render({ user }: UserDataForCanvas): Promise<void> {
		// TODO: https://stackoverflow.com/questions/69622717/discord-api-get-users-badges-using-public-flags
		const { publicFlags } = user;
		if (!publicFlags || !PublicFlagsImages[publicFlags]) {
			return;
		}

		const hypesquadImage = await createImageFromBuffer(
			await loadImageBase64(PublicFlagsImages[publicFlags], true),
		);

		this.canvas.ctx.drawImage(
			hypesquadImage,
			this.x,
			this.y,
			this.width,
			this.height,
		);
	}
}

class BannerNitro extends BaseBannerEntity {
	x = 857;
	y = 212;
	width = 34;
	height = 24;

	constructor(private canvas: BaseCanvas) {
		super();

		this.x = this.canvas.width - 104;
	}

	async render({ user }: UserDataForCanvas): Promise<void> {
		const { premiumSince } = user;
		if (!premiumSince) {
			return;
		}

		const nitroImage = await createImageFromBuffer(
			await loadImageBase64(path.resolve(AssetsPath, 'icons/nitro.svg'), true),
		);

		this.canvas.ctx.drawImage(
			nitroImage,
			this.x,
			this.y,
			this.width,
			this.height,
		);
	}
}

class BannerActivity extends BaseBannerEntity {
	x = START_CONTENT_X;
	y = 371;

	width?: number;
	height?: number;

	activityTypeFont = "18px 'ABCGintoNormal'";
	activityTypeFillStyle = BannerColors.SECOND_TEXT_COLOR;

	activityImageY = 384;
	activityImageHeight = 42;
	activityImageWidth = 42;

	// TODO?: refactor these variables
	activityNameFont = "normal 500 18px 'ABCGintoNormal'";
	activityNameFillStyle = BannerColors.THIRD_TEXT_COLOR;
	activityNameY = 402;
	activityNameX = 312;

	activityStartTimeFont = "18px 'Whitney'";
	activityStartTimeFillStyle = BannerColors.THIRD_TEXT_COLOR;
	activityStartTimeX = 312;
	activityStartTimeY = 422;

	constructor(private canvas: BaseCanvas) {
		super();
	}

	async render({ activity }: UserDataForCanvas): Promise<void> {
		if (!activity) {
			return;
		}

		this.drawActivityType(activity);
		await this.drawActivityImage(activity);
		this.drawActivityName(activity);
		this.drawActivityStartTime(activity);
	}

	private drawActivityType(activity: UserActivityDTO) {
		const activityType = activity.type;

		this.canvas.fillStyle = this.activityTypeFillStyle;
		this.canvas.font = this.activityTypeFont;
		this.canvas.fillText({
			text: ActivitiesText[activityType],
			x: this.x,
			y: this.y,
			relativeToHeight: true,
		});
	}

	private async drawActivityImage(activity: UserActivityDTO) {
		const defaultActivityImage = path.resolve(AssetsPath, 'icons/activity.svg');

		const activityImageURL = activity.largeImageURL ?? defaultActivityImage;

		const response = await loadImageBase64(activityImageURL);

		const activityImage = await createImageFromBuffer(response);

		this.canvas.ctx.drawImage(
			activityImage,
			this.x,
			this.activityImageY * this.canvas.heightScale,
			this.activityImageWidth,
			this.activityImageHeight,
		);
	}

	private drawActivityName(activity: UserActivityDTO) {
		const activityName = activity.name;

		this.canvas.fillStyle = this.activityNameFillStyle;
		this.canvas.font = this.activityNameFont;
		this.canvas.fillText({
			text: activityName,
			x: this.activityNameX,
			y: this.activityNameY,
			relativeToHeight: true,
		});
	}

	private drawActivityStartTime(activity: UserActivityDTO) {
		const activityStartTime = activity.start;
		const activityType = activity.type;
		if (!activityStartTime) {
			return;
		}

		const startTimestamp = +activityStartTime;

		const currentTime = +new Date();
		const differenceInMin = (currentTime - startTimestamp) / 100_000;
		const differenceInHour = (currentTime - startTimestamp) / 100_000 / 60;
		let timeText: string = `Just started ${ActivitiesText[activityType].toLowerCase()}`;

		if (differenceInMin >= 1) {
			timeText = `for ${Math.ceil(differenceInMin)} minutes`;
		}

		if (differenceInHour >= 1) {
			timeText = `for ${Math.ceil(differenceInHour)} hours`;
		}

		this.canvas.fillStyle = this.activityStartTimeFillStyle;
		this.canvas.font = this.activityStartTimeFont;
		this.canvas.fillText({
			text: timeText,
			x: this.activityStartTimeX,
			y: this.activityStartTimeY,
			relativeToHeight: true,
		});
	}
}

class BannerCustomStatus extends BaseBannerEntity {
	x = START_CONTENT_X;
	y = 269;

	width?: number;
	height?: number;

	maxLength = 45;
	fillStyle = BannerColors.THIRD_TEXT_COLOR;
	font = "18px 'Whitney'";

	constructor(private canvas: BaseCanvas) {
		super();
	}

	render({ user }: UserDataForCanvas): void {
		const { customStatus } = user;
		if (typeof customStatus !== 'string') {
			return;
		}

		let text = customStatus;

		if (text.length > this.maxLength) {
			text = `${text.slice(0, this.maxLength)}...`;
		}

		this.canvas.fillStyle = this.fillStyle;
		this.canvas.font = this.font;
		this.canvas.fillText({
			text,
			x: this.x,
			y: this.y,
		});
	}
}

class BannerSeparator extends BaseBannerEntity {
	x = START_CONTENT_X;
	y = 310;
	height = 1;
	width = 663;

	fillStyle = 'rgba(255, 255, 255, 0.1)';

	constructor(private canvas: BaseCanvas) {
		super();
	}

	render(): void {
		this.canvas.fillStyle = this.fillStyle;
		this.canvas.fillRect({
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
			relativeToHeight: true,
		});
	}
}
