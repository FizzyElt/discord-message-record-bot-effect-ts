import {
  type GuildMember,
  type GuildMemberManager,
  MessageMentions,
  PermissionFlagsBits,
} from "discord.js";
import { Effect, pipe } from "effect";

export const findUserFromMembers =
  (idOrMention: string) => (members: GuildMemberManager) => {
    if (MessageMentions.UsersPattern.test(idOrMention)) {
      return pipe(
        MessageMentions.UsersPattern.exec(idOrMention)?.at(1) || "",
        (id) => Effect.tryPromise(() => members.fetch(id)),
      );
    }

    return Effect.tryPromise(() => members.fetch(idOrMention));
  };

export const isAdmin = (member: GuildMember) =>
  member.permissions.has(PermissionFlagsBits.Administrator);
