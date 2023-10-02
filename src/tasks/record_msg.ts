import { Message, Client, PartialMessage } from 'discord.js';
import { pipe, Effect, Equal } from 'effect';
import { EnvVariables } from '@services/env';
import { getTextChannelByClient, isTextChannel, isPublicThreadChannel } from '@utils/channel';
import { format } from 'date-fns';

const getRecordMsgString = (type: 'edit' | 'create' | 'delete') => {
  const typeString = Equal.equals(type, 'edit')
    ? '**Edit**'
    : Equal.equals(type, 'delete')
    ? '**Delete**'
    : '';

  return (msg: Message<boolean> | PartialMessage): string => {
    const channelName =
      isTextChannel(msg.channel) || isPublicThreadChannel(msg.channel) ? msg.channel.name : 'Other';

    const userName = msg.author?.username || '';

    return [
      `${channelName} **[Created：${format(
        msg.createdAt,
        'yyyy/MM/dd HH:mm'
      )}]** ${userName} ${typeString}：`,
      msg.content,
      '------------------------------------',
    ].join('\n');
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
        return Effect.unit;
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
