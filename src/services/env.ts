import type { Env } from "bun";
import { Context, Layer } from "effect";

declare module "bun" {
  interface Env {
    readonly TOKEN: string;
    readonly BOT_SENDING_CHANNEL_ID: string;
    readonly BOT_SENDING_CHANNEL_NAME: string;
    readonly LOG_CHANNEL_ID: string;
    readonly ADMIN_ROLE_ID: string;
    readonly CLIENT_ID: string;
    readonly GUILD_ID: string;
    readonly VOTE_ROLE_ID: string;
    readonly TIMEZONE: string;
    readonly CAT_API_KEY: string;
    readonly EMOJI_KITCHEN_KEY: string;
    readonly SUPABASE_URL_ADMIN: string;
    readonly DATABASE_URL: string;
  }
}

export class EnvConfig extends Context.Tag("EnvConfig")<EnvConfig, Env>() {}

export const EnvLive = Layer.succeed(EnvConfig, {
  TOKEN: Bun.env.TOKEN,
  BOT_SENDING_CHANNEL_ID: Bun.env.BOT_SENDING_CHANNEL_ID,
  BOT_SENDING_CHANNEL_NAME: Bun.env.BOT_SENDING_CHANNEL_NAME,
  LOG_CHANNEL_ID: Bun.env.LOG_CHANNEL_ID,
  ADMIN_ROLE_ID: Bun.env.ADMIN_ROLE_ID,
  CLIENT_ID: Bun.env.CLIENT_ID,
  GUILD_ID: Bun.env.GUILD_ID,
  VOTE_ROLE_ID: Bun.env.VOTE_ROLE_ID,
  TIMEZONE: Bun.env.TIMEZONE,
  CAT_API_KEY: Bun.env.CAT_API_KEY,
  EMOJI_KITCHEN_KEY: Bun.env.EMOJI_KITCHEN_KEY,
  SUPABASE_URL_ADMIN: Bun.env.SUPABASE_URL_ADMIN,
  DATABASE_URL: Bun.env.DATABASE_URL,
});
