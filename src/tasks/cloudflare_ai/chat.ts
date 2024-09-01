import { fetchLlama } from "@utils/cloudflare_ai_api";
import { getCommandOptionString } from "@utils/command";
import { Effect, pipe } from "effect";

import type { EnvVariables } from "@services/env";
import type { CommandInteraction } from "discord.js";

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
