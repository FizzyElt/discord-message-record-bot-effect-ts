import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const stickiesTable = sqliteTable("stickies", {
  id: integer("id").primaryKey(),
  name: text("name").unique().notNull(),
  createdAt: text("created_at").default(sql`(CURRENT_DATE)`).notNull(),
  imageUrl: text("image_url").notNull(),
  group: text("group").notNull(),
});
