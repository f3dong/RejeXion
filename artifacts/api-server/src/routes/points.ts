import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, pointsEventsTable, entriesTable, growthNotesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/points", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  const allEvents = await db
    .select()
    .from(pointsEventsTable)
    .where(eq(pointsEventsTable.userId, userId));

  const entryEvents = allEvents.filter((e) => e.eventType === "entry_created");
  const growthNoteEvents = allEvents.filter((e) => e.eventType === "growth_note_added");

  const entryPoints = entryEvents.reduce((sum, e) => sum + e.points, 0);
  const growthNotePoints = growthNoteEvents.reduce((sum, e) => sum + e.points, 0);

  res.json({
    totalPoints: entryPoints + growthNotePoints,
    entryPoints,
    growthNotePoints,
    entryCount: entryEvents.length,
    growthNoteCount: growthNoteEvents.length,
  });
});

export default router;
