import { pgTable, text, uuid, integer, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const pointsEventsTable = pgTable("points_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(), // 'entry_created' | 'growth_note_added'
  referenceId: uuid("reference_id").notNull(), // entry or growth note id
  points: integer("points").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PointsEvent = typeof pointsEventsTable.$inferSelect;
