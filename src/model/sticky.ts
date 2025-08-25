import { countDistinct, eq } from "drizzle-orm";
import { Array, Effect, Function, Option, pipe, Struct } from "effect";
import { stickiesTable } from "~/db/schema";
import { Database, DatabaseError } from "~/services/database";

export type Sticky = typeof stickiesTable.$inferSelect;

export const stickyCountByGroup = (group: string) =>
    pipe(
        Database,
        Effect.flatMap((db) =>
            Effect.tryPromise({
                try: () =>
                    db.$count(stickiesTable, eq(stickiesTable.group, group)),
                catch: (err) => new DatabaseError({ message: err }),
            })
        )
    );

export const groupCount = () =>
    pipe(
        Database,
        Effect.flatMap((db) =>
            Effect.tryPromise({
                try: () =>
                    db
                        .select({ count: countDistinct(stickiesTable.group) })
                        .from(stickiesTable),
                catch: (err) => new DatabaseError({ message: err }),
            })
        ),
        Effect.map((content) =>
            pipe(
                content,
                Array.head,
                Option.map(Struct.get("count")),
                Option.getOrElse(Function.constant(0))
            )
        )
    );

export const queryStickies = () =>
    pipe(
        Database,
        Effect.flatMap((db) =>
            Effect.tryPromise({
                try: () => db.query.stickiesTable.findMany(),
                catch: (err) => new DatabaseError({ message: err }),
            })
        )
    );

export const insertSticky = (name: string, imageUrl: string, group: string) =>
    pipe(
        Database,
        Effect.flatMap((db) =>
            Effect.tryPromise({
                try: () =>
                    db.insert(stickiesTable).values({ name, imageUrl, group }),
                catch: (err) => new DatabaseError({ message: err }),
            })
        ),
        Effect.flatMap(() => Effect.void)
    );

export const deleteSticky = (name: string) =>
    pipe(
        Database,
        Effect.flatMap((db) =>
            Effect.tryPromise({
                try: () =>
                    db
                        .delete(stickiesTable)
                        .where(eq(stickiesTable.name, name)),
                catch: (err) => new DatabaseError({ message: err }),
            })
        ),
        Effect.flatMap(() => Effect.void)
    );
