import type {
    CommandInteraction,
    GuildMember,
    RoleResolvable,
} from "discord.js";
import { Effect, pipe } from "effect";
import { findUserFromMembers } from "~/utils/member";

const addRoleToMember = (roleId: string) => (member: GuildMember) =>
    Effect.tryPromise(() => member.roles.add(roleId));

const removeRoleFromMember =
    (roleId: RoleResolvable) => (member: GuildMember) =>
        Effect.tryPromise(() => member.roles.remove(roleId));

export const subscribe =
    (roleId: string) => (interaction: CommandInteraction) => {
        const userId = interaction.user.id;

        return pipe(
            Effect.fromNullable(interaction.guild),
            Effect.tap((guild) =>
                pipe(
                    guild.members,
                    findUserFromMembers(userId),
                    Effect.flatMap(addRoleToMember(roleId))
                )
            ),
            Effect.flatMap((guild) =>
                Effect.tryPromise(() => guild.roles.fetch(roleId))
            ),
            Effect.flatMap((roleInfo) =>
                Effect.tryPromise(() =>
                    interaction.reply({
                        content: `您已成為 **${roleInfo?.name || roleInfo?.id || ""}** 的一員`,
                        withResponse: true,
                    })
                )
            )
        );
    };

export const unsubscribe =
    (roleId: string) => (interaction: CommandInteraction) => {
        const userId = interaction.user.id;

        return pipe(
            Effect.fromNullable(interaction.guild),
            Effect.tap((guild) =>
                pipe(
                    guild.members,
                    findUserFromMembers(userId),
                    Effect.flatMap(removeRoleFromMember(roleId))
                )
            ),
            Effect.flatMap((guild) =>
                Effect.tryPromise(() => guild.roles.fetch(roleId))
            ),
            Effect.flatMap((roleInfo) =>
                Effect.tryPromise(() =>
                    interaction.reply({
                        content: `您已退出 **${roleInfo?.name || roleInfo?.id || ""}**`,
                        withResponse: true,
                    })
                )
            )
        );
    };
