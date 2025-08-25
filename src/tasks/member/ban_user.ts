import type {
    AwaitReactionsOptions,
    ChatInputCommandInteraction,
    CommandInteraction,
    EmojiIdentifierResolvable,
    GuildMember,
    InteractionCallbackResponse,
    Message,
} from "discord.js";
import { Effect, Equal, Option, pipe } from "effect";
import type { NoSuchElementException, UnknownException } from "effect/Cause";
import { ClientContext, EnvConfig } from "~/services";
import type { TimeoutInfo } from "~/services/timeout";
import { getTimeoutInfo, minute } from "~/services/timeout";
import {
    addNewVoting,
    isUserVoting,
    removeVoting,
    type VotingService,
} from "~/services/voting_store";
import { getCommandOptionString } from "~/utils/command";
import { findUserFromMembers, isAdmin } from "~/utils/member";
import {
    canNotFindUser,
    doNotBanAdmin,
    doNotBanBot,
    memberDisableTime,
    memberFree,
    memberTimeoutVotePassed,
    memberVoting,
    startMemberVote,
} from "~/utils/reply_msg";
import { createVoting } from "~/utils/vote_flow";

const reactMsg =
    (emoji: EmojiIdentifierResolvable) => (msg: InteractionCallbackResponse) =>
        Effect.tryPromise(async () => msg.resource?.message?.react(emoji));

const awaitReactions =
    (options?: AwaitReactionsOptions) => (msg: Message<boolean>) =>
        Effect.tryPromise(() => msg.awaitReactions(options));

const timeoutMember = ({
    count,
    timeoutInfo,
    msg,
    member,
}: {
    count: number;
    timeoutInfo: TimeoutInfo;
    msg: Message<boolean> | undefined;
    member: GuildMember;
}) =>
    pipe(
        Effect.tryPromise(() => member.timeout(timeoutInfo.time * 1000)),
        Effect.flatMap(() =>
            Effect.tryPromise(async () =>
                msg?.reply(memberTimeoutVotePassed(member, timeoutInfo, count)),
            ),
        ),
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
                allowedMentions: mentionRole
                    ? { roles: [mentionRole] }
                    : undefined,
                content: startMemberVote(member, timeoutInfo, mentionRole),
                withResponse: true,
            }),
        ),
        Effect.tap(reactMsg(emoji)),
        Effect.tap(() => addNewVoting(member.user.id)),
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
            filter: (reaction, user) =>
                Equal.equals(reaction.emoji.name, emoji) && !user.bot,
            time: timeoutInfo.votingMinutes * minute * 1000,
        }),
        Effect.map((collected) => {
            const count = (collected.get(emoji as string)?.count ?? 1) - 1;

            return {
                isPass: count >= timeoutInfo.voteThreshold,
                count,
            };
        }),
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
        Effect.flatMap((replyMsg) =>
            Option.fromNullable(replyMsg.resource?.message),
        ),
        // collect and react result
        Effect.tap((replyMsg) => {
            const { member, timeoutInfo, emoji } = params;
            return pipe(
                collectVote({
                    msg: replyMsg,
                    emoji: emoji,
                    timeoutInfo: timeoutInfo,
                }),
                Effect.flatMap(({ isPass, count }) => {
                    if (member.isCommunicationDisabled()) {
                        return Effect.tryPromise(() =>
                            replyMsg.reply({
                                content: memberDisableTime(member),
                            }),
                        );
                    }

                    if (isPass) {
                        return timeoutMember({
                            count,
                            msg: replyMsg,
                            timeoutInfo,
                            member,
                        });
                    }

                    return Effect.tryPromise(() =>
                        replyMsg.reply(memberFree(member, count)),
                    );
                }),
            );
        }),
        Effect.tap(() => removeVoting(params.member.user.id)),
    );

// new ban user function
const _banUserVote = (params: {
    member: GuildMember;
    interaction: CommandInteraction;
    timeoutInfo: TimeoutInfo;
    mentionRole?: string;
    emoji: EmojiIdentifierResolvable;
}) => {
    const { member, interaction, timeoutInfo, mentionRole, emoji } = params;

    const startContent = {
        allowedMentions: mentionRole ? { roles: [mentionRole] } : undefined,
        content: startMemberVote(member, timeoutInfo, mentionRole),
    };

    const options = {
        emoji,
        time: timeoutInfo.votingMinutes,
    };

    const resultFlow = (count: number, msg: InteractionCallbackResponse) => {
        if (member.isCommunicationDisabled()) {
            return Effect.tryPromise(async () =>
                msg?.resource?.message?.reply({
                    content: memberDisableTime(member),
                }),
            );
        }

        if (count >= timeoutInfo.voteThreshold) {
            return timeoutMember({
                count,
                msg: msg?.resource?.message || undefined,
                timeoutInfo,
                member,
            });
        }

        return Effect.tryPromise(async () =>
            msg?.resource?.message?.reply(memberFree(member, count)),
        );
    };

    return pipe(
        createVoting(interaction, startContent, options, {
            started: () => addNewVoting(member.user.id),
            result: resultFlow,
        }),
        Effect.tap(() => removeVoting(params.member.user.id)),
    );
};

export const banUser = (interaction: ChatInputCommandInteraction) =>
    Effect.gen(function* () {
        const timeoutInfo = yield* getTimeoutInfo(
            getCommandOptionString("time")(interaction),
        );
        const client = yield* ClientContext;
        const env = yield* EnvConfig;

        const userId = getCommandOptionString("mention_user")(interaction);
        const member = yield* pipe(
            Effect.fromNullable(interaction.guild),
            Effect.flatMap((guild) =>
                findUserFromMembers(userId)(guild.members),
            ),
        );

        const userVoting = yield* isUserVoting(member.id);

        return {
            userVoting,
            timeoutInfo,
            member,
            env,
            client,
        };
    }).pipe(
        Effect.matchEffect({
            onFailure: () =>
                Effect.tryPromise(() =>
                    interaction.reply({
                        content: canNotFindUser(),
                        withResponse: true,
                    }),
                ),
            onSuccess: ({
                member,
                timeoutInfo,
                userVoting,
                client,
                env,
            }): Effect.Effect<
                InteractionCallbackResponse | Message<boolean>,
                UnknownException | NoSuchElementException,
                VotingService
            > => {
                if (isAdmin(member)) {
                    return Effect.tryPromise(() =>
                        interaction.reply({
                            content: doNotBanAdmin(),
                            withResponse: true,
                        }),
                    );
                }

                // bot self
                if (Equal.equals(member.user.id, client.user.id)) {
                    return Effect.tryPromise(() =>
                        interaction.reply({
                            content: doNotBanBot(),
                            withResponse: true,
                        }),
                    );
                }

                // member disabled
                if (member.isCommunicationDisabled()) {
                    return Effect.tryPromise(() =>
                        interaction.reply({
                            content: memberDisableTime(member, env.TIMEZONE),
                            withResponse: true,
                        }),
                    );
                }

                // member voting
                if (userVoting) {
                    return Effect.tryPromise(() =>
                        interaction.reply({
                            content: memberVoting(member),
                            withResponse: true,
                        }),
                    );
                }

                return votingFlow({
                    member,
                    interaction,
                    timeoutInfo,
                    mentionRole: env.VOTE_ROLE_ID,
                    emoji: "✅",
                });
            },
        }),
    );
