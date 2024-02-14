import {
	CacheType,
	Interaction,
	Awaitable,
	Client,
	CommandInteraction,
	Message,
	InteractionResponse,
} from "discord.js";
import { isCommandInteraction } from "@utils/interaction";
import { VotingStoreRef, VotingStoreService } from "@services/voting_store";
import { ChannelStoreRef, ChannelStoreService } from "@services/channel_store";
import {
	TimeoutInfo,
	provideTimeoutInfoService,
	TimeoutInfoContext,
} from "@services/timeout";
import { EnvVariables, provideEnvService, EnvContext } from "@services/env";

import { CommandName } from "@slashCommand/command";
import {
	addChannelFlow,
	removeChannelFlow,
	listChannels,
	subscribe,
	unsubscribe,
	banUserFlow,
} from "@tasks";
import { Effect, pipe } from "effect";

export function interactionCreate(
	client: Client<true>,
	env: EnvVariables,
	votingStoreRef: VotingStoreRef,
	channelStoreRef: ChannelStoreRef,
) {
	const provideChannelStoreRef = Effect.provideService(
		ChannelStoreService,
		channelStoreRef,
	);
	const provideVotingStoreRef = Effect.provideService(
		VotingStoreService,
		votingStoreRef,
	);

	return (interaction: Interaction<CacheType>): Awaitable<void> => {
		if (!isCommandInteraction(interaction)) {
			return;
		}
		const program = pipe(
			interaction,
			commandOperation(client, env),
			Effect.orElse(() => Effect.succeed("reply error")),
		).pipe(
			provideChannelStoreRef,
			provideVotingStoreRef,
			provideTimeoutInfoService,
			provideEnvService,
		);

		Effect.runPromise(program);
	};
}

function commandOperation(client: Client<true>, env: EnvVariables) {
	const addChannel = addChannelFlow(client);
	const removeChannel = removeChannelFlow(client);
	const banUser = banUserFlow(client, env);

	return (
		interaction: CommandInteraction,
	): Effect.Effect<
		Message<boolean> | InteractionResponse<boolean>,
		unknown,
		ChannelStoreService | TimeoutInfoContext | VotingStoreService | EnvContext
	> => {
		switch (interaction.commandName) {
			case CommandName.add_channels:
				return addChannel(interaction);
			case CommandName.remove_channels:
				return removeChannel(interaction);
			case CommandName.channel_list:
				return listChannels(interaction);
			case CommandName.ban_user:
				return banUser(interaction);
			// case CommandName.timeout_info:
			//   return removeChannel(interaction);
			case CommandName.subscribe:
				return subscribe(env.vote_role_id)(interaction);
			case CommandName.unsubscribe:
				return unsubscribe(env.vote_role_id)(interaction);
			default:
				return Effect.tryPromise(() => interaction.reply("不支援的指令"));
		}
	};
}
