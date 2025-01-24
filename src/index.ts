import dotenv from 'dotenv';
import { startBot } from '@/bot';
import { startServer } from '@/api';

dotenv.config({ path: `.env` });

export const main = async () => {
	await startBot();
	startServer();
};

void main();
