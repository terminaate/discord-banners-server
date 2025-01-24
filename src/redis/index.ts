import Redis from 'ioredis';

export const redisClient = new Redis();

redisClient.once('connect', () => {
	console.log('Connected to redis');
});
