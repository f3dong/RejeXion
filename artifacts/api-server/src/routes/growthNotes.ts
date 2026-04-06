import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, entriesTable, growthNotesTable, pointsEventsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/entries/:entryId/growth-notes", requireAuth, async (req, res, next): Promise<void> => {
  try {
    const userId = req.session.userId!;
    const rawEntryId = Array.isArray(req.params.entryId) ? req.params.entryId[0] : req.params.entryId;

    const [entry] = await db
      .select()
      .from(entriesTable)
      .where(and(eq(entriesTable.id, rawEntryId), eq(entriesTable.userId, userId)))
      .limit(1);

    if (!entry) {
      res.status(404).json({ error: "Entry not found" });
      return;
    }

    const notes = await db
      .select()
      .from(growthNotesTable)
      .where(eq(growthNotesTable.entryId, entry.id))
      .orderBy(desc(growthNotesTable.createdAt));

    res.json(
      notes.map((gn) => ({
        id: gn.id,
        entryId: gn.entryId,
        content: gn.content,
        createdAt: gn.createdAt,
      }))
    );
  } catch (err) {
    next(err);
  }
});

router.post("/entries/:entryId/growth-notes", requireAuth, async (req, res, next): Promise<void> => {
  try {
    const userId = req.session.userId!;
    const rawEntryId = Array.isArray(req.params.entryId) ? req.params.entryId[0] : req.params.entryId;
    const { content } = req.body;

    if (!content || typeof content !== "string") {
      res.status(400).json({ error: "Content is required" });
      return;
    }

    const [entry] = await db
      .select()
      .from(entriesTable)
      .where(and(eq(entriesTable.id, rawEntryId), eq(entriesTable.userId, userId)))
      .limit(1);

    if (!entry) {
      res.status(404).json({ error: "Entry not found" });
      return;
    }

    const [growthNote] = await db
      .insert(growthNotesTable)
      .values({ entryId: entry.id, content })
      .returning();

    await db.insert(pointsEventsTable).values({
      userId,
      eventType: "growth_note_added",
      referenceId: growthNote.id,
      points: 2,
    });

    req.log.info({ growthNoteId: growthNote.id, entryId: entry.id, userId }, "Growth note added");

    res.status(201).json({
      id: growthNote.id,
      entryId: growthNote.entryId,
      content: growthNote.content,
      createdAt: growthNote.createdAt,
    });
  } catch (err) {
    next(err);
  }
});

router.delete("/growth-notes/:id", requireAuth, async (req, res, next): Promise<void> => {
  try {
    const userId = req.session.userId!;
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const [note] = await db
      .select({
        id: growthNotesTable.id,
        entryId: growthNotesTable.entryId,
        userId: entriesTable.userId,
      })
      .from(growthNotesTable)
      .innerJoin(entriesTable, eq(growthNotesTable.entryId, entriesTable.id))
      .where(and(eq(growthNotesTable.id, rawId), eq(entriesTable.userId, userId)))
      .limit(1);

    if (!note) {
      res.status(404).json({ error: "Growth note not found" });
      return;
    }

    await db.delete(growthNotesTable).where(eq(growthNotesTable.id, note.id));

    req.log.info({ growthNoteId: note.id, userId }, "Growth note deleted");
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

export default router;
