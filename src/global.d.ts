type Class<T = any> = { new (): T };

namespace NodeJS {
  interface ProcessEnv {
    SERVER_PORT: string;
    NODE_ENV: 'dev' | 'prod';
    BOT_TOKEN: string;
    GUILD_ID: string;
    FAKE_PROFILE_API: string;
  }
}
