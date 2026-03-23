import { format } from "date-fns";
import { MessageReferenceType } from "discord-api-types/v10";
import {
    bold,
    type Message,
    type PartialMessage,
    strikethrough,
} from "discord.js";
import { Effect, pipe, Array as ReadonlyArray, String } from "effect";
import { NoSuchElementException, UnknownException } from "effect/Cause";

import { ClientContext, EnvConfig } from "~/services";
import {
    getTextChannelByClient,
    isPublicThreadChannel,
    isTextChannel,
} from "~/utils/channel";

const getChannelNameByMsg = (msg: Message<boolean> | PartialMessage) =>
    isTextChannel(msg.channel) || isPublicThreadChannel(msg.channel)
        ? msg.channel.name
        : "Other";

const getUserNameByMsg = (msg: Message<boolean> | PartialMessage) =>
    msg.member?.displayName
        ? `${bold(msg.member.displayName)} (${msg.author?.username || ""})`
        : bold(msg.author?.username || "");

const getSendChannel = () =>
    Effect.gen(function* () {
        const client = yield* ClientContext;
        const env = yield* EnvConfig;
        return yield* getTextChannelByClient(env.BOT_SENDING_CHANNEL_ID)(
            client,
        );
    });

// ======================================================

const getCreatedMsgString = (
    msg: Message<boolean> | PartialMessage,
): string => {
    const channelName = getChannelNameByMsg(msg);
    const userName = getUserNameByMsg(msg);
    const timeString = bold(
        `[Created：${format(msg.createdAt, "yyyy/MM/dd HH:mm")}]`,
    );

    return pipe(
        [
            `${userName} ${bold("Create")}`,
            `${channelName} ${timeString}：`,
            String.isString(msg.content) ? msg.content : "",
            "------------------------------------",
        ],
        ReadonlyArray.join("\n"),
    );
};

export const recordCreatedMsg = (
    msg: Message<boolean>,
): Effect.Effect<
    Message<boolean>,
    UnknownException | NoSuchElementException,
    EnvConfig | ClientContext
> =>
    pipe(
        Effect.Do,
        Effect.bind("sendChannel", getSendChannel),
        Effect.bind("sentMsg", ({ sendChannel }) =>
            Effect.tryPromise(
                () =>
                    sendChannel.send({
                        content: getCreatedMsgString(msg),
                        allowedMentions: { parse: [] },
                    }) as Promise<Message<boolean>>,
            ),
        ),
        Effect.tap(({ sentMsg }) => {
            msg.reference = {
                channelId: sentMsg.channelId,
                guildId: sentMsg.guildId || undefined,
                messageId: sentMsg.id,
                type: MessageReferenceType.Default,
            };
            return Effect.void;
        }),
        Effect.map(({ sentMsg }) => sentMsg),
    );

// ======================================================

const getDeletedMsgString = (
    msg: Message<boolean> | PartialMessage,
): string => {
    const channelName = getChannelNameByMsg(msg);
    const userName = getUserNameByMsg(msg);
    const timeString = bold(
        `[Deleted：${format(new Date(), "yyyy/MM/dd HH:mm")}]`,
    );

    return pipe(
        [
            `${userName} ${bold("Delete")}`,
            `${channelName} ${timeString}：`,
            String.isString(msg.content) ? msg.content : "",
            "------------------------------------",
        ],
        ReadonlyArray.join("\n"),
    );
};

export const recordDeleteMsg = (
    msg: Message<boolean> | PartialMessage,
): Effect.Effect<
    Message<boolean>,
    UnknownException | NoSuchElementException,
    ClientContext | EnvConfig
> =>
    pipe(
        getSendChannel(),
        Effect.flatMap((sendChannel) =>
            Effect.tryPromise(
                () =>
                    sendChannel.send({
                        content: getDeletedMsgString(msg),
                        allowedMentions: { parse: [] },
                    }) as Promise<Message<boolean>>,
            ),
        ),
    );

// ======================================================

const getUpdatedMsgString = (
    oldMsg: Message<boolean> | PartialMessage,
    msg: Message<boolean> | PartialMessage,
): string => {
    const channelName = getChannelNameByMsg(msg);
    const userName = getUserNameByMsg(msg);
    const timeString = bold(
        `[Edited：${format(msg.editedAt || new Date(), "yyyy/MM/dd HH:mm")}]`,
    );

    return pipe(
        [
            `${userName} ${bold("Edit")}`,
            `${channelName} ${timeString}：`,
            strikethrough(oldMsg.content || ""),
            "",
            String.isString(msg.content) ? msg.content : "",
            "------------------------------------",
        ],
        ReadonlyArray.join("\n"),
    );
};

export const recordUpdateMsg = (
    oldMsg: Message<boolean> | PartialMessage,
    msg: Message<boolean> | PartialMessage,
): Effect.Effect<
    Message<boolean>,
    UnknownException | NoSuchElementException,
    EnvConfig | ClientContext
> =>
    pipe(
        getSendChannel(),
        Effect.flatMap((sendChannel) =>
            Effect.tryPromise(
                () =>
                    sendChannel.send({
                        content: getUpdatedMsgString(oldMsg, msg),
                        allowedMentions: { parse: [] },
                        reply: {
                            messageReference: oldMsg.reference?.messageId || "",
                        },
                    }) as Promise<Message<boolean>>,
            ),
        ),
    );
