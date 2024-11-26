import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const stickiesTable = sqliteTable("stickies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: integer({ mode: "timestamp" })
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  name: text().notNull(),
  imageUrl: text().notNull(),
  group: text().notNull(),
});
