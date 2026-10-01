import { Config, ConfigProvider, Context, Effect, Layer } from "effect";
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

const config = Config.all({
    TOKEN: Config.String("TOKEN"),
    BOT_SENDING_CHANNEL_ID: Config.String("BOT_SENDING_CHANNEL_ID"),
    BOT_SENDING_CHANNEL_NAME: Config.String("BOT_SENDING_CHANNEL_NAME"),
    LOG_CHANNEL_ID: Config.String("LOG_CHANNEL_ID"),
    ADMIN_ROLE_ID: Config.String("ADMIN_ROLE_ID"),
    CLIENT_ID: Config.String("CLIENT_ID"),
    GUILD_ID: Config.String("GUILD_ID"),
    VOTE_ROLE_ID: Config.String("VOTE_ROLE_ID"),
    TIMEZONE: Config.String("TIMEZONE"),
    CAT_API_KEY: Config.String("CAT_API_KEY"),
    EMOJI_KITCHEN_KEY: Config.String("EMOJI_KITCHEN_KEY"),
    TURSO_DB_TOKEN: Config.String("TURSO_DB_TOKEN"),
    TURSO_DB_URL: Config.String("TURSO_DB_URL"),
});

export class EnvConfig extends Context.Service<EnvConfig, Env>()("EnvConfig") {}

export const EnvLive = Layer.effect(
    EnvConfig,
    Effect.gen(function* () {
        const provider = yield* ConfigProvider.fromDotEnv();

        return yield* config.parse(provider);
    }),
);
