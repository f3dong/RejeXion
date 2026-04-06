import { Router, type IRouter } from "express";
import { eq, desc, and, count, sql } from "drizzle-orm";
import {
  db,
  entriesTable,
  entryResponsesTable,
  growthNotesTable,
  promptTemplatesTable,
  pointsEventsTable,
} from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/entries", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const { category } = req.query;

  const conditions = [eq(entriesTable.userId, userId)];
  if (category && category !== "all" && (category === "academic" || category === "career")) {
    conditions.push(eq(entriesTable.category, category as string));
  }

  const entries = await db
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
    .where(and(...conditions))
    .groupBy(entriesTable.id)
    .orderBy(desc(entriesTable.rejectionDate));

  res.json(
    entries.map((e) => ({
      id: e.id,
      category: e.category,
      title: e.title,
      rejectionDate: e.rejectionDate,
      description: e.description,
      growthNoteCount: Number(e.growthNoteCount ?? 0),
      createdAt: e.createdAt,
    }))
  );
});

router.post("/entries", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const { category, title, rejectionDate, description, responses } = req.body;

  if (!category || !title || !rejectionDate || !responses) {
    res.status(400).json({ error: "Category, title, date, and responses are required" });
    return;
  }

  if (category !== "academic" && category !== "career") {
    res.status(400).json({ error: "Category must be 'academic' or 'career'" });
    return;
  }

  if (!Array.isArray(responses) || responses.length === 0) {
    res.status(400).json({ error: "At least one prompt response is required" });
    return;
  }

  const [entry] = await db
    .insert(entriesTable)
    .values({ userId, category, title, rejectionDate, description })
    .returning();

  for (const r of responses) {
    if (r.promptId && r.responseText != null) {
      await db.insert(entryResponsesTable).values({
        entryId: entry.id,
        promptId: r.promptId,
        responseText: r.responseText,
      });
    }
  }

  // Award points
  await db.insert(pointsEventsTable).values({
    userId,
    eventType: "entry_created",
    referenceId: entry.id,
    points: 5,
  });

  req.log.info({ entryId: entry.id, userId }, "Entry created");

  res.status(201).json({
    id: entry.id,
    category: entry.category,
    title: entry.title,
    rejectionDate: entry.rejectionDate,
    description: entry.description,
    growthNoteCount: 0,
    createdAt: entry.createdAt,
  });
});

router.get("/entries/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const [entry] = await db
    .select()
    .from(entriesTable)
    .where(and(eq(entriesTable.id, rawId), eq(entriesTable.userId, userId)))
    .limit(1);

  if (!entry) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }

  const responses = await db
    .select({
      id: entryResponsesTable.id,
      promptId: entryResponsesTable.promptId,
      promptText: promptTemplatesTable.promptText,
      responseText: entryResponsesTable.responseText,
    })
    .from(entryResponsesTable)
    .innerJoin(promptTemplatesTable, eq(entryResponsesTable.promptId, promptTemplatesTable.id))
    .where(eq(entryResponsesTable.entryId, entry.id));

  const growthNotes = await db
    .select()
    .from(growthNotesTable)
    .where(eq(growthNotesTable.entryId, entry.id))
    .orderBy(desc(growthNotesTable.createdAt));

  res.json({
    id: entry.id,
    category: entry.category,
    title: entry.title,
    rejectionDate: entry.rejectionDate,
    description: entry.description,
    responses: responses.map((r) => ({
      id: r.id,
      promptId: r.promptId,
      promptText: r.promptText,
      responseText: r.responseText,
    })),
    growthNotes: growthNotes.map((gn) => ({
      id: gn.id,
      entryId: gn.entryId,
      content: gn.content,
      createdAt: gn.createdAt,
    })),
    createdAt: entry.createdAt,
  });
});

router.delete("/entries/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const [entry] = await db
    .select()
    .from(entriesTable)
    .where(and(eq(entriesTable.id, rawId), eq(entriesTable.userId, userId)))
    .limit(1);

  if (!entry) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }

  await db.delete(entriesTable).where(eq(entriesTable.id, entry.id));

  req.log.info({ entryId: entry.id, userId }, "Entry deleted");
  res.sendStatus(204);
});

router.get("/entries/:id/export", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const [entry] = await db
    .select()
    .from(entriesTable)
    .where(and(eq(entriesTable.id, rawId), eq(entriesTable.userId, userId)))
    .limit(1);

  if (!entry) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }

  const responses = await db
    .select({
      promptText: promptTemplatesTable.promptText,
      responseText: entryResponsesTable.responseText,
    })
    .from(entryResponsesTable)
    .innerJoin(promptTemplatesTable, eq(entryResponsesTable.promptId, promptTemplatesTable.id))
    .where(eq(entryResponsesTable.entryId, entry.id));

  const growthNotes = await db
    .select()
    .from(growthNotesTable)
    .where(eq(growthNotesTable.entryId, entry.id))
    .orderBy(desc(growthNotesTable.createdAt));

  const lines: string[] = [
    `RejeXion — Reflection Export`,
    `============================`,
    ``,
    `Title: ${entry.title}`,
    `Category: ${entry.category}`,
    `Rejection Date: ${entry.rejectionDate}`,
    `Created: ${entry.createdAt.toISOString().split("T")[0]}`,
    ``,
    `Description`,
    `-----------`,
    entry.description,
    ``,
    `Reflection Responses`,
    `--------------------`,
  ];

  for (const r of responses) {
    lines.push(`Q: ${r.promptText}`);
    lines.push(`A: ${r.responseText}`);
    lines.push(``);
  }

  if (growthNotes.length > 0) {
    lines.push(`Growth Notes`);
    lines.push(`------------`);
    for (const gn of growthNotes) {
      lines.push(`[${gn.createdAt.toISOString().split("T")[0]}]`);
      lines.push(gn.content);
      lines.push(``);
    }
  }

  res.setHeader("Content-Type", "text/plain");
  res.send(lines.join("\n"));
});

export default router;
