import type { GuildMember } from "discord.js";
import { formatInTimeZone } from "date-fns-tz";
import { formatDistanceToNow } from "date-fns";
import type { TimeoutInfo } from "@services/timeout";

export const canNotFindUser = (): string => "找不到使用者";

export const doNotBanAdmin = (): string => "你不可以 ban 管理員";

export const doNotBanBot = (): string => "你不可以 ban 我";

export const memberVoting = (member: GuildMember): string =>
  `**${
    member.nickname || member.user.username
  }** 正在審判中\n請等待審判結束後重新發起投票`;

export const memberDisableTime = (
  member: GuildMember & {
    communicationDisabledUntilTimestamp: number;
    readonly communicationDisabledUntil: Date;
  },
  timezone = "Asia/Taipei",
): string =>
  `**${
    member.nickname || member.user.username
  }** 還在服刑\n剩餘時間 ${formatDistanceToNow(
    member.communicationDisabledUntil,
  )}\n出獄時間 ${formatInTimeZone(
    member.communicationDisabledUntil,
    timezone || "Asia/Taipei",
    "yyyy-MM-dd HH:mm",
  )}`;

export const memberFree = (member: GuildMember, count: number): string =>
  `**${count}** 票，**${member.nickname || member.user.username}** 逃過一劫`;

export const memberTimeoutVotePassed = (
  member: GuildMember,
  timeoutInfo: TimeoutInfo,
  count: number,
): string =>
  `恭喜獲得 **${count} / ${timeoutInfo.voteThreshold}** 票 **${
    member.nickname || member.user.username
  }** 禁言 ${timeoutInfo.name}`;

export const startMemberVote = (
  member: GuildMember,
  timeoutInfo: TimeoutInfo,
  roleId?: string,
): string => {
  const baseMsg = `是否禁言 **${member.nickname || member.user.username} ** ${
    timeoutInfo.name
  }\n*${timeoutInfo.votingMinutes} 分鐘後累積 ${
    timeoutInfo.voteThreshold
  } 票者禁言*`;

  const mentionRole = roleId ? `請 <@&${roleId}> 投下神聖的一票` : "";

  return `${baseMsg}\n${mentionRole}`;
};
