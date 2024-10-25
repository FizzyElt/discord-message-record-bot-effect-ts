import { type PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { Context, Data, Effect, Layer } from "effect";
import { EnvConfig } from "./env";

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
  message: unknown;
}> {}

export class Database extends Context.Tag("Database")<
  Database,
  PostgresJsDatabase<Record<string, never>> & {
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    $client: postgres.Sql<{}>;
  }
>() {}

const make = () =>
  Effect.gen(function* () {
    const env = yield* EnvConfig;
    const client = postgres(env.SUPABASE_URL_ADMIN, { prepare: false });

    return drizzle(client);
  });

export const DatabaseLive = Layer.effect(Database, make());
