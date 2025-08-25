import { Effect, pipe } from "effect";

const createEmojiRequest = (left: string, right: string) => {
    const searchParams = {
        key: process.env.EMOJI_KITCHEN_KEY || "",
        client_key: "emoji_kitchen_funbox",
        q: `${left}_${right}`,
        collection: "emoji_kitchen_v6",
        contentfilter: "high",
    };

    return new Request(
        `https://tenor.googleapis.com/v2/featured?${new URLSearchParams(
            searchParams
        ).toString()}`
    );
};

export const fetchEmoji = (left: string, right: string) =>
    pipe(
        Effect.tryPromise(() =>
            fetch(createEmojiRequest(left, right)).then((res) => res.json())
        ),
        Effect.map(
            (data) =>
                `${left} x ${right}\n${data?.results?.at(0)?.url || "找不到組合"}`
        )
    );
