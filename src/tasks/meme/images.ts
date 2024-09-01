import { fetchCatImage } from "@utils/cat_image";
import { getCommandOptionString } from "@utils/command";
import { fetchEmoji } from "@utils/google_emoji";
import { Effect, String, pipe } from "effect";

import type { CommandInteraction } from "discord.js";

export const getPyPartyGif = (interaction: CommandInteraction) =>
  Effect.tryPromise(() =>
    interaction.reply(
      "https://cdn.discordapp.com/attachments/903662488258760707/914521041710248006/KGYJi5c.gif",
    ),
  );

export const getMyPartyGif = (interaction: CommandInteraction) =>
  Effect.tryPromise(() =>
    interaction.reply(
      "https://memeprod.ap-south-1.linodeobjects.com/user-gif/f617320247c594d021a00064f359fae5.gif",
    ),
  );

export const getNoImageGif = (interaction: CommandInteraction) =>
  Effect.tryPromise(() =>
    interaction.reply(
      "https://cdn.discordapp.com/attachments/903662488258760707/917419682900889620/027023d73c4a7e0edee6047909e3f57b.gif",
    ),
  );

export const getEmoJiJi = (interaction: CommandInteraction) =>
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

export const getCatImage = (interaction: CommandInteraction) =>
  pipe(
    Effect.tryPromise(() => interaction.deferReply()),
    Effect.flatMap(() => fetchCatImage()),
    Effect.flatMap((catImageUrl) =>
      Effect.tryPromise(() => interaction.editReply(catImageUrl)),
    ),
    Effect.mapError(console.log),
  );
