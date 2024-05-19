import type { CommandInteraction } from "discord.js";
import type { EnvVariables } from "@services/env";

import { Effect, pipe } from "effect";
import { getCommandOptionString } from "@utils/command";
import { fetchLlama } from "@utils/cloudflare_ai_api";

export const replyWithAi =
  (env: EnvVariables) => (interaction: CommandInteraction) => {
    return pipe(
      Effect.tryPromise(() => interaction.deferReply()),
      Effect.flatMap(() =>
        fetchLlama({
          accountId: env.cloudflare_account_id,
          token: env.cloudflare_ai_token,
          content: getCommandOptionString("content")(interaction),
        }),
      ),
      Effect.flatMap((res) =>
        Effect.tryPromise(() => interaction.editReply(res)),
      ),
    );
  };
