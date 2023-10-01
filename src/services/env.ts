import { Effect, Context, identity } from 'effect';
import dotenv from 'dotenv';

dotenv.config();

export interface EnvVariables {
  token: string;
  bot_sending_channel_id: string;
  bot_sending_channel_name: string;
  log_channel_id: string;
  admin_role_id: string;
  client_id: string;
  guild_id: string;
  vote_role_id: string;
  timezone: string;
}

export const EnvContext = Context.Tag<EnvVariables>();

export const getEnvService = EnvContext.pipe(Effect.map(identity));

export const provideEnvService = Effect.provideService(
  EnvContext,
  EnvContext.of({
    token: process.env.TOKEN || '',
    bot_sending_channel_id: process.env.BOT_SENDING_CHANNEL_ID || '',
    bot_sending_channel_name: process.env.BOT_SENDING_CHANNEL_NAME || '',
    log_channel_id: process.env.LOG_CHANNEL_ID || '',
    admin_role_id: process.env.ADMIN_ROLE_ID || '',
    client_id: process.env.CLIENT_ID || '',
    guild_id: process.env.GUILD_ID || '',
    vote_role_id: process.env.VOTE_ROLE_ID || '',
    timezone: process.env.TIMEZONE || '',
  })
);
