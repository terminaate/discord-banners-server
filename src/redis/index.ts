import Redis from 'ioredis';

export const redisClient = new Redis({
	port: Number(process.env.REDIS_PORT),
	host: process.env.REDIS_HOST,
});

redisClient.once('connect', () => {
	console.log('Connected to redis');
});
