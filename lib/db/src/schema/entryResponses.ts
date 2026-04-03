import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { entriesTable } from "./entries";
import { promptTemplatesTable } from "./promptTemplates";

export const entryResponsesTable = pgTable("entry_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  entryId: uuid("entry_id").notNull().references(() => entriesTable.id, { onDelete: "cascade" }),
  promptId: uuid("prompt_id").notNull().references(() => promptTemplatesTable.id),
  responseText: text("response_text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertEntryResponseSchema = createInsertSchema(entryResponsesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertEntryResponse = z.infer<typeof insertEntryResponseSchema>;
export type EntryResponse = typeof entryResponsesTable.$inferSelect;
