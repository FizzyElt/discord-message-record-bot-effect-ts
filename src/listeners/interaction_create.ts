import { CommandName } from '~/slash_command/main_command';
import { MemeCommandName } from '~/slash_command/meme_command';
import { StickyCommandName } from '~/slash_command/sticky_command';
import {
  addChannelFlow,
  banUser,
  createSticky,
  deleteSticky,
  getEmoJiJi,
  listChannels,
  removeChannelFlow,
  showSticky,
  backupSticky,
  subscribe,
  unsubscribe,
} from '~/tasks';

import { Effect, pipe } from 'effect';

import type {
  Awaitable,
  CacheType,
  ChatInputCommandInteraction,
  Interaction,
  InteractionResponse,
  Message,
  InteractionCallbackResponse,
} from 'discord.js';
import type { NoSuchElementException, UnknownException } from 'effect/Cause';
import {
  type ChannelService,
  type ClientContext,
  EnvConfig,
  type MainLive,
  type TimeoutInfoListService,
  type VotingService,
} from '~/services';
import type { Database } from '~/services/database';
import type { StickyService } from '~/services/sticky_store';

export const interactionCreateListener =
  (live: typeof MainLive) =>
  (interaction: Interaction<CacheType>): Awaitable<void> => {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    const program = pipe(
      commandOperation(interaction),
      Effect.orElse(() => Effect.succeed('reply error'))
    );

    Effect.runPromise(program.pipe(Effect.provide(live)));
  };

function commandOperation(
  interaction: ChatInputCommandInteraction<CacheType>
): Effect.Effect<
  Message<boolean> | InteractionResponse<boolean> | InteractionCallbackResponse,
  UnknownException | NoSuchElementException,
  | ClientContext
  | ChannelService
  | EnvConfig
  | TimeoutInfoListService
  | VotingService
  | StickyService
  | Database
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
        Effect.flatMap(({ VOTE_ROLE_ID }) => subscribe(VOTE_ROLE_ID)(interaction))
      );
    case CommandName.unsubscribe:
      return pipe(
        EnvConfig,
        Effect.flatMap(({ VOTE_ROLE_ID }) => unsubscribe(VOTE_ROLE_ID)(interaction))
      );

    // sticky commands
    case StickyCommandName.create_sticky:
      return createSticky(interaction);
    case StickyCommandName.delete_sticky:
      return deleteSticky(interaction);
    case StickyCommandName.sticky:
      return showSticky(interaction);
    case StickyCommandName.backup_sticky:
      return backupSticky(interaction);

    // meme commands
    case MemeCommandName.emoJiji:
      return getEmoJiJi(interaction);

    default:
      return Effect.tryPromise(() => interaction.reply('不支援的指令'));
  }
}
