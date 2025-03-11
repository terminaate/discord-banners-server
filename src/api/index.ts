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
import { hashJson } from '@/utils/hashJson';

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

	const userDto = await UserDTO.create(candidate);
	Object.assign(userDto, overwrites);

	const svg = await updateBanner(userDto, candidate.presence?.activities);

	if (Object.values(overwrites).some(Boolean)) {
		const hashedJson = await hashJson(overwrites);

		await redisClient.set(`${userDto.id}_${hashedJson}`, svg);
		await redisClient.set(`${userDto.username}_${hashedJson}`, svg);
	}

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

			// if (process.env.NODE_ENV === 'dev') {
			// 	return renderBanner(res, memberId, overwrites, cacheHeader);
			// }

			if (Object.values(overwrites).some(Boolean)) {
				const id = `${memberId}_${await hashJson(overwrites)}`;
				const candidate = await redisClient.get(id);

				if (candidate) {
					res.setHeader('Content-Type', 'image/svg+xml');
					res.setHeader('Cache-Control', cacheHeader);
					return res.status(200).send(candidate);
				}

				return renderBanner(res, memberId, overwrites, cacheHeader);
			}

			const cachedWidget = await redisClient.get(memberId);
			if (cachedWidget) {
				res.setHeader('Content-Type', 'image/svg+xml');
				res.setHeader('Cache-Control', cacheHeader);
				return res.status(200).send(cachedWidget);
			}

			return renderBanner(res, memberId, {}, cacheHeader);
		},
	);

	app.listen(SERVER_PORT, () =>
		console.log(`Server listening on http://127.0.0.1:${SERVER_PORT}`),
	);
};
