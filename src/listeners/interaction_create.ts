import { CacheType, Interaction, Awaitable, Client, CommandInteraction } from 'discord.js';
import { isCommandInteraction } from '@utils/interaction';
import { VotingStoreRef, VotingStoreService } from '@services/voting_store';
import { ChannelStoreRef, ChannelStoreService } from '@services/channel_store';
import { CommandName } from '@slashCommand/command';
import { addChannelFlow, removeChannelFlow } from '@tasks';
import { Effect, pipe, Match } from 'effect';

export function interactionCreate(
  client: Client<true>,
  votingStoreRef: VotingStoreRef,
  channelStoreRef: ChannelStoreRef
) {
  const provideChannelStoreRef = Effect.provideService(
    ChannelStoreService,
    ChannelStoreService.of(channelStoreRef)
  );
  const provideVotingStoreRef = Effect.provideService(
    VotingStoreService,
    VotingStoreService.of(votingStoreRef)
  );

  return (interaction: Interaction<CacheType>): Awaitable<void> => {
    if (!isCommandInteraction(interaction)) {
      return;
    }

    const program = pipe(
      interaction,
      commandOperation(client),
      Effect.orElseFail(() => 'reply error')
    ).pipe(provideChannelStoreRef, provideVotingStoreRef);

    Effect.runPromise(program);
  };
}

function commandOperation(client: Client<true>) {
  const addChannel = addChannelFlow(client);
  const removeChannel = removeChannelFlow(client);

  return (interaction: CommandInteraction) => {
    switch (interaction.commandName) {
      case CommandName.add_channels:
        return addChannel(interaction);
      case CommandName.remove_channels:
        return removeChannel(interaction);
      // case CommandName.channel_list:
      //   return removeChannel(interaction);
      // case CommandName.ban_user:
      //   return removeChannel(interaction);
      // case CommandName.timeout_info:
      //   return removeChannel(interaction);
      // case CommandName.subscribe:
      //   return removeChannel(interaction);
      // case CommandName.unsubscribe:
      //   return removeChannel(interaction);
      default:
        return Effect.tryPromise(() => interaction.reply('不支援的指令'));
    }
  };
}
