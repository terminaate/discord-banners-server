import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import { User } from '@/models/user.model';
import { Banner } from '@/banner/Banner';
import { UserActivity } from '@/models/user-activity.model';
import { UserDTO } from '@/dto/user.dto';

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

export const boostrapServer = () => {
	const app = express();

	const { SERVER_PORT } = process.env;

	app.disable('x-powered-by');
	app.use(cors());
	app.use(express.json());
	app.use(bodyExceptionMiddleware);
	app.use(morgan(process.env.NODE_ENV === 'dev' ? 'dev' : 'common'));

	app.get('/widget/:userid', async (req, res) => {
		const userId = req.params.userid;
		const user = await User.findByPk(userId);

		res.setHeader(
			'Content-Type',
			user == null ? 'application/json' : 'image/png',
		);

		if (user == null) {
			return res.status(404).json(new ResponseDTO('User not found', 404));
		}

		const userActivity = await UserActivity.findOne({ where: { userId } });
		console.log(userActivity?.dataValues.image);

		const canvas = await Banner.create(user, userActivity ?? undefined);
		res.status(200);
		canvas.createPNGStream().pipe(res);
	});

	app.listen(SERVER_PORT, () =>
		console.log('Server listening on http://127.0.0.1:' + SERVER_PORT),
	);
};
