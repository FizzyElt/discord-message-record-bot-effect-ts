import { format } from "date-fns";
import {
    type Message,
    MessageReferenceType,
    type PartialMessage,
} from "discord.js";
import { Effect, pipe, Array as ReadonlyArray, String } from "effect";
import { ClientContext, EnvConfig } from "~/services";
import {
    getTextChannelByClient,
    isPublicThreadChannel,
    isTextChannel,
} from "~/utils/channel";
import { bold, strikeThrough } from "~/utils/mark_string";

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

export const recordCreatedMsg = (msg: Message<boolean>) =>
    pipe(
        Effect.Do,
        Effect.bind("sendChannel", getSendChannel),
        Effect.bind("sentMsg", ({ sendChannel }) =>
            Effect.tryPromise(() =>
                sendChannel.send({
                    content: getCreatedMsgString(msg),
                    allowedMentions: { parse: [] },
                }),
            ),
        ),
        Effect.tap(({ sentMsg }) => {
            msg.reference = {
                channelId: sentMsg.channelId,
                guildId: sentMsg.guildId,
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

export const recordDeleteMsg = (msg: Message<boolean> | PartialMessage) =>
    pipe(
        getSendChannel(),
        Effect.flatMap((sendChannel) =>
            Effect.tryPromise(() =>
                sendChannel.send({
                    content: getDeletedMsgString(msg),
                    allowedMentions: { parse: [] },
                }),
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
            strikeThrough(oldMsg.content || ""),
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
) =>
    pipe(
        getSendChannel(),
        Effect.flatMap((sendChannel) =>
            Effect.tryPromise(() =>
                sendChannel.send({
                    content: getUpdatedMsgString(oldMsg, msg),
                    allowedMentions: { parse: [] },
                    reply: {
                        messageReference: oldMsg.reference?.messageId || "",
                    },
                }),
            ),
        ),
    );
