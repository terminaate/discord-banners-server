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
	handleBannerWithOverwrites,
	handleCachedOrDefaultBanner,
	validateDecoration,
	validateProfileEffect,
} from '@/api/utils';

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

			if (Object.values(overwrites).some(Boolean)) {
				return handleBannerWithOverwrites(
					memberId,
					overwrites,
					cacheHeader,
					res,
				);
			}

			return handleCachedOrDefaultBanner(memberId, cacheHeader, res);
		},
	);

	app.listen(SERVER_PORT, () =>
		console.log(`Server listening on http://127.0.0.1:${SERVER_PORT}`),
	);
};
