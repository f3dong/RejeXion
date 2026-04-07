import { Router, type IRouter } from "express";
import { eq, count, and, notExists } from "drizzle-orm";
import { db, usersTable, entriesTable, growthNotesTable, pointsEventsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/profile", requireAuth, async (req, res, next): Promise<void> => {
  try {
    const userId = req.session.userId!;

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const [entryCountResult] = await db
      .select({ count: count() })
      .from(entriesTable)
      .where(eq(entriesTable.userId, userId));

    const [growthNoteCountResult] = await db
      .select({ count: count() })
      .from(growthNotesTable)
      .innerJoin(entriesTable, eq(growthNotesTable.entryId, entriesTable.id))
      .where(eq(entriesTable.userId, userId));

    const pointsResult = await db
      .select({ total: sql<number>`COALESCE(SUM(${pointsEventsTable.points}), 0)` })
      .from(pointsEventsTable)
      .where(eq(pointsEventsTable.userId, userId));

    const totalPoints = Number(pointsResult[0]?.total ?? 0);

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      totalPoints,
      entryCount: Number(entryCountResult?.count ?? 0),
      growthNoteCount: Number(growthNoteCountResult?.count ?? 0),
      createdAt: user.createdAt,
    });
  } catch (err) {
    next(err);
  }
});

router.delete("/profile", requireAuth, async (req, res, next): Promise<void> => {
  try {
    const userId = req.session.userId!;

    await db.delete(usersTable).where(eq(usersTable.id, userId));

    req.session.destroy(() => {});
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

router.post("/profile/backfill-points", requireAuth, async (req, res, next): Promise<void> => {
  try {
    const userId = req.session.userId!;

    const entriesWithoutPoints = await db
      .select({ id: entriesTable.id })
      .from(entriesTable)
      .where(
        and(
          eq(entriesTable.userId, userId),
          notExists(
            db
              .select({ id: pointsEventsTable.id })
              .from(pointsEventsTable)
              .where(
                and(
                  eq(pointsEventsTable.referenceId, entriesTable.id),
                  eq(pointsEventsTable.eventType, "entry_created"),
                )
              )
          )
        )
      );

    const growthNotesWithoutPoints = await db
      .select({ id: growthNotesTable.id, entryId: growthNotesTable.entryId })
      .from(growthNotesTable)
      .innerJoin(entriesTable, eq(growthNotesTable.entryId, entriesTable.id))
      .where(
        and(
          eq(entriesTable.userId, userId),
          notExists(
            db
              .select({ id: pointsEventsTable.id })
              .from(pointsEventsTable)
              .where(
                and(
                  eq(pointsEventsTable.referenceId, growthNotesTable.id),
                  eq(pointsEventsTable.eventType, "growth_note_added"),
                )
              )
          )
        )
      );

    let backfilledEntries = 0;
    let backfilledGrowthNotes = 0;

    for (const entry of entriesWithoutPoints) {
      await db.insert(pointsEventsTable).values({
        userId,
        eventType: "entry_created",
        referenceId: entry.id,
        points: 5,
      });
      backfilledEntries++;
    }

    for (const note of growthNotesWithoutPoints) {
      await db.insert(pointsEventsTable).values({
        userId,
        eventType: "growth_note_added",
        referenceId: note.id,
        points: 2,
      });
      backfilledGrowthNotes++;
    }

    res.json({
      message: "Points backfilled successfully",
      backfilledEntries,
      backfilledGrowthNotes,
      pointsAdded: backfilledEntries * 5 + backfilledGrowthNotes * 2,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
