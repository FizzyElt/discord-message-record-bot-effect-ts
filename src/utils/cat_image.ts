import { getEnvService } from "@services/env";
import { Effect, Option, pipe } from "effect";

export const fetchCatImage = () =>
  pipe(
    getEnvService,
    Effect.flatMap(({ cat_api_key }) =>
      Effect.tryPromise(() =>
        fetch(
          new Request("https://api.thecatapi.com/v1/images/search", {
            headers: {
              "x-api-key": cat_api_key,
            },
          }),
        ).then((res) => res.json()),
      ),
    ),
    Effect.flatMap((data) =>
      Option.fromNullable(data?.at(0)?.url as string | undefined),
    ),
    Effect.orElse(() => Effect.succeed("貓貓躲起來了，請重新引誘")),
  );
