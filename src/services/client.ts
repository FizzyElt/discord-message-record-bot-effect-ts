import { getEnvService } from "@services/env";
import { Client, GatewayIntentBits } from "discord.js";
import { Context, Effect, identity, pipe } from "effect";

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
