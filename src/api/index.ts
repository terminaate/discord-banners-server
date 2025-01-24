import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import { redisClient } from '@/redis';

// import { userBanners } from '@/banner/updateBanner';

class ResponseDTO {
	constructor(
		public message: string | string[],
		public statusCode: number,
	) {}
}

const bodyExceptionMiddleware = (
	err: SyntaxError | unknown,
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	if (process.env.NODE_ENV === 'dev') {
		console.log(err);
	}
	if (err instanceof SyntaxError && 'body' in err) {
		return res.status(400).json(new ResponseDTO(err.message, 400));
	}
	next();
};

export const startServer = () => {
	const app = express();

	const { SERVER_PORT } = process.env;

	app.disable('x-powered-by');
	app.use(cors());
	app.use(express.json());
	app.use(bodyExceptionMiddleware);
	app.use(morgan(process.env.NODE_ENV === 'dev' ? 'dev' : 'common'));

	app.get('/widget/:memberId', async (req, res) => {
		// res.header('Content-Type', 'image/png');
		// userBanners[req.params.memberId].pipe(res);
		// res.send();
		res.send(await redisClient.get(req.params.memberId));
	});

	app.listen(SERVER_PORT, () =>
		console.log(`Server listening on http://127.0.0.1:${SERVER_PORT}`),
	);
};
