import { formatInTimeZone } from "date-fns-tz";
import type {
    ChatInputCommandInteraction,
    CacheType,
    InteractionResponse,
} from "discord.js";
import { Effect, DateTime } from "effect";
import { UnknownException } from "effect/Cause";

import { bold } from "~/utils/mark_string";

export const getOffWork = (
    interaction: ChatInputCommandInteraction<CacheType>,
): Effect.Effect<InteractionResponse<boolean>, UnknownException, never> =>
    Effect.gen(function* () {
        const user = interaction.user;

        const now = yield* DateTime.now;

        const date = now.pipe(DateTime.toDate);

        const zonedDateString = formatInTimeZone(
            date,
            "Asia/Taipei",
            "yyyy-MM-dd HH:mm:ssXXXX",
        );

        return yield* Effect.tryPromise(() =>
            interaction.reply({
                content: `${user.toString()} 這個逼班就上到這了\n${bold(zonedDateString)}`,
            }),
        );
    });
