import { pipe, Effect, Equal } from 'effect';
import {
  Client,
  CommandInteraction,
  EmojiIdentifierResolvable,
  GuildMember,
  Message,
  AwaitReactionsOptions,
} from 'discord.js';

import { getVotingStore, isUserVoting, addNewVoting, removeVoting } from '@services/voting_store';
import { TimeoutInfo, getTimeoutInfoByKey, minute } from '@services/timeout';
import { EnvVariables } from '@services/env';

import { getCommandOptionString } from '@utils/command';
import { findUserFromMembers, isAdmin } from '@utils/member';
import {
  canNotFindUser,
  doNotBanBot,
  doNotBanAdmin,
  memberDisableTime,
  memberVoting,
  startMemberVote,
  memberTimeoutVotePassed,
  memberFree,
} from '@utils/reply_msg';

const reactMsg = (emoji: EmojiIdentifierResolvable) => (msg: Message<boolean>) =>
  Effect.tryPromise(() => msg.react(emoji));

const awaitReactions = (options?: AwaitReactionsOptions) => (msg: Message<boolean>) =>
  Effect.tryPromise(() => msg.awaitReactions(options));

const timeoutMember = ({
  count,
  timeoutInfo,
  msg,
  member,
}: {
  count: number;
  timeoutInfo: TimeoutInfo;
  msg: Message<boolean>;
  member: GuildMember;
}) =>
  pipe(
    Effect.tryPromise(() => member.timeout(timeoutInfo.time * 1000)),
    Effect.flatMap(() =>
      Effect.tryPromise(() => msg.reply(memberTimeoutVotePassed(member, timeoutInfo, count)))
    )
  );

const startVoting = ({
  member,
  interaction,
  timeoutInfo,
  mentionRole,
  emoji,
}: {
  member: GuildMember;
  interaction: CommandInteraction;
  timeoutInfo: TimeoutInfo;
  mentionRole?: string;
  emoji: EmojiIdentifierResolvable;
}) =>
  pipe(
    Effect.tryPromise(() =>
      interaction.reply({
        allowedMentions: mentionRole ? { roles: [mentionRole] } : undefined,
        content: startMemberVote(member, timeoutInfo, mentionRole),
        fetchReply: true,
      })
    ),
    Effect.tap(reactMsg(emoji)),
    Effect.tap(() => addNewVoting(member.user.id))
  );

const collectVote = ({
  msg,
  emoji,
  timeoutInfo,
}: {
  msg: Message<boolean>;
  emoji: EmojiIdentifierResolvable;
  timeoutInfo: TimeoutInfo;
}) =>
  pipe(
    msg,
    awaitReactions({
      filter: (reaction, user) => Equal.equals(reaction.emoji.name === emoji) && !user.bot,
      time: timeoutInfo.votingMinutes * minute * 1000,
    }),
    Effect.map((collected) => {
      const count = (collected.get(emoji as string)?.count ?? 1) - 1;

      return {
        isPass: count >= timeoutInfo.voteThreshold,
        count,
      };
    })
  );

const votingFlow = (params: {
  member: GuildMember;
  interaction: CommandInteraction;
  timeoutInfo: TimeoutInfo;
  mentionRole?: string;
  emoji: EmojiIdentifierResolvable;
}) =>
  pipe(
    startVoting(params),
    // collect and react result
    Effect.tap((replyMsg) => {
      const { member, timeoutInfo, emoji } = params;
      return pipe(
        collectVote({ msg: replyMsg, emoji: emoji, timeoutInfo: timeoutInfo }),
        Effect.flatMap(({ isPass, count }) => {
          if (member.isCommunicationDisabled()) {
            return Effect.tryPromise(() => replyMsg.reply({ content: memberDisableTime(member) }));
          }

          if (isPass) {
            return timeoutMember({ count, msg: replyMsg, timeoutInfo, member });
          }

          return Effect.tryPromise(() => replyMsg.reply(memberFree(member, count)));
        })
      );
    }),
    Effect.tap(() => removeVoting(params.member.user.id))
  );

export const banUserFlow =
  (client: Client<true>, env: EnvVariables) => (interaction: CommandInteraction) =>
    pipe(
      Effect.succeed({ userId: getCommandOptionString('mention_user')(interaction) }),
      Effect.bind('timeoutInfo', () =>
        pipe(getCommandOptionString('time')(interaction), getTimeoutInfoByKey)
      ),
      Effect.bind('member', ({ userId }) =>
        pipe(
          Effect.fromNullable(interaction.guild),
          Effect.flatMap((guild) => findUserFromMembers(userId)(guild.members))
        )
      ),
      Effect.bind('votingStore', () => getVotingStore),
      Effect.matchEffect({
        onFailure: () =>
          Effect.tryPromise(() =>
            interaction.reply({ content: canNotFindUser(), fetchReply: true })
          ),
        onSuccess: ({ member, timeoutInfo, votingStore }) => {
          if (isAdmin(member)) {
            return Effect.tryPromise(() =>
              interaction.reply({ content: doNotBanAdmin(), fetchReply: true })
            );
          }

          // bot self
          if (Equal.equals(member.user.id, client.user.id)) {
            return Effect.tryPromise(() =>
              interaction.reply({ content: doNotBanBot(), fetchReply: true })
            );
          }

          // member disabled
          if (member.isCommunicationDisabled()) {
            return Effect.tryPromise(() =>
              interaction.reply({
                content: memberDisableTime(member, env.timezone),
                fetchReply: true,
              })
            );
          }

          // member voting
          if (isUserVoting(member.user.id)(votingStore)) {
            return Effect.tryPromise(() =>
              interaction.reply({ content: memberVoting(member), fetchReply: true })
            );
          }

          return votingFlow({
            member,
            interaction,
            timeoutInfo,
            mentionRole: env.vote_role_id,
            emoji: '✅',
          });
        },
      })
    );
