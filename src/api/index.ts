import cors from 'cors';
import express, { Request, Response } from 'express';
import morgan from 'morgan';
import { query, validationResult } from 'express-validator';
import { ProfileEffectsService } from '@/services/ProfileEffectsService';
import { AvatarDecorationsService } from '@/services/AvatarDecorationsService';
import { bodyExceptionMiddleware } from '@/api/middlewares';
import {
	getCacheHeader,
	getOverwrites,
	validateDecoration,
	validateProfileEffect,
} from '@/api/utils';
import { UserDTO } from '@/dto/user.dto';
import { getMemberById } from '@/bot/getMemberById';
import { updateBanner } from '@/banner/updateBanner';
import { redisClient } from '@/redis';
import { scanCacheKeys } from '@/utils/scanCacheKeys';

type BannerRequest = Request<
	{ memberId: string },
	any,
	any,
	{
		cache?: boolean;
		profileEffect?: string;
		decoration?: string;
	}
>;

async function renderBanner(
	res: Response,
	memberId: string,
	overwrites: Partial<Record<keyof UserDTO, string>>,
	cacheHeader: string,
) {
	const candidate = await getMemberById(memberId);
	if (!candidate) {
		return res.status(404).send('User not found');
	}

	const svg = await updateBanner(
		candidate,
		candidate.presence?.activities,
		overwrites,
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
		res.json(ProfileEffectsService.getAll());
	});

	app.get('/decorations', (req, res) => {
		res.json(AvatarDecorationsService.getAll());
	});

	// TODO: add "animated" query
	app.get(
		'/banner/:memberId',
		query('cache').optional().isBoolean().toBoolean(),
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
			} = req.query;
			const { memberId } = req.params;

			const cacheHeader = getCacheHeader(needToCacheResponse);
			const overwrites = getOverwrites(profileEffect, decoration);
			const stringifyOverwrites = JSON.stringify(overwrites);
			const isOverwrites = Object.values(overwrites).some(Boolean);

			// if (process.env.NODE_ENV === 'dev') {
			// 	return renderBanner(res, memberId, overwrites, cacheHeader);
			// }

			const relatedCacheKeys = await scanCacheKeys((candidate) => {
				// @note: removes date
				candidate = candidate.slice(candidate.indexOf('-') + 1);

				if (isOverwrites) {
					return (
						candidate.startsWith(memberId) &&
						candidate.endsWith(stringifyOverwrites)
					);
				}

				const arr = candidate.split('@');

				return arr.length === 2 && arr.includes(memberId);
			});

			const cachedWidget = await redisClient.get(relatedCacheKeys[0]);
			if (cachedWidget) {
				res.setHeader('Content-Type', 'image/svg+xml');
				res.setHeader('Cache-Control', cacheHeader);
				return res.status(200).send(cachedWidget);
			}

			return renderBanner(res, memberId, overwrites, cacheHeader);
		},
	);

	app.listen(SERVER_PORT, () =>
		console.log(`Server listening on http://127.0.0.1:${SERVER_PORT}`),
	);
};
