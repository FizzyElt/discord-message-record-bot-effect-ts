import { getEnvService } from "@services/env";
import { Client, GatewayIntentBits } from "discord.js";
import { Context, Effect, identity, pipe, Layer } from "effect";

import { EnvLive, EnvConfig } from "./env";

export class ClientService extends Context.Tag("ClientService")<
  ClientService,
  Client<true>
>() {}

export const clientContext = ClientService.pipe(Effect.map(identity));

export const provideClientService = Effect.provideService(
  ClientService,
  ClientService.of(
    new Client({
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
    }),
  ),
);

export const loginClient = (client: Client<boolean>) =>
  pipe(
    getEnvService,
    Effect.flatMap((env) => Effect.tryPromise(() => client.login(env.token))),
  );

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
