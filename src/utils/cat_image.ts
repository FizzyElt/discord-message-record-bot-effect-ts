import { Effect, Option, pipe } from "effect";
import { EnvConfig } from "~/services/env";

export const fetchCatImage = () =>
    pipe(
        EnvConfig,
        Effect.flatMap(({ CAT_API_KEY }) =>
            Effect.tryPromise(() =>
                fetch(
                    new Request("https://api.thecatapi.com/v1/images/search", {
                        headers: {
                            "x-api-key": CAT_API_KEY,
                        },
                    })
                ).then((res) => res.json())
            )
        ),
        Effect.flatMap((data) =>
            Option.fromNullable(data?.at(0)?.url as string | undefined)
        ),
        Effect.orElse(() => Effect.succeed("貓貓躲起來了，請重新引誘"))
    );
