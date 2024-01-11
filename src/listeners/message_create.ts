import { Effect, pipe } from "effect";
import { Awaitable, Client, Message } from "discord.js";
import { recordCreatedMsg, messageGuard } from "@tasks";
import { EnvVariables } from "@services/env";
import { ChannelStoreRef, ChannelStoreService } from "@services/channel_store";

export const messageCreateListener = (
	client: Client<true>,
	env: EnvVariables,
	channelStoreRef: ChannelStoreRef,
) => {
	const provideChannelStoreRef = Effect.provideService(
		ChannelStoreService,
		ChannelStoreService.of(channelStoreRef),
	);

	return (msg: Message<boolean>): Awaitable<void> => {
		const program = pipe(
			Effect.succeed(msg),
			Effect.tap((msg) => messageGuard(msg, client)),
			Effect.flatMap(recordCreatedMsg(env)(client)),
			Effect.orElse(() => Effect.succeed(msg)),
		).pipe(provideChannelStoreRef);

		Effect.runPromise(program);
	};
};
