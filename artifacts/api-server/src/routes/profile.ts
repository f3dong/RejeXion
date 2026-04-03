import { Router, type IRouter } from "express";
import { eq, count } from "drizzle-orm";
import { db, usersTable, entriesTable, growthNotesTable, pointsEventsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/profile", requireAuth, async (req, res): Promise<void> => {
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
});

router.delete("/profile", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  await db.delete(usersTable).where(eq(usersTable.id, userId));

  req.session.destroy(() => {});
  res.sendStatus(204);
});

export default router;
