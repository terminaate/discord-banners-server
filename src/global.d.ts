type Class<T = any> = { new (): T };

namespace NodeJS {
	interface ProcessEnv {
		SERVER_PORT: string;
		NODE_ENV: 'dev' | 'prod';
		BOT_TOKEN: string;
		GUILD_ID: string;
		REDIS_HOST: string;
		REDIS_PORT: string;
	}
}
