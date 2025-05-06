type Class<T = any> = { new (): T };

namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'dev' | 'prod';

    SERVER_PORT: string;

    BOT_TOKEN: string;
    GUILD_ID: string;

    FAKE_PROFILE_API: string;

    POSTGRES_HOST: string;
    POSTGRES_PORT: string;
    POSTGRES_USER: string;
    POSTGRES_PASSWORD: string;
    POSTGRES_DB: string;

    SENTRY_DSN: string;
  }
}
