import { Client, GatewayIntentBits } from "discord.js";
import { Context, Effect, Layer } from "effect";
import { EnvConfig } from "./env";

// layer
export class ClientContext extends Context.Tag("ClientContext")<
  ClientContext,
  Client<true>
>() {}

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
