import { Config, Context, Layer } from "effect";

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
    readonly TURSO_DB_TOKEN: string;
    readonly TURSO_DB_URL: string;
}

export class EnvConfig extends Context.Tag("EnvConfig")<EnvConfig, Env>() {}

export const EnvLive = Layer.effect(
    EnvConfig,
    Config.all({
        TOKEN: Config.string("TOKEN"),
        BOT_SENDING_CHANNEL_ID: Config.string("BOT_SENDING_CHANNEL_ID"),
        BOT_SENDING_CHANNEL_NAME: Config.string("BOT_SENDING_CHANNEL_NAME"),
        LOG_CHANNEL_ID: Config.string("LOG_CHANNEL_ID"),
        ADMIN_ROLE_ID: Config.string("ADMIN_ROLE_ID"),
        CLIENT_ID: Config.string("CLIENT_ID"),
        GUILD_ID: Config.string("GUILD_ID"),
        VOTE_ROLE_ID: Config.string("VOTE_ROLE_ID"),
        TIMEZONE: Config.string("TIMEZONE"),
        CAT_API_KEY: Config.string("CAT_API_KEY"),
        EMOJI_KITCHEN_KEY: Config.string("EMOJI_KITCHEN_KEY"),
        TURSO_DB_TOKEN: Config.string("TURSO_DB_TOKEN"),
        TURSO_DB_URL: Config.string("TURSO_DB_URL"),
    }),
);
