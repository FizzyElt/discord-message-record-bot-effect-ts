import {
  addChannelFlow,
  banUser,
  getEmoJiJi,
  getMyPartyGif,
  getNoImageGif,
  getPyPartyGif,
  listChannels,
  removeChannelFlow,
  subscribe,
  unsubscribe,
} from "@tasks";
import { isCommandInteraction } from "@utils/interaction";
import { Effect, pipe } from "effect";
import { CommandName } from "~/slash_command/main_command";
import { MemeCommandName } from "~/slash_command/meme_command";

import {
  type ChannelService,
  type ClientContext,
  EnvConfig,
  type MainLive,
  type TimeoutInfoListService,
  type VotingService,
} from "@services";
import type {
  Awaitable,
  CacheType,
  CommandInteraction,
  Interaction,
  InteractionResponse,
  Message,
} from "discord.js";

export const interactionCreateListener =
  (live: typeof MainLive) =>
  (interaction: Interaction<CacheType>): Awaitable<void> => {
    if (!isCommandInteraction(interaction)) {
      return;
    }

    const program = pipe(
      commandOperation(interaction),
      Effect.orElse(() => Effect.succeed("reply error")),
    );

    Effect.runPromise(program.pipe(Effect.provide(live)));
  };

function commandOperation(
  interaction: CommandInteraction,
): Effect.Effect<
  Message<boolean> | InteractionResponse<boolean>,
  unknown,
  | ClientContext
  | ChannelService
  | EnvConfig
  | TimeoutInfoListService
  | VotingService
> {
  switch (interaction.commandName) {
    case CommandName.add_channels:
      return addChannelFlow(interaction);
    case CommandName.remove_channels:
      return removeChannelFlow(interaction);
    case CommandName.channel_list:
      return listChannels(interaction);
    case CommandName.ban_user:
      return banUser(interaction);

    case CommandName.subscribe:
      return pipe(
        EnvConfig,
        Effect.flatMap(({ VOTE_ROLE_ID }) =>
          subscribe(VOTE_ROLE_ID)(interaction),
        ),
      );
    case CommandName.unsubscribe:
      return pipe(
        EnvConfig,
        Effect.flatMap(({ VOTE_ROLE_ID }) =>
          unsubscribe(VOTE_ROLE_ID)(interaction),
        ),
      );

    // meme commands
    case MemeCommandName.pyParty:
      return getPyPartyGif(interaction);
    case MemeCommandName.myParty:
      return getMyPartyGif(interaction);
    case MemeCommandName.noImage:
      return getNoImageGif(interaction);
    case MemeCommandName.emoJiji:
      return getEmoJiJi(interaction);

    default:
      return Effect.tryPromise(() => interaction.reply("不支援的指令"));
  }
}
