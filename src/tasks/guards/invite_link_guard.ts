import type { Message, PartialMessage } from "discord.js";
import { Effect, String } from "effect";

const discordInviteRegex = /discord\.gg\/(\w|\d)+/;

const isDiscordInviteLink = (msgString: string) =>
    discordInviteRegex.test(msgString);

export const inviteLinkGuard = (msg: Message<boolean> | PartialMessage) => {
    if (
        String.isString(msg.content) &&
        isDiscordInviteLink(msg.content) &&
        msg.deletable
    ) {
        return Effect.tryPromise({
            try: () => msg.delete(),
            catch: () => "msg delete error",
        });
    }

    return Effect.succeed(msg);
};
