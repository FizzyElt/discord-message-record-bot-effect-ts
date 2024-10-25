import { Effect, pipe } from "effect";
import { Database, DatabaseError } from "~/services/database";
import { stickiesTable } from "~/db/schema";
import { eq } from "drizzle-orm";

export type Sticky = typeof stickiesTable.$inferSelect;

export const queryStickies = () =>
  pipe(
    Database,
    Effect.flatMap((db) =>
      Effect.tryPromise({
        try: () => db.select().from(stickiesTable),
        catch: (err) => new DatabaseError({ message: err }),
      }),
    ),
  );

export const insertSticky = (name: string, imageUrl: string, group: string) =>
  pipe(
    Database,
    Effect.flatMap((db) =>
      Effect.tryPromise({
        try: () => db.insert(stickiesTable).values({ name, imageUrl, group }),
        catch: (err) => new DatabaseError({ message: err }),
      }),
    ),
    Effect.flatMap(() => Effect.void),
  );

export const deleteSticky = (name: string) =>
  pipe(
    Database,
    Effect.flatMap((db) =>
      Effect.tryPromise({
        try: () => db.delete(stickiesTable).where(eq(stickiesTable.name, name)),
        catch: (err) => new DatabaseError({ message: err }),
      }),
    ),
    Effect.flatMap(() => Effect.void),
  );
