import { Effect, pipe } from "effect";

import { EnvConfig } from "~/services/env";

export const fetchCatImage = () =>
    pipe(
        Effect.service(EnvConfig),
        Effect.flatMap(({ CAT_API_KEY }) =>
            Effect.tryPromise(() =>
                fetch(
                    new Request("https://api.thecatapi.com/v1/images/search", {
                        headers: {
                            "x-api-key": CAT_API_KEY,
                        },
                    }),
                ).then((res) => res.json()),
            ),
        ),
        Effect.flatMap((data) =>
            Effect.fromNullishOr(data?.at(0)?.url as string | undefined),
        ),
        Effect.orElseSucceed(() => "貓貓躲起來了，請重新引誘"),
    );
