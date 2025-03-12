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
import { updateBanner } from '@/banner/updateBanner';
import { redisClient } from '@/redis';
import { scanCacheKeys } from '@/utils/scanCacheKeys';
import { BannerParams } from '@/types/BannerParams';
import { getDataFromCacheKey } from '@/utils/getDataFromCacheKey';

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
	}
>;

type RenderBannerOpts = {
	memberId: string;
	overwrites?: Partial<Record<keyof UserDTO, string>>;
	bannerParams?: BannerParams;
	cacheHeader: string;
};

async function renderBanner(
	res: Response,
	{ memberId, cacheHeader, overwrites, bannerParams }: RenderBannerOpts,
) {
	const candidate = await getMemberByIdOrUsername(memberId);
	if (!candidate) {
		return res.status(404).send('User not found');
	}

	const svg = await updateBanner(
		candidate,
		candidate.presence?.activities,
		overwrites,
		bannerParams,
	);

	res.setHeader('Content-Type', 'image/svg+xml');
	res.setHeader('Cache-Control', cacheHeader);
	return res.status(200).send(svg);
}

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

	app.get('/profile-effects', (req, res) => {
		res.status(200);
		res.json(ProfileEffectsService.getAll());
	});

	app.get('/decorations', (req, res) => {
		res.status(200);
		res.json(AvatarDecorationsService.getAll());
	});

	// TODO: maybe add  more fields that we can overwrite, (for example banner)
	app.get(
		'/banner/:memberId',
		query('cache').optional().isBoolean().toBoolean(),
		query('animated').optional().default(true).isBoolean().toBoolean(),
		query('compact').optional().default(false).isBoolean().toBoolean(),
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
			} = req.query;
			const { memberId } = req.params;

			const cacheHeader = getCacheHeader(needToCacheResponse);

			const bannerParams: BannerParams = {
				compact,
				animated,
			};
			const stringifyBannerParams = JSON.stringify(bannerParams);
			const isBannerParams = Object.values(bannerParams).some(
				(p) => p !== undefined,
			);

			const overwrites: Partial<Record<keyof UserDTO, string>> = {
				profileEffect,
				avatarDecoration: decoration,
			};
			const stringifyOverwrites = JSON.stringify(overwrites);
			const isOverwrites = Object.values(overwrites).some(
				(p) => p !== undefined,
			);

			// if (process.env.NODE_ENV === 'dev') {
			// 	return renderBanner(res, {
			// 		memberId,
			// 		overwrites,
			// 		cacheHeader,
			// 		bannerParams,
			// 	});
			// }

			const relatedCacheKeys = await scanCacheKeys((candidate) => {
				const {
					bannerParams: candidateBannerParams,
					overwrites: candidateOverwrites,
					username,
					userId,
				} = getDataFromCacheKey(candidate);

				const isSameUser = userId === memberId || username === memberId;
				const isSameOverwrites =
					JSON.stringify(candidateOverwrites) === stringifyOverwrites;
				const isSameBannerParams =
					JSON.stringify(candidateBannerParams) === stringifyBannerParams;

				if (isOverwrites && isBannerParams) {
					return isSameUser && isSameOverwrites && isSameBannerParams;
				} else if (isOverwrites) {
					return isSameUser && isSameOverwrites;
				} else if (isBannerParams) {
					return isSameUser && isSameBannerParams;
				} else {
					return isSameUser;
				}
			});

			const cachedWidget = await redisClient.get(relatedCacheKeys[0]);
			if (cachedWidget) {
				res.setHeader('Content-Type', 'image/svg+xml');
				res.setHeader('Cache-Control', cacheHeader);
				return res.status(200).send(cachedWidget);
			}

			return renderBanner(res, {
				memberId,
				overwrites,
				cacheHeader,
				bannerParams,
			});
		},
	);

	app.listen(SERVER_PORT, () =>
		console.log(`Server listening on http://127.0.0.1:${SERVER_PORT}`),
	);
};
