import { pipe, Effect, Equal, Array as ReadonlyArray, String } from 'effect';
import { getTextChannelByClient, isTextChannel, isPublicThreadChannel } from '@utils/channel';
import { format } from 'date-fns';

import type { Message, Client, PartialMessage } from 'discord.js';
import type { EnvVariables } from '@services/env';

const createTimeStringByType = (type: 'edit' | 'create' | 'delete') => {
  if (Equal.equals(type, 'edit')) {
    return (msg: Message<boolean> | PartialMessage) =>
      `**[Edited：${format(msg.editedAt || new Date(), 'yyyy/MM/dd HH:mm')}]**`;
  }

  if (Equal.equals(type, 'delete')) {
    return (_msg: Message<boolean> | PartialMessage) =>
      `**[Deleted：${format(new Date(), 'yyyy/MM/dd HH:mm')}]**`;
  }

  return (msg: Message<boolean> | PartialMessage) =>
    `**[Created：${format(msg.createdAt, 'yyyy/MM/dd HH:mm')}]**`;
};

const getRecordMsgString = (type: 'edit' | 'create' | 'delete') => {
  const typeString = Equal.equals(type, 'edit')
    ? '**Edit**'
    : Equal.equals(type, 'delete')
    ? '**Delete**'
    : '';

  const createTimeString = createTimeStringByType(type);

  return (msg: Message<boolean> | PartialMessage): string => {
    const channelName =
      isTextChannel(msg.channel) || isPublicThreadChannel(msg.channel) ? msg.channel.name : 'Other';

    const userName = msg.member?.displayName
      ? `**${msg.member?.displayName}** (${msg.author?.username || ''})`
      : `**${msg.author?.username || ''}**`;

    const timeString = createTimeString(msg);

    return pipe(
      [
        `${userName} ${typeString}`,
        `${channelName} ${timeString}：`,
        String.isString(msg.content) ? msg.content : '',
        '------------------------------------',
      ],
      ReadonlyArray.join('\n')
    );
  };
};

// ======================================================

const getCreatedMsgString = getRecordMsgString('create');

export const recordCreatedMsg =
  (env: EnvVariables) => (client: Client<true>) => (msg: Message<boolean>) => {
    return pipe(
      Effect.Do,
      Effect.bind('sendChannel', () => getTextChannelByClient(env.bot_sending_channel_id)(client)),
      Effect.let('sendString', () => getCreatedMsgString(msg)),
      Effect.bind('sentMsg', ({ sendChannel, sendString }) =>
        Effect.tryPromise(() =>
          sendChannel.send({
            content: sendString,
            allowedMentions: { parse: [] },
          })
        )
      ),
      Effect.tap(({ sentMsg }) => {
        msg.reference = {
          channelId: sentMsg.channelId,
          guildId: sentMsg.guildId,
          messageId: sentMsg.id,
        };
        return Effect.void;
      }),
      Effect.map(({ sentMsg }) => sentMsg)
    );
  };

// ======================================================

const getDeletedMsgString = getRecordMsgString('delete');

export const recordDeleteMsg =
  (env: EnvVariables) => (client: Client<true>) => (msg: Message<boolean> | PartialMessage) => {
    return pipe(
      Effect.Do,
      Effect.bind('sendChannel', () => getTextChannelByClient(env.bot_sending_channel_id)(client)),
      Effect.let('sendString', () => getDeletedMsgString(msg)),
      Effect.flatMap(({ sendChannel, sendString }) =>
        Effect.tryPromise(() =>
          sendChannel.send({
            content: sendString,
            allowedMentions: { parse: [] },
          })
        )
      )
    );
  };

// ======================================================

const getUpdatedMsgString = getRecordMsgString('edit');

export const recordUpdateMsg =
  (env: EnvVariables) =>
  (client: Client<true>) =>
  (oldMsg: Message<boolean> | PartialMessage, msg: Message<boolean> | PartialMessage) => {
    return pipe(
      Effect.Do,
      Effect.bind('sendChannel', () => getTextChannelByClient(env.bot_sending_channel_id)(client)),
      Effect.let('sendString', () => getUpdatedMsgString(msg)),
      Effect.flatMap(({ sendChannel, sendString }) =>
        Effect.tryPromise(() =>
          sendChannel.send({
            content: sendString,
            allowedMentions: { parse: [] },
            reply: {
              messageReference: oldMsg.reference?.messageId || '',
            },
          })
        )
      )
    );
  };
