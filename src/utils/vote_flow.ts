import type {
    AwaitReactionsOptions,
    CommandInteraction,
    EmojiIdentifierResolvable,
    InteractionCallbackResponse,
    InteractionReplyOptions,
} from "discord.js";
import { Effect, Equal, pipe } from "effect";
import { minute } from "~/services/timeout";

const awaitReactions =
    (options?: AwaitReactionsOptions) => (msg: InteractionCallbackResponse) =>
        Effect.tryPromise(async () =>
            msg?.resource?.message?.awaitReactions(options),
        );

const reactMsg =
    (emoji: EmojiIdentifierResolvable) => (msg: InteractionCallbackResponse) =>
        Effect.tryPromise(async () => msg?.resource?.message?.react(emoji));

const startVoting = (
    interaction: CommandInteraction,
    votingContent: InteractionReplyOptions,
    emoji: EmojiIdentifierResolvable,
) =>
    pipe(
        Effect.tryPromise(() =>
            interaction.reply({ ...votingContent, withResponse: true }),
        ),
        Effect.tap(reactMsg(emoji)),
    );

const collectVote =
    (emoji: EmojiIdentifierResolvable, time: number) =>
    (msg: InteractionCallbackResponse) =>
        pipe(
            msg,
            awaitReactions({
                filter: (reaction, user) =>
                    Equal.equals(reaction.emoji.name, emoji) && !user.bot,
                time: time * minute * 1000,
            }),
            Effect.map(
                (collected) =>
                    (collected?.get(emoji as string)?.count ?? 1) - 1,
            ),
        );

export const createVoting = <A, E, R, A1, E1, R1>(
    interaction: CommandInteraction,
    votingContent: InteractionReplyOptions,
    votingOptions: {
        emoji: EmojiIdentifierResolvable;
        time: number;
    },
    callback: {
        started: (msg: InteractionCallbackResponse) => Effect.Effect<A, E, R>;
        result: (
            count: number,
            msg: InteractionCallbackResponse,
        ) => Effect.Effect<A1, E1, R1>;
    },
) =>
    pipe(
        startVoting(interaction, votingContent, votingOptions.emoji),
        Effect.tap(callback.started),
        Effect.tap((msg) =>
            pipe(
                msg,
                collectVote(votingOptions.emoji, votingOptions.time),
                Effect.flatMap((count) => callback.result(count, msg)),
            ),
        ),
    );
