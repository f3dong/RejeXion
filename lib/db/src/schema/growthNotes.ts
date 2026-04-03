import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { entriesTable } from "./entries";

export const growthNotesTable = pgTable("growth_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  entryId: uuid("entry_id").notNull().references(() => entriesTable.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGrowthNoteSchema = createInsertSchema(growthNotesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertGrowthNote = z.infer<typeof insertGrowthNoteSchema>;
export type GrowthNote = typeof growthNotesTable.$inferSelect;
