import {
    type CacheType,
    type ChatInputCommandInteraction,
    type InteractionResponse,
    bold,
    time,
} from "discord.js";
import { Effect } from "effect";
import { UnknownError } from "effect/Cause";

export const getOffWork = (
    interaction: ChatInputCommandInteraction<CacheType>,
): Effect.Effect<InteractionResponse<boolean>, UnknownError, never> =>
    Effect.gen(function* () {
        const user = interaction.user;

        return yield* Effect.tryPromise(() =>
            interaction.reply({
                content: `${user.toString()} 這個逼班就上到這了\n${bold(time())}`,
            }),
        );
    });
