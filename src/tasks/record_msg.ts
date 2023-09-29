import { Message, Client, PartialMessage, GuildTextBasedChannel } from 'discord.js';
import { pipe, Effect } from 'effect';
import { EnvVariables } from '@services/env';
import { getTextChannelByClient } from '@utils/channel';
import { format } from 'date-fns';

const getRecordMsgString =
  (type: 'edit' | 'create' | 'delete') =>
  (msg: Message<boolean> | PartialMessage): string => {
    const channelName = msg.channel.isTextBased()
      ? (msg.channel as GuildTextBasedChannel)
      : 'Other';

    const userName = msg.author?.username || '';
    const typeString = {
      edit: '**Edit**',
      delete: '**Delete**',
      create: '',
    };

    return [
      `${channelName} **[Created：${format(msg.createdAt, 'yyyy/MM/dd HH:mm')}]** ${userName} ${
        typeString[type]
      }：`,
      msg.content,
      '------------------------------------',
    ].join('\n');
  };

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
