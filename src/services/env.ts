import dotenv from "dotenv";
import { Context, Layer } from "effect";

dotenv.config();

// layer

export interface Env {
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
  readonly CLOUDFLARE_ACCOUNT_ID: string;
  readonly CLOUDFLARE_AI_TOKEN: string;
  readonly SUPABASE_URL_ADMIN: string;
}

export class EnvConfig extends Context.Tag("EnvConfig")<EnvConfig, Env>() {}

export const EnvLive = Layer.succeed(EnvConfig, {
  TOKEN: process.env.TOKEN || "",
  BOT_SENDING_CHANNEL_ID: process.env.BOT_SENDING_CHANNEL_ID || "",
  BOT_SENDING_CHANNEL_NAME: process.env.BOT_SENDING_CHANNEL_NAME || "",
  LOG_CHANNEL_ID: process.env.LOG_CHANNEL_ID || "",
  ADMIN_ROLE_ID: process.env.ADMIN_ROLE_ID || "",
  CLIENT_ID: process.env.CLIENT_ID || "",
  GUILD_ID: process.env.GUILD_ID || "",
  VOTE_ROLE_ID: process.env.VOTE_ROLE_ID || "",
  TIMEZONE: process.env.TIMEZONE || "",
  CAT_API_KEY: process.env.CAT_API_KEY || "",
  EMOJI_KITCHEN_KEY: process.env.EMOJI_KITCHEN_KEY || "",
  CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID || "",
  CLOUDFLARE_AI_TOKEN: process.env.CLOUDFLARE_AI_TOKEN || "",
  SUPABASE_URL_ADMIN: process.env.SUPABASE_URL_ADMIN || "",
});
