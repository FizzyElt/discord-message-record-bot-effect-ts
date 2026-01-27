import type { Message, PartialMessage } from "discord.js";
import { Boolean, Effect, Equal, pipe } from "effect";

import { ChannelService, ClientContext } from "~/services";

import { inviteLinkGuard } from "./invite_link_guard";

export const messageGuard = (msg: Message<boolean> | PartialMessage) =>
    Effect.gen(function* () {
        const client = yield* ClientContext;
        const { hasChannel } = yield* ChannelService;

        return yield* pipe(
            Effect.succeed(msg),
            Effect.tap(inviteLinkGuard),
            Effect.filterOrFail(
                (msg) => !msg.author?.bot,
                () => "Is bot message",
            ),
            Effect.filterOrFail(
                (msg) => !Equal.equals(msg.author?.id, client.user.id),
                () => "Is bot self",
            ),
            Effect.tap((msg) =>
                pipe(
                    hasChannel(msg.channel.id),
                    Effect.filterOrFail(
                        Boolean.not,
                        () => "channel is ignored",
                    ),
                ),
            ),
        );
    });
