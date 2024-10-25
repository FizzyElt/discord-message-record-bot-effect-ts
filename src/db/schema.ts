import { pgTable, integer, varchar, date } from "drizzle-orm/pg-core";

export const stickiesTable = pgTable("stickies", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  createdAt: date("created_at").notNull().defaultNow(),
  name: varchar("name").unique().notNull(),
  imageUrl: varchar("image_url").notNull(),
  group: varchar("group").notNull(),
});
