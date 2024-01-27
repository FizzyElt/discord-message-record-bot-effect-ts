import { isValidTwitterUrl, replaceTwitterUrl } from "@utils/url";

import { Message, Client, PartialMessage } from "discord.js";
import { pipe, Effect } from "effect";
import * as Option from "effect/Option";
import * as ReadonlyArray from "effect/ReadonlyArray";

export const twitterRewrite = (msg: Message<boolean>) => {
	return pipe(
		msg.embeds,
		ReadonlyArray.filterMap((embed) =>
			isValidTwitterUrl(embed.url || "")
				? Option.some(replaceTwitterUrl(embed.url || ""))
				: Option.none(),
		),
		ReadonlyArray.match({
			onEmpty: () => Effect.succeed(msg),
			onNonEmpty: (urls) =>
				pipe(urls, ReadonlyArray.join("\n"), (content) =>
					Effect.tryPromise({
						try: () => msg.reply(content),
						catch: () => msg,
					}),
				),
		}),
	);
};
