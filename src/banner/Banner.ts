import { UserModel } from '@/models/user.model';
import {
	Canvas,
	CanvasRenderingContext2D,
	createCanvas,
	loadImage,
	registerFont,
} from 'canvas';
import { ActivityType, PresenceStatus } from 'discord.js';
import * as path from 'path';
import { UserActivityModel } from '@/models/user-activity.model';

type Radius = {
	tl: number;
	tr: number;
	br: number;
	bl: number;
};

const STATUS_COLORS: Record<PresenceStatus, string> = {
	online: '#3BA55D',
	idle: '#faa81a',
	dnd: '#ed4245',
	offline: '#747f8d',
	invisible: '#747f8d',
};

const PUBLIC_FLAGS_IMAGES: Record<number, string> = {
	64: path.resolve(__dirname, '../assets/icons/HypeSquad_Bravery.svg'),
	128: path.resolve(__dirname, '../assets/icons/HypeSquad_Brilliance.svg'),
	256: path.resolve(__dirname, '../assets/icons/HypeSquad_Balance.svg'),
};

const ACTIVITIES_TEXT: Partial<Record<ActivityType, string>> = {
	[ActivityType.Playing]: 'PLAYING A GAME',
	[ActivityType.Streaming]: 'STREAMING',
	[ActivityType.Listening]: 'LISTENING',
	[ActivityType.Watching]: 'WATCHING',
};

type CanvasHeight = {
	condition: (user: UserModel, userActivity?: UserActivityModel) => boolean;
	height: number;
	isNeedToDrawSeparator: boolean;
};

const CANVAS_HEIGHTS: CanvasHeight[] = [
	{
		condition(user, activity) {
			const customStatus = user.getDataValue('customStatus');
			return typeof customStatus === 'string' && activity === undefined;
		},
		height: 330,
		isNeedToDrawSeparator: false,
	},
	{
		condition(user, activity) {
			const customStatus = user.getDataValue('customStatus');
			return !customStatus && activity === undefined;
		},
		height: 320,
		isNeedToDrawSeparator: false,
	},
	{
		condition(user, activity) {
			const customStatus = user.getDataValue('customStatus');
			return !customStatus && activity !== undefined;
		},
		height: 421,
		isNeedToDrawSeparator: true,
	},
];

export class Banner {
	private canvas: Canvas;
	private ctx: CanvasRenderingContext2D;
	private heightScale = 1;
	private isNeedToDrawSeparator = true;
	private static CONFIG = {
		CANVAS: {
			WIDTH: 961,
			DEFAULT_HEIGHT: 466,
			TOP_RADIUS: { tl: 14, tr: 14 },
			BOTTOM_RADIUS: { bl: 14, br: 14 },
		},

		DEFAULT_ACCENT_COLOR: '#FFF',
		BANNER_HEIGHT: 185,
		INFO_BACKGROUND_COLOR: '#18191C',

		START_CONTENT_X: 262,

		AVATAR: {
			BACKGROUND_X: 152.5,
			BACKGROUND_Y: 215.5,
			BACKGROUND_RADIUS: 94.5,
			RADIUS: 79.5,
			X: 73,
			Y: 136,
			WIDTH: 159,
			HEIGHT: 159,
		},
		STATUS: {
			BACKGROUND_X: 206.5,
			BACKGROUND_Y: 270.5,
			BACKGROUND_RADIUS: 27.5,
			RADIUS: 17.5,
		},
		USERNAME: {
			Y: 234,
			FILL_STYLE: '#fff',
			FONT: "34px 'ABCGintoNormal'",
		},
		PUBLIC_FLAGS: {
			X: 901,
			Y: 212,
			WIDTH: 24,
			HEIGHT: 24,
		},
		NITRO: {
			X: 857,
			Y: 212,
			WIDTH: 34,
			HEIGHT: 24,
		},
		ACTIVITY: {
			TYPE: {
				FILL_STYLE: '#B9BBBE',
				FONT: "18px 'ABCGintoNormal'",
				Y: 371,
			},
			IMAGE: {
				Y: 384,
			},
			NAME: {
				FONT: "normal 500 18px 'ABCGintoNormal'",
				FILL_STYLE: '#B2B2B4',
				Y: 402,
				X: 312,
			},
			START_TIME: {
				FONT: "18px 'Whitney'",
				FILL_STYLE: '#B2B2B4',
				X: 312,
				Y: 422,
			},
		},
		CUSTOM_STATUS: {
			FILL_STYLE: '#B2B2B4',
			FONT: "18px 'Whitney'",
			MAX_LENGTH: 90,
			Y: 269,
			Y_SECONDARY: 285,
		},
		SEPARATOR: {
			HEIGHT: 1,
			WIDTH: 663,
			FILL_STYLE: 'rgba(255, 255, 255, 0.1)',
			Y: 310,
		},
	};

