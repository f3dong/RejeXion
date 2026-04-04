# RejeXion

A private, structured rejection reflection app for students and early-career professionals.

## Overview

RejeXion is designed for students and early-career professionals navigating academic and career rejection. Many people experience rejection in deeply personal areas of life, yet most existing tools are either too generic, too public, or not built for meaningful reflection.

RejeXion addresses this gap by providing a calm, private, and structured space to document rejection experiences, reflect through guided prompts, and revisit growth over time.

The app is intentionally designed to support personal reflection rather than social sharing. It focuses on privacy, emotional clarity, and growth by helping users process setbacks in a way that feels organized, personal, and constructive.

## Features

- **Private rejection log** — record what happened, when it happened, and how you felt
- **Guided prompts** — complete 4 structured reflection questions based on category
- **Growth notes** — return to any entry and add timestamped notes as your perspective changes
- **Points system** — earn points for reflective actions such as creating entries and adding growth notes
- **Export** — download any entry as a plain text file
- **Private by design** — no social features, no AI-generated reflection, and no public profiles

## Current MVP Scope

The current MVP focuses on two types of rejection:

- Academic rejection
- Career rejection

Core scope includes:

- Private user authentication using session-based login
- Rejection entry creation
- Four guided reflection prompts per category
- Timestamped growth notes
- A basic points system
- Plain text export for individual entries
- A fully private experience with no social sharing or AI-generated responses

This focused scope keeps the first version of the product specific, manageable, and aligned with the core goal of structured private reflection.

## How It Works

1. The user logs in to a private account.
2. The user creates a new rejection entry by selecting a category: academic or career.
3. The user adds key details such as the title, date, and short description of what happened.
4. The app presents four guided reflection prompts based on the selected category.
5. The completed entry is saved privately to the user’s account.
6. The user can revisit previous entries and add timestamped growth notes over time.
7. The app awards points for reflective engagement, including creating entries and adding growth notes.
8. Any entry can be exported as a plain text file for personal use.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, Tailwind CSS, shadcn/ui |
| Backend | Express 5, Node.js |
| Database | PostgreSQL, Drizzle ORM |
| Authentication | Session-based (`express-session`) |
| Routing | Wouter |
| API | OpenAPI specification + generated React Query hooks |
| Monorepo | pnpm workspaces |

## Project Structure

```text
/
├── artifacts/
│   ├── api-server/        # Express API backend
│   └── rejexion/          # React + Vite frontend
├── lib/
│   ├── api-client-react/  # Generated React Query hooks
│   ├── api-spec/          # OpenAPI specification
│   └── db/                # Drizzle ORM schema + migrations
Setup Instructions
Prerequisites

Make sure you have the following installed:

Node.js 20+
pnpm
PostgreSQL
Installation
git clone https://github.com/your-username/rejexion.git
cd rejexion
pnpm install
Environment Variables

Create a .env file in the project root and add:

DATABASE_URL=postgresql://user:password@localhost:5432/rejexion
SESSION_SECRET=your-secret-here
Run the Project
Push database schema
pnpm --filter @workspace/db run push
Seed prompt templates
pnpm --filter @workspace/db run seed
Start the API server
pnpm --filter @workspace/api-server run dev
Start the frontend
pnpm --filter @workspace/rejexion run dev
Design Decisions

RejeXion was intentionally designed as a private reflection tool rather than a social platform.

Privacy first — rejection is often emotionally sensitive, so the product is designed to encourage honest reflection without public exposure
No social features — the app avoids feeds, likes, and public profiles to reduce comparison and performative vulnerability
No AI-generated reflection — users are encouraged to process and articulate their own experiences rather than rely on AI for emotional interpretation
Focused MVP — the first version only includes academic and career rejection to keep the experience clear, practical, and manageable
AI-Assisted Development Approach

This project was developed using AI tools throughout the development lifecycle in order to support ideation, planning, implementation, and documentation.

Development process included:
Initial ideation
ChatGPT was used to refine the app concept, clarify the target user, and narrow the problem space.
Requirements preparation
AI tools were used to help define the MVP scope, core features, user flows, and functional requirements.
Prototyping and component development
ChatGPT supported early interface planning, component structuring, and feature logic exploration.
Main development environment
Replit was used as the primary AI-assisted coding tool for implementation and development.
Documentation and repository setup
AI was used to support code documentation, README drafting, setup instructions, and GitHub repository organization.

This approach reflects the required development process by incorporating AI for:

ideation
requirements preparation
prototyping
component development
coding support in Replit
documentation and GitHub repository setup
Open Source License

This repository is public and released under the MIT License.
