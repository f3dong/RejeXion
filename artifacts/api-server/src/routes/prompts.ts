import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, promptTemplatesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/prompts", requireAuth, async (req, res): Promise<void> => {
  const { category } = req.query;

  if (!category || (category !== "academic" && category !== "career")) {
    res.status(400).json({ error: "category must be 'academic' or 'career'" });
    return;
  }

  const prompts = await db
    .select()
    .from(promptTemplatesTable)
    .where(eq(promptTemplatesTable.category, category as string))
    .orderBy(asc(promptTemplatesTable.orderIndex));

  res.json(
    prompts.map((p) => ({
      id: p.id,
      category: p.category,
      promptText: p.promptText,
      orderIndex: p.orderIndex,
    }))
  );
});

export default router;