	constructor(
		private user: UserModel,
		private userActivity?: UserActivityModel,
	) {
		this.initCanvas();
		this.registerFonts();
	}

	private initCanvas() {
		const heightCandidate = CANVAS_HEIGHTS.find((o) =>
			o.condition(this.user, this.userActivity),
		);
		let height = Banner.CONFIG.CANVAS.DEFAULT_HEIGHT;
		if (heightCandidate) {
			height = heightCandidate.height;
			this.isNeedToDrawSeparator = heightCandidate.isNeedToDrawSeparator;
		}

		this.heightScale = height / Banner.CONFIG.CANVAS.DEFAULT_HEIGHT;

		this.canvas = createCanvas(Banner.CONFIG.CANVAS.WIDTH, height);
		this.ctx = this.canvas.getContext('2d');
	}

	private registerFonts() {
		registerFont(
			path.resolve(__dirname, '../assets/fonts/ABCGintoNormal.otf'),
			{
				family: 'ABCGintoNormal',
				style: 'normal',
				weight: '700',
			},
		);
		registerFont(path.resolve(__dirname, '../assets/fonts/Whitney.otf'), {
			family: 'Whitney',
			style: 'normal',
		});
	}

	private roundRect(
		x: number,
		y: number,
		width: number,
		height: number,
		radius: number | Partial<Radius> = 5,
		fill: boolean,
		stroke = true,
	) {
		let radiusObject = { tl: 0, tr: 0, br: 0, bl: 0 };

		if (typeof radius === 'number') {
			radiusObject = { tl: radius, tr: radius, br: radius, bl: radius };
		} else {
			for (const side in radiusObject) {
				radiusObject[side] = radius[side] || 0;
			}
		}

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

	private async drawBackground() {
		const bannerURL = this.user.getDataValue('banner');
		const accentColor = this.user.getDataValue('accentColor');

		if (bannerURL) {
			const image = await loadImage(bannerURL);
			this.ctx.save();

			this.ctx.beginPath();
			this.roundRect(
				0,
				0,
				this.canvas.width,
				Banner.CONFIG.BANNER_HEIGHT,
				Banner.CONFIG.CANVAS.TOP_RADIUS,
				false,
				false,
			);
			this.ctx.closePath();
			this.ctx.clip();
			this.ctx.drawImage(image, 0, 0, this.canvas.width, this.canvas.height);

			this.ctx.restore();
		} else {
			this.ctx.fillStyle = accentColor ?? Banner.CONFIG.DEFAULT_ACCENT_COLOR;
			this.roundRect(
				0,
				0,
				this.canvas.width,
				Banner.CONFIG.BANNER_HEIGHT,
				Banner.CONFIG.CANVAS.TOP_RADIUS,
				true,
				false,
			);
		}
	}

	private drawInfoBackground() {
		this.ctx.fillStyle = Banner.CONFIG.INFO_BACKGROUND_COLOR;
		this.roundRect(
			0,
			Banner.CONFIG.BANNER_HEIGHT,
			this.canvas.width,
			this.canvas.height - Banner.CONFIG.BANNER_HEIGHT,
			Banner.CONFIG.CANVAS.BOTTOM_RADIUS,
			true,
			false,
		);
	}

	private async drawAvatar() {
		// Avatar background
		this.ctx.beginPath();
		this.ctx.arc(
			Banner.CONFIG.AVATAR.BACKGROUND_X,
			Banner.CONFIG.AVATAR.BACKGROUND_Y,
			Banner.CONFIG.AVATAR.BACKGROUND_RADIUS,
			0,
			2 * Math.PI,
			false,
		);
		this.ctx.closePath();
		this.ctx.fillStyle = Banner.CONFIG.INFO_BACKGROUND_COLOR;
		this.ctx.fill();

		// Avatar
		const avatarURL = this.user.getDataValue('avatar');
		const avatarImage = await loadImage(avatarURL);
		this.ctx.save();

		this.ctx.beginPath();
		this.ctx.arc(
			Banner.CONFIG.AVATAR.BACKGROUND_X,
			Banner.CONFIG.AVATAR.BACKGROUND_Y,
			Banner.CONFIG.AVATAR.RADIUS,
			0,
			2 * Math.PI,
			false,
		);
		this.ctx.closePath();
		this.ctx.clip();
		this.ctx.drawImage(
			avatarImage,
			Banner.CONFIG.AVATAR.X,
			Banner.CONFIG.AVATAR.Y,
			Banner.CONFIG.AVATAR.WIDTH,
			Banner.CONFIG.AVATAR.HEIGHT,
		);

		this.ctx.restore();
	}

	private drawStatus() {
		const userStatus = this.user.getDataValue('status');
		if (!userStatus) {
			return;
		}

		// Draw status background
		this.ctx.beginPath();
		this.ctx.arc(
			Banner.CONFIG.STATUS.BACKGROUND_X,
			Banner.CONFIG.STATUS.BACKGROUND_Y,
			Banner.CONFIG.STATUS.BACKGROUND_RADIUS,
			0,
			2 * Math.PI,
			false,
		);
		this.ctx.closePath();

		this.ctx.fillStyle = Banner.CONFIG.INFO_BACKGROUND_COLOR;
		this.ctx.fill();

		// Draw status
		this.ctx.beginPath();
		this.ctx.arc(
			Banner.CONFIG.STATUS.BACKGROUND_X,
			Banner.CONFIG.STATUS.BACKGROUND_Y,
			Banner.CONFIG.STATUS.RADIUS,
			0,
			2 * Math.PI,
			false,
		);
		this.ctx.closePath();

		this.ctx.fillStyle = STATUS_COLORS[userStatus];
		this.ctx.fill();
	}

	private drawUsername() {
		const username = this.user.getDataValue('username');

		this.ctx.fillStyle = Banner.CONFIG.USERNAME.FILL_STYLE;
		this.ctx.font = Banner.CONFIG.USERNAME.FONT;
		this.ctx.fillText(
			username,
			Banner.CONFIG.START_CONTENT_X,
			Banner.CONFIG.USERNAME.Y,
		);
	}

	private async drawPublicFlags() {
		const publicFlags = this.user.getDataValue('publicFlags');
		if (!publicFlags) {
			return;
		}

		const hypesquadImage = await loadImage(PUBLIC_FLAGS_IMAGES[publicFlags]);

		this.ctx.drawImage(
			hypesquadImage,
			Banner.CONFIG.PUBLIC_FLAGS.X,
			Banner.CONFIG.PUBLIC_FLAGS.Y,
			Banner.CONFIG.PUBLIC_FLAGS.WIDTH,
			Banner.CONFIG.PUBLIC_FLAGS.HEIGHT,
		);
	}

	private async drawNitro() {
		const premiumSince = this.user.getDataValue('premiumSince');
		if (!premiumSince) {
			return;
		}

		const nitroImage = await loadImage(
			path.resolve(__dirname, '../assets/icons/nitro.svg'),
		);

		this.ctx.drawImage(
			nitroImage,
			Banner.CONFIG.NITRO.X,
			Banner.CONFIG.NITRO.Y,
			Banner.CONFIG.NITRO.WIDTH,
			Banner.CONFIG.NITRO.HEIGHT,
		);
	}

	private drawActivityType() {
		const activityType = this.userActivity!.getDataValue('type');

		this.ctx.fillStyle = Banner.CONFIG.ACTIVITY.TYPE.FILL_STYLE;
		this.ctx.font = Banner.CONFIG.ACTIVITY.TYPE.FONT;
		this.ctx.fillText(
			ACTIVITIES_TEXT[activityType],
			Banner.CONFIG.START_CONTENT_X,
			Banner.CONFIG.ACTIVITY.TYPE.Y * this.heightScale,
		);
	}

	private async drawActivityImage() {
		const activityImageURL = this.userActivity!.getDataValue('image');
		const defaultActivityImage = path.resolve(
			__dirname,
			'../assets/icons/activity.svg',
		);

		const activityImage = await loadImage(
			activityImageURL ?? defaultActivityImage,
		);

		this.ctx.drawImage(
			activityImage,
			Banner.CONFIG.START_CONTENT_X,
			Banner.CONFIG.ACTIVITY.IMAGE.Y * this.heightScale,
		);
	}

	private drawActivityName() {
		const activityName = this.userActivity!.getDataValue('name');

		this.ctx.fillStyle = Banner.CONFIG.ACTIVITY.NAME.FILL_STYLE;
		this.ctx.font = Banner.CONFIG.ACTIVITY.NAME.FONT;
		this.ctx.fillText(
			activityName,
			Banner.CONFIG.ACTIVITY.NAME.X,
			Banner.CONFIG.ACTIVITY.NAME.Y * this.heightScale,
		);
	}

	private drawActivityStartTime() {
		const activityStartTime = this.userActivity!.getDataValue('start');
		const activityType = this.userActivity!.getDataValue('type');
		if (!activityStartTime) {
			return;
		}

		const startTimestamp = +activityStartTime;

		this.ctx.font = Banner.CONFIG.ACTIVITY.START_TIME.FONT;

		const currentTime = +new Date();
		const differenceInMin = (currentTime - startTimestamp) / 100000;
		const differenceInHour = (currentTime - startTimestamp) / 100000 / 60;
		let timeText: string =
			'Just started ' + ACTIVITIES_TEXT[activityType].toLowerCase();

		if (differenceInMin >= 1) {
			timeText = `for ${Math.ceil(differenceInMin)} minutes`;
		}

		if (differenceInHour >= 1) {
			timeText = `for ${Math.ceil(differenceInHour)} hours`;
		}

		this.ctx.fillStyle = Banner.CONFIG.ACTIVITY.START_TIME.FILL_STYLE;
		this.ctx.fillText(
			timeText,
			Banner.CONFIG.ACTIVITY.START_TIME.X,
			Banner.CONFIG.ACTIVITY.START_TIME.Y * this.heightScale,
		);
	}

	private async drawActivity() {
		if (!this.userActivity) {
			return;
		}

		this.drawActivityType();
		await this.drawActivityImage();
		this.drawActivityName();
		this.drawActivityStartTime();
	}

	private drawCustomStatus() {
		const customStatus = this.user.getDataValue('customStatus');
		if (typeof customStatus !== 'string') {
			return;
		}

		this.ctx.fillStyle = Banner.CONFIG.CUSTOM_STATUS.FILL_STYLE;
		this.ctx.font = Banner.CONFIG.CUSTOM_STATUS.FONT;
		if (customStatus.length > Banner.CONFIG.CUSTOM_STATUS.MAX_LENGTH) {
			this.ctx.fillText(
				customStatus.slice(0, Banner.CONFIG.CUSTOM_STATUS.MAX_LENGTH),
				Banner.CONFIG.START_CONTENT_X,
				Banner.CONFIG.CUSTOM_STATUS.Y,
			);

			// TODO: refactor?
			this.ctx.fillText(
				customStatus.slice(
					Banner.CONFIG.CUSTOM_STATUS.MAX_LENGTH,
					customStatus.length,
				),
				Banner.CONFIG.START_CONTENT_X,
				Banner.CONFIG.CUSTOM_STATUS.Y_SECONDARY,
			);
		} else {
			this.ctx.fillText(
				customStatus,
				Banner.CONFIG.START_CONTENT_X,
				Banner.CONFIG.CUSTOM_STATUS.Y,
			);
		}
	}

	private drawSeparator() {
		if (!this.isNeedToDrawSeparator) {
			return;
		}

		this.ctx.fillStyle = Banner.CONFIG.SEPARATOR.FILL_STYLE;
		this.ctx.fillRect(
			Banner.CONFIG.START_CONTENT_X,
			Banner.CONFIG.SEPARATOR.Y * this.heightScale,
			Banner.CONFIG.SEPARATOR.WIDTH,
			Banner.CONFIG.SEPARATOR.HEIGHT,
		);
	}

	static async create(user: UserModel, userActivity?: UserActivityModel) {
		const bannerInstance = new Banner(user, userActivity);

		await bannerInstance.drawBackground();
		bannerInstance.drawInfoBackground();
		await bannerInstance.drawAvatar();
		bannerInstance.drawStatus();
		bannerInstance.drawUsername();
		await bannerInstance.drawPublicFlags();
		await bannerInstance.drawNitro();
		await bannerInstance.drawActivity();
		bannerInstance.drawCustomStatus();
		bannerInstance.drawSeparator();

		return bannerInstance.canvas;
	}
}
