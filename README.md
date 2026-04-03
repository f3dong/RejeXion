# RejeXion

A private, structured rejection reflection app for students and early-career professionals.

RejeXion gives you a calm, personal space to log academic and career rejections, work through guided reflection prompts, and revisit your growth over time — all completely private.

---

## Features

- **Rejection log** — record what happened, when, and how you felt
- **Guided prompts** — 4 thoughtful reflection questions per category (academic or career)
- **Growth notes** — return to any entry and add timestamped notes as your perspective evolves
- **Points system** — earn points for reflecting (+5 per entry, +2 per growth note)
- **Export** — download any entry as a plain text file
- **Private by design** — no social features, no AI, no public profiles

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS, shadcn/ui |
| Backend | Express 5, Node.js |
| Database | PostgreSQL, Drizzle ORM |
| Auth | Session-based (express-session) |
| Routing | Wouter |
| API | OpenAPI spec + generated React Query hooks |
| Monorepo | pnpm workspaces |

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL database

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/rejexion.git
cd rejexion

# Install dependencies
pnpm install
```

### Environment Variables

Create a `.env` file in the root with:

```
DATABASE_URL=postgresql://user:password@localhost:5432/rejexion
SESSION_SECRET=your-secret-here
```

### Database Setup

```bash
# Push schema to database
pnpm --filter @workspace/db run push

# Seed prompt templates
pnpm --filter @workspace/db run seed
```

### Running Locally

```bash
# Start the API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Start the frontend (port 24065)
pnpm --filter @workspace/rejexion run dev
```

---

## Project Structure

```
/
├── artifacts/
│   ├── api-server/        # Express API backend
│   └── rejexion/          # React + Vite frontend
├── lib/
│   ├── api-client-react/  # Generated React Query hooks
│   ├── api-spec/          # OpenAPI specification
│   └── db/                # Drizzle ORM schema + migrations
```

---

## License

MIT
