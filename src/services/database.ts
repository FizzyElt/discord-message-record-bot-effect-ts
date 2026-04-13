import { type Client, createClient } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { Context, Data, Effect, Layer } from "effect";

import * as schema from "~/db/schema";

import { EnvConfig } from "./env";

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
    message: unknown;
}> {}

export class Database extends Context.Service<
    Database,
    LibSQLDatabase<typeof schema> & {
        $client: Client;
    }
>()("Database") {}

const make = () =>
    Effect.gen(function* () {
        const env = yield* EnvConfig;
        const client = createClient({
            url: env.TURSO_DB_URL,
            authToken: env.TURSO_DB_TOKEN,
        });
        return drizzle({ client, schema });
    });

export const DatabaseLive = Layer.effect(Database, make());
