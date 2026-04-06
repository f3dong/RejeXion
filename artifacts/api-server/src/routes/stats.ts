import { Router, type IRouter } from "express";
import { eq, and, count, desc, sql } from "drizzle-orm";
import { db, entriesTable, growthNotesTable, pointsEventsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/stats", requireAuth, async (req, res, next): Promise<void> => {
  try {
    const userId = req.session.userId!;

    const [totalResult] = await db
      .select({ count: count() })
      .from(entriesTable)
      .where(eq(entriesTable.userId, userId));

    const [academicResult] = await db
      .select({ count: count() })
      .from(entriesTable)
      .where(and(eq(entriesTable.userId, userId), eq(entriesTable.category, "academic")));

    const [careerResult] = await db
      .select({ count: count() })
      .from(entriesTable)
      .where(and(eq(entriesTable.userId, userId), eq(entriesTable.category, "career")));

    const [growthNoteResult] = await db
      .select({ count: count() })
      .from(growthNotesTable)
      .innerJoin(entriesTable, eq(growthNotesTable.entryId, entriesTable.id))
      .where(eq(entriesTable.userId, userId));

    const pointsResult = await db
      .select({ total: sql<number>`COALESCE(SUM(${pointsEventsTable.points}), 0)` })
      .from(pointsEventsTable)
      .where(eq(pointsEventsTable.userId, userId));

    const recentEntriesRaw = await db
      .select({
        id: entriesTable.id,
        category: entriesTable.category,
        title: entriesTable.title,
        rejectionDate: entriesTable.rejectionDate,
        description: entriesTable.description,
        createdAt: entriesTable.createdAt,
        growthNoteCount: sql<number>`CAST(COUNT(${growthNotesTable.id}) AS INTEGER)`,
      })
      .from(entriesTable)
      .leftJoin(growthNotesTable, eq(growthNotesTable.entryId, entriesTable.id))
      .where(eq(entriesTable.userId, userId))
      .groupBy(entriesTable.id)
      .orderBy(desc(entriesTable.createdAt))
      .limit(5);

    res.json({
      totalEntries: Number(totalResult?.count ?? 0),
      academicEntries: Number(academicResult?.count ?? 0),
      careerEntries: Number(careerResult?.count ?? 0),
      totalGrowthNotes: Number(growthNoteResult?.count ?? 0),
      totalPoints: Number(pointsResult[0]?.total ?? 0),
      recentEntries: recentEntriesRaw.map((e) => ({
        id: e.id,
        category: e.category,
        title: e.title,
        rejectionDate: e.rejectionDate,
        description: e.description,
        growthNoteCount: Number(e.growthNoteCount ?? 0),
        createdAt: e.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
