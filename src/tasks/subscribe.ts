import {
  CommandInteraction,
  GuildMember,
  GuildMemberManager,
  MessageMentions,
  RoleResolvable,
} from 'discord.js';
import { Effect, pipe } from 'effect';

const addRoleToMember = (roleId: string) => (member: GuildMember) =>
  Effect.tryPromise(() => member.roles.add(roleId));

const removeRoleFromMember = (roleId: RoleResolvable) => (member: GuildMember) =>
  Effect.tryPromise(() => member.roles.remove(roleId));

const findUserByMembers = (idOrMention: string) => (members: GuildMemberManager) => {
  if (MessageMentions.UsersPattern.test(idOrMention)) {
    return pipe(MessageMentions.UsersPattern.exec(idOrMention)?.at(1) || '', (id) =>
      Effect.tryPromise(() => members.fetch(id))
    );
  }

  return Effect.tryPromise(() => members.fetch(idOrMention));
};

export const subscribe = (roleId: string) => (interaction: CommandInteraction) => {
  const userId = interaction.user.id;

  return pipe(
    Effect.fromNullable(interaction.guild),
    Effect.tap((guild) =>
      pipe(guild.members, findUserByMembers(userId), Effect.flatMap(addRoleToMember(roleId)))
    ),
    Effect.flatMap((guild) => Effect.tryPromise(() => guild.roles.fetch(roleId))),
    Effect.flatMap((roleInfo) =>
      Effect.tryPromise(() =>
        interaction.reply({
          content: `您已成為 **${roleInfo?.name || roleInfo?.id || ''}** 的一員`,
          fetchReply: true,
        })
      )
    )
  );
};

export const unsubscribe = (roleId: string) => (interaction: CommandInteraction) => {
  const userId = interaction.user.id;

  return pipe(
    Effect.fromNullable(interaction.guild),
    Effect.tap((guild) =>
      pipe(guild.members, findUserByMembers(userId), Effect.flatMap(removeRoleFromMember(roleId)))
    ),
    Effect.flatMap((guild) => Effect.tryPromise(() => guild.roles.fetch(roleId))),
    Effect.flatMap((roleInfo) =>
      Effect.tryPromise(() =>
        interaction.reply({
          content: `您已退出 **${roleInfo?.name || roleInfo?.id || ''}**`,
          fetchReply: true,
        })
      )
    )
  );
};
