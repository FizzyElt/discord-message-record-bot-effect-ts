import type {
    Awaitable,
    CacheType,
    ChatInputCommandInteraction,
    Interaction,
    InteractionCallbackResponse,
    InteractionResponse,
    Message,
} from "discord.js";
import type { NoSuchElementError, UnknownError } from "effect/Cause";

import { Effect, Match, pipe } from "effect";

import {
    type ChannelService,
    type ClientContext,
    EnvConfig,
    MainLive,
    type TimeoutInfoListService,
    type VotingService,
} from "~/services";
import { CommandName } from "~/slash_command/main_command";
import { MemeCommandName } from "~/slash_command/meme_command";
import {
    addChannelFlow,
    banUser,
    getCatImage,
    getEmoJiJi,
    getOffWork,
    listChannels,
    removeChannelFlow,
    subscribe,
    unsubscribe,
} from "~/tasks";

function commandOperation(
    interaction: ChatInputCommandInteraction<CacheType>,
): Effect.Effect<
    Message<boolean> | InteractionResponse<boolean> | InteractionCallbackResponse,
    NoSuchElementError | UnknownError,
    ClientContext | ChannelService | EnvConfig | TimeoutInfoListService | VotingService
> {
    return Match.value(interaction.commandName).pipe(
        Match.when(CommandName.ADD_CHANNELS, () => addChannelFlow(interaction)),
        Match.when(CommandName.REMOVE_CHANNELS, () => removeChannelFlow(interaction)),
        Match.when(CommandName.CHANNEL_LIST, () => listChannels(interaction)),
        Match.when(CommandName.BAN_USER, () => banUser(interaction)),
        Match.when(CommandName.GET_OFF_WORK, () => getOffWork(interaction)),

        Match.when(CommandName.SUBSCRIBE, () =>
            pipe(
                Effect.service(EnvConfig),
                Effect.flatMap(({ VOTE_ROLE_ID }) => subscribe(VOTE_ROLE_ID)(interaction)),
            ),
        ),

        Match.when(CommandName.UNSUBSCRIBE, () =>
            pipe(
                Effect.service(EnvConfig),
                Effect.flatMap(({ VOTE_ROLE_ID }) => unsubscribe(VOTE_ROLE_ID)(interaction)),
            ),
        ),

        // meme commands
        Match.when(MemeCommandName.EMOJIJI, () => getEmoJiJi(interaction)),
        Match.when(MemeCommandName.CAT, () => getCatImage(interaction)),

        Match.orElse(() => Effect.tryPromise(() => interaction.reply("不支援的指令"))),
    );
}

export const interactionCreateListener =
    (live: typeof MainLive) =>
    (interaction: Interaction<CacheType>): Awaitable<void> => {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const program = pipe(
            commandOperation(interaction),
            Effect.orElseSucceed(() => "reply error"),
        );

        Effect.runPromise(program.pipe(Effect.provide(live)));
    };
