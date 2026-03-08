import {
    type GuildMember,
    type GuildMemberManager,
    MessageMentions,
    PermissionFlagsBits,
} from "discord.js";
import { Effect, pipe } from "effect";
import { UnknownException } from "effect/Cause";

export const findUserFromMembers =
    (idOrMention: string) =>
    (
        members: GuildMemberManager,
    ): Effect.Effect<GuildMember, UnknownException, never> => {
        if (MessageMentions.UsersPattern.test(idOrMention)) {
            return pipe(
                MessageMentions.UsersPattern.exec(idOrMention)?.at(1) || "",
                (id) => Effect.tryPromise(() => members.fetch(id)),
            );
        }

        return Effect.tryPromise(() => members.fetch(idOrMention));
    };

export const isAdmin = (member: GuildMember): boolean =>
    member.permissions.has(PermissionFlagsBits.Administrator);
