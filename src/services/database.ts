import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Context, Data, Effect, Layer } from "effect";
import postgres from "postgres";
import * as schema from "~/db/schema";
import { EnvConfig } from "./env";

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
  message: unknown;
}> {}

export class Database extends Context.Tag("Database")<
  Database,
  PostgresJsDatabase<typeof schema> & {
    // biome-ignore lint/complexity/noBannedTypes: need empty object
    $client: postgres.Sql<{}>;
  }
>() {}

const make = () =>
  Effect.gen(function* () {
    const env = yield* EnvConfig;
    const client = postgres(env.SUPABASE_URL_ADMIN, { prepare: false });
    return drizzle({ client, schema });
  });

export const DatabaseLive = Layer.effect(Database, make());
