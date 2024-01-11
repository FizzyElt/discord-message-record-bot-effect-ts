import { Effect, pipe } from "effect";
import { Client, Message, PartialMessage } from "discord.js";
import { ChannelStoreRef, ChannelStoreService } from "@services/channel_store";
import { EnvVariables } from "@services/env";
import { messageGuard, recordUpdateMsg } from "@tasks";

export const messageUpdateListener = (
	client: Client<true>,
	env: EnvVariables,
	channelStoreRef: ChannelStoreRef,
) => {
	const provideChannelStoreRef = Effect.provideService(
		ChannelStoreService,
		ChannelStoreService.of(channelStoreRef),
	);

	return (
		oldMsg: Message<boolean> | PartialMessage,
		newMsg: Message<boolean> | PartialMessage,
	) => {
		const program = pipe(
			Effect.succeed(newMsg),
			Effect.tap((msg) => messageGuard(msg, client)),
			Effect.flatMap((msg) => recordUpdateMsg(env)(client)(oldMsg, msg)),
			Effect.orElse(() => Effect.succeed(newMsg)),
		).pipe(provideChannelStoreRef);

		Effect.runPromise(program);
	};
};
