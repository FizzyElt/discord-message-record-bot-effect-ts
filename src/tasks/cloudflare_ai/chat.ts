import { fetchLlama } from "@utils/cloudflare_ai_api";
import { getCommandOptionString } from "@utils/command";
import { Effect, pipe } from "effect";

import type { Env } from "@services/env";
import type { CommandInteraction } from "discord.js";

export const replyWithAi = (env: Env) => (interaction: CommandInteraction) => {
  return pipe(
    Effect.tryPromise(() => interaction.deferReply()),
    Effect.flatMap(() =>
      fetchLlama({
        accountId: env.CLOUDFLARE_ACCOUNT_ID,
        token: env.CLOUDFLARE_AI_TOKEN,
        content: getCommandOptionString("content")(interaction),
      }),
    ),
    Effect.flatMap((res) =>
      Effect.tryPromise(() => interaction.editReply(res)),
    ),
  );
};
