import {
  getTextChannelByClient,
  isPublicThreadChannel,
  isTextChannel,
} from "@utils/channel";
import { bold, strikeThrough } from "@utils/mark_string";
import { format } from "date-fns";
import { Effect, Array as ReadonlyArray, String, pipe } from "effect";

import type { EnvVariables } from "@services/env";
import type { Client, Message, PartialMessage } from "discord.js";

const getChannelNameByMsg = (msg: Message<boolean> | PartialMessage) =>
  isTextChannel(msg.channel) || isPublicThreadChannel(msg.channel)
    ? msg.channel.name
    : "Other";

const getUserNameByMsg = (msg: Message<boolean> | PartialMessage) =>
  msg.member?.displayName
    ? `${bold(msg.member.displayName)} (${msg.author?.username || ""})`
    : bold(msg.author?.username || "");

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

export const recordCreatedMsg =
  (env: EnvVariables) => (client: Client<true>) => (msg: Message<boolean>) => {
    return pipe(
      Effect.Do,
      Effect.bind("sendChannel", () =>
        getTextChannelByClient(env.bot_sending_channel_id)(client),
      ),
      Effect.let("sendString", () => getCreatedMsgString(msg)),
      Effect.bind("sentMsg", ({ sendChannel, sendString }) =>
        Effect.tryPromise(() =>
          sendChannel.send({
            content: sendString,
            allowedMentions: { parse: [] },
          }),
        ),
      ),
      Effect.tap(({ sentMsg }) => {
        msg.reference = {
          channelId: sentMsg.channelId,
          guildId: sentMsg.guildId,
          messageId: sentMsg.id,
        };
        return Effect.void;
      }),
      Effect.map(({ sentMsg }) => sentMsg),
    );
  };

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

export const recordDeleteMsg =
  (env: EnvVariables) =>
  (client: Client<true>) =>
  (msg: Message<boolean> | PartialMessage) => {
    return pipe(
      Effect.Do,
      Effect.bind("sendChannel", () =>
        getTextChannelByClient(env.bot_sending_channel_id)(client),
      ),
      Effect.let("sendString", () => getDeletedMsgString(msg)),
      Effect.flatMap(({ sendChannel, sendString }) =>
        Effect.tryPromise(() =>
          sendChannel.send({
            content: sendString,
            allowedMentions: { parse: [] },
          }),
        ),
      ),
    );
  };

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

export const recordUpdateMsg =
  (env: EnvVariables) =>
  (client: Client<true>) =>
  (
    oldMsg: Message<boolean> | PartialMessage,
    msg: Message<boolean> | PartialMessage,
  ) => {
    return pipe(
      Effect.Do,
      Effect.bind("sendChannel", () =>
        getTextChannelByClient(env.bot_sending_channel_id)(client),
      ),
      Effect.let("sendString", () => getUpdatedMsgString(oldMsg, msg)),
      Effect.flatMap(({ sendChannel, sendString }) =>
        Effect.tryPromise(() =>
          sendChannel.send({
            content: sendString,
            allowedMentions: { parse: [] },
            reply: {
              messageReference: oldMsg.reference?.messageId || "",
            },
          }),
        ),
      ),
    );
  };
