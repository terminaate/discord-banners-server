import 'dotenv/config';
import { startBot } from '@/bot';
import { startServer } from '@/api';

export const main = async () => {
	await startBot();
	startServer();
};

void main();
