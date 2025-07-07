import type { ChatInputCommandInteraction } from "discord.js";
import { Effect, pipe, String } from "effect";
import { fetchCatImage } from "~/utils/cat_image";
import { getCommandOptionString } from "~/utils/command";
import { fetchEmoji } from "~/utils/google_emoji";

export const getEmoJiJi = (interaction: ChatInputCommandInteraction) =>
  pipe(
    Effect.tryPromise(() => interaction.deferReply()),
    Effect.flatMap(() =>
      pipe(
        Effect.Do,
        Effect.let("left", () =>
          pipe(interaction, getCommandOptionString("left"), String.trim),
        ),
        Effect.let("right", () =>
          pipe(interaction, getCommandOptionString("right"), String.trim),
        ),
        Effect.flatMap(({ left, right }) => fetchEmoji(left, right)),
        Effect.orElse(() => Effect.succeed("emoji kitchen 找不到組合")),
      ),
    ),
    Effect.flatMap((emojijiMsg) =>
      Effect.tryPromise(() => interaction.editReply(emojijiMsg)),
    ),
  );

export const getCatImage = (interaction: ChatInputCommandInteraction) =>
  pipe(
    Effect.tryPromise(() => interaction.deferReply()),
    Effect.flatMap(() => fetchCatImage()),
    Effect.flatMap((catImageUrl) =>
      Effect.tryPromise(() => interaction.editReply(catImageUrl)),
    ),
    Effect.mapError(console.log),
  );
