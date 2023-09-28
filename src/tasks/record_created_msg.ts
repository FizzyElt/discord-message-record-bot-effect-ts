import { Message, Client, PartialMessage, GuildTextBasedChannel } from 'discord.js';
import { pipe, Effect } from 'effect';
import { EnvVariables } from '@services/env';
import { getChannelByClient } from '@utils/channel';
import { format } from 'date-fns';

const getCreatedMsgString = (msg: Message<boolean> | PartialMessage) => {
  const channelName = msg.channel.isTextBased() ? (msg.channel as GuildTextBasedChannel) : 'Other';

  const userName = msg.author?.username || '';
  const discriminator = msg.author?.discriminator || '';

  return `${channelName} **[Created：${format(
    msg.createdAt,
    'yyyy/MM/dd HH:mm'
  )}]** ${userName}(#${discriminator})：\n${msg.content}\n------------------------------------`;
};

export const recordCreatedMsg =
  (env: EnvVariables) => (client: Client<true>) => (msg: Message<boolean>) => {
    return pipe(
      Effect.Do,
      Effect.bind('sendChannel', () => getChannelByClient(env.bot_sending_channel_id)(client)),
      Effect.filterOrDieMessage(
        ({ sendChannel }) => sendChannel.isTextBased(),
        'sendChannel is not text based'
      ),
      Effect.let('sendString', () => getCreatedMsgString(msg)),
      Effect.bind('sentMsg', ({ sendChannel, sendString }) =>
        Effect.tryPromise(() =>
          (sendChannel as GuildTextBasedChannel).send({
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
