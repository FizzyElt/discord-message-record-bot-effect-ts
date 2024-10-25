import { Database, DatabaseLive } from "~/services/database";
import { EnvLive } from "~/services/env";

import { Effect, Layer, pipe } from "effect";
import { stickiesTable } from "~/db/schema";
import { groupCount, stickyCountByGroup } from "~/model/sticky";

const program = Effect.gen(function* () {
  const content = yield* groupCount();

  console.log(content);
}).pipe(Effect.provide(Layer.provideMerge(DatabaseLive, EnvLive)));

Effect.runPromise(program);
