import { Client, GatewayIntentBits } from "discord.js";
import { Effect, Layer, ServiceMap } from "effect";

import { EnvConfig } from "./env";

// layer
export class ClientContext extends ServiceMap.Service<
    ClientContext,
    Client<true>
>()("ClientContext") {}

export const ClientLive = Layer.effect(
    ClientContext,
    Effect.gen(function* () {
        const env = yield* EnvConfig;

        const client = new Client<true>({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildModeration,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.DirectMessages,
            ],
        });

        yield* Effect.tryPromise(() => client.login(env.TOKEN));

        return client;
    }),
);
