import { pgTable, text, uuid, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const promptTemplatesTable = pgTable("prompt_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  category: text("category").notNull(), // 'academic' | 'career'
  promptText: text("prompt_text").notNull(),
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPromptTemplateSchema = createInsertSchema(promptTemplatesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertPromptTemplate = z.infer<typeof insertPromptTemplateSchema>;
export type PromptTemplate = typeof promptTemplatesTable.$inferSelect;
