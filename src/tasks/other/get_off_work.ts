import { format } from "date-fns";
import type {
    ChatInputCommandInteraction,
    CacheType,
    InteractionResponse,
} from "discord.js";
import { Effect, DateTime } from "effect";
import { NoSuchElementException, UnknownException } from "effect/Cause";

import { bold } from "~/utils/mark_string";

export const getOffWork = (
    interaction: ChatInputCommandInteraction<CacheType>,
): Effect.Effect<
    InteractionResponse<boolean>,
    NoSuchElementException | UnknownException,
    never
> =>
    Effect.gen(function* () {
        const user = interaction.user;

        const now = yield* DateTime.now;

        const zonedDate = yield* Effect.void.pipe(
            Effect.flatMap(() =>
                DateTime.makeZoned(now, { timeZone: "Asia/Taipei" }),
            ),
            Effect.map(DateTime.toDateUtc),
        );

        const zonedDateString = format(zonedDate, "yyyy-MM-dd HH:mm:ssXXXX");

        return yield* Effect.tryPromise(() =>
            interaction.reply({
                content: `${user.toString()} 這個逼班就上到這了\n${bold(zonedDateString)}`,
            }),
        );
    });
