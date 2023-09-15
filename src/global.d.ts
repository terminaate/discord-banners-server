type Class<T = any> = { new (): T };

namespace NodeJS {
	interface ProcessEnv {
		SERVER_PORT: string;
		NODE_ENV: 'dev' | 'prod';
		BOT_TOKEN: stirng;
		GUILD_ID: string;
	}
}
