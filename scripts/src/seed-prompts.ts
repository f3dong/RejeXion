import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set.");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const prompts = [
  {
    id: "9dd3827e-cc09-4c7a-be4c-5a5e024a19a0",
    category: "academic",
    prompt_text:
      "What did you learn about yourself, your coursework, your research, or your academic strengths through this application process?",
    order_index: 1,
  },
  {
    id: "6d0a1217-c0d9-4d35-83ea-4e70d8428ac9",
    category: "academic",
    prompt_text:
      "What were you hoping to gain from this program, fellowship, or institution, and what does this rejection mean for your academic goals right now?",
    order_index: 2,
  },
  {
    id: "22a9a239-c169-4299-8d06-c33149871d68",
    category: "academic",
    prompt_text:
      "What external factors — such as the school's program priorities, competition, or timing — may have influenced this admissions or scholarship decision?",
    order_index: 3,
  },
  {
    id: "9eed3daf-5a2a-4a4a-b0db-9f0b5416857a",
    category: "academic",
    prompt_text:
      "What is one concrete step you could take — whether retaking a course, seeking a professor's mentorship, or applying elsewhere — to continue pursuing your academic goals?",
    order_index: 4,
  },
  {
    id: "2a20c73a-72b1-478d-9a60-a4b1ed7862f9",
    category: "career",
    prompt_text:
      "What were you hoping for from this opportunity, and what does this rejection feel like right now?",
    order_index: 1,
  },
  {
    id: "3fa20c16-67a9-414d-8865-f15a3940e5e5",
    category: "career",
    prompt_text:
      "What did you learn about yourself, your skills, or the role through this process?",
    order_index: 2,
  },
  {
    id: "a2878ecc-2027-4092-bb88-0d9593cf69e2",
    category: "career",
    prompt_text:
      "What factors outside your control may have played a role in this decision?",
    order_index: 3,
  },
  {
    id: "73f4f9c4-c112-4906-8aa3-b62f4bdda48e",
    category: "career",
    prompt_text:
      "What is one thing you want to focus on or try differently going forward?",
    order_index: 4,
  },
];

async function seed() {
  const client = await pool.connect();
  try {
    for (const p of prompts) {
      await client.query(
        `INSERT INTO prompt_templates (id, category, prompt_text, order_index)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE
           SET category = EXCLUDED.category,
               prompt_text = EXCLUDED.prompt_text,
               order_index = EXCLUDED.order_index`,
        [p.id, p.category, p.prompt_text, p.order_index],
      );
    }
    console.log(`Seeded ${prompts.length} prompt templates.`);
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
