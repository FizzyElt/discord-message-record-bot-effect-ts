import { type BunSQLiteDatabase, drizzle } from "drizzle-orm/bun-sqlite";

import { Database as BunDatabase } from "bun:sqlite";
import { Context, Data, Effect, Layer } from "effect";
import * as schema from "~/db/schema";
import { EnvConfig } from "./env";

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
  message: unknown;
}> {}

export class Database extends Context.Tag("Database")<
  Database,
  BunSQLiteDatabase<typeof schema> & {
    $client: BunDatabase;
  }
>() {}

const make = () =>
  Effect.gen(function* () {
    const env = yield* EnvConfig;

    const client = new BunDatabase(env.DATABASE_URL);
    return drizzle({ client, schema });
  });

export const DatabaseLive = Layer.effect(Database, make());
