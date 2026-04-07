import app from "./app";
import { logger } from "./lib/logger";
import { db, promptTemplatesTable } from "@workspace/db";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function seedPromptTemplates() {
  const prompts = [
    { id: "9dd3827e-cc09-4c7a-be4c-5a5e024a19a0", category: "academic", promptText: "What did you learn about yourself, your coursework, your research, or your academic strengths through this application process?", orderIndex: 1 },
    { id: "6d0a1217-c0d9-4d35-83ea-4e70d8428ac9", category: "academic", promptText: "What were you hoping to gain from this program, fellowship, or institution, and what does this rejection mean for your academic goals right now?", orderIndex: 2 },
    { id: "22a9a239-c169-4299-8d06-c33149871d68", category: "academic", promptText: "What external factors — such as the school's program priorities, competition, or timing — may have influenced this admissions or scholarship decision?", orderIndex: 3 },
    { id: "9eed3daf-5a2a-4a4a-b0db-9f0b5416857a", category: "academic", promptText: "What is one concrete step you could take — whether retaking a course, seeking a professor's mentorship, or applying elsewhere — to continue pursuing your academic goals?", orderIndex: 4 },
    { id: "2a20c73a-72b1-478d-9a60-a4b1ed7862f9", category: "career", promptText: "What were you hoping for from this opportunity, and what does this rejection feel like right now?", orderIndex: 1 },
    { id: "3fa20c16-67a9-414d-8865-f15a3940e5e5", category: "career", promptText: "What did you learn about yourself, your skills, or the role through this process?", orderIndex: 2 },
    { id: "a2878ecc-2027-4092-bb88-0d9593cf69e2", category: "career", promptText: "What factors outside your control may have played a role in this decision?", orderIndex: 3 },
    { id: "73f4f9c4-c112-4906-8aa3-b62f4bdda48e", category: "career", promptText: "What is one thing you want to focus on or try differently going forward?", orderIndex: 4 },
  ];

  await db
    .insert(promptTemplatesTable)
    .values(prompts)
    .onConflictDoNothing();

  logger.info("Prompt templates seeded");
}

app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  try {
    await seedPromptTemplates();
  } catch (seedErr) {
    logger.error({ err: seedErr }, "Failed to seed prompt templates");
  }
});
