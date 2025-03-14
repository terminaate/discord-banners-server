import cors from 'cors';
import express, { Request, Response } from 'express';
import morgan from 'morgan';
import { query, validationResult } from 'express-validator';
import { ProfileEffectsService } from '@/services/ProfileEffectsService';
import { AvatarDecorationsService } from '@/services/AvatarDecorationsService';
import { bodyExceptionMiddleware } from '@/api/middlewares';
import {
	getCacheHeader,
	validateDecoration,
	validateProfileEffect,
} from '@/api/utils';
import { UserDTO } from '@/dto/user.dto';
import { getMemberByIdOrUsername } from '@/utils/getMemberByIdOrUsername';
import { renderBanner } from '@/banner/renderBanner';
import { BannerOptions } from '@/types/BannerOptions';
import { CacheService } from '@/services/CacheService';
import { pickBy } from 'lodash';
import { FakeProfileService } from '@/services/FakeProfileService';

type BannerRequest = Request<
	{ memberId: string },
	any,
	any,
	{
		cache?: boolean;
		profileEffect?: string;
		decoration?: string;
		animated?: boolean;
		compact?: boolean;
		fakeProfile?: boolean;
	}
>;

type RenderBannerOpts = {
	memberId: string;
	overwrites?: Partial<Record<keyof UserDTO, string>>;
	bannerOptions?: BannerOptions;
	cacheHeader: string;
};

const userIdsCache: Record<string, string> = {};

const getMemberId = async (idOrUsername: string) => {
	const candidate = userIdsCache[idOrUsername];
	if (candidate) {
		return candidate;
	}

	const member = await getMemberByIdOrUsername(idOrUsername);

	userIdsCache[idOrUsername] = String(member?.id);

	return String(member?.id);
};

const handleBannerRenderRequest = async (
	res: Response,
	{ memberId, cacheHeader, overwrites = {}, bannerOptions }: RenderBannerOpts,
) => {
	const candidate = await getMemberByIdOrUsername(memberId);
	if (!candidate) {
		return res.status(404).send('User not found');
	}

	userIdsCache[memberId] = candidate.id;

	const svg = await renderBanner(
		candidate,
		candidate.presence?.activities,
		overwrites,
		bannerOptions,
	);

	res.setHeader('Content-Type', 'image/svg+xml');
	res.setHeader('Cache-Control', cacheHeader);
	return res.status(200).send(svg);
};

export const startServer = async () => {
	const app = express();

	await ProfileEffectsService.init();
	await AvatarDecorationsService.init();

	const { SERVER_PORT } = process.env;

	app.disable('x-powered-by');
	app.use(cors());
	app.use(express.json());
	app.use(bodyExceptionMiddleware);
	app.use(morgan(process.env.NODE_ENV === 'dev' ? 'dev' : 'common'));
	app.use(express.static('./assets'));

	app.get('/profile-effects', (req, res) => {
		res.status(200);
		res.json(ProfileEffectsService.getAll());
	});

	app.get('/decorations', (req, res) => {
		res.status(200);
		res.json(AvatarDecorationsService.getAll());
	});

	app.get(
		'/banner/:memberId',
		query('cache').optional().isBoolean().toBoolean(),
		query('animated').optional().default(true).isBoolean().toBoolean(),
		query('compact').optional().default(false).isBoolean().toBoolean(),
		query('fakeProfile').optional().default(false).isBoolean().toBoolean(),
		query('profileEffect').optional().custom(validateProfileEffect),
		query('decoration').optional().custom(validateDecoration),
		async (req: BannerRequest, res: Response) => {
			const validationErrors = validationResult(req);
			if (!validationErrors.isEmpty()) {
				return res.json({ errors: validationErrors.array() });
			}

			const {
				cache: needToCacheResponse,
				profileEffect,
				decoration,
				compact = false,
				animated = true,
				fakeProfile = false,
			} = req.query;
			const { memberId } = req.params;

			const cacheHeader = getCacheHeader(needToCacheResponse);

			const bannerOptions: BannerOptions = {
				compact,
				animated,
			};

			const overwrites: Partial<Record<keyof UserDTO, string>> = pickBy(
				{
					profileEffect,
					avatarDecoration: decoration,
				},
				(p) => p !== undefined,
			);
			if (fakeProfile) {
				const realUserId = await getMemberId(memberId);
				const fakeProfileData =
					await FakeProfileService.getUserById(realUserId);

				Object.assign(overwrites, fakeProfileData);
			}

			if (process.env.NODE_ENV === 'dev') {
				return handleBannerRenderRequest(res, {
					memberId,
					overwrites,
					cacheHeader,
					bannerOptions,
				});
			}

			const cachedBanner = await CacheService.getFromCache({
				userId: memberId,
				overwrites,
				bannerOptions,
			});
			if (cachedBanner) {
				res.setHeader('Content-Type', 'image/svg+xml');
				res.setHeader('Cache-Control', cacheHeader);
				return res.status(200).send(cachedBanner);
			}

			return handleBannerRenderRequest(res, {
				memberId,
				overwrites,
				cacheHeader,
				bannerOptions,
			});
		},
	);

	app.listen(SERVER_PORT, () =>
		console.log(`Server listening on http://127.0.0.1:${SERVER_PORT}`),
	);
};
