# CLAUDE.md

This file provides guidance to Claude Code when working with the Bad Advice For Free project.

## Project Overview

Bad Advice For Free is a Q&A web application where users can ask questions and receive answers from other users. It features a three-tier role-based access control system.

**Domain:** badadviceforfree.com

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React, Tailwind CSS |
| Backend | Next.js API Routes |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Auth | JWT + bcrypt |
| Deployment | Vercel |

## Role System

- **Tier 1:** Can ask questions only
- **Tier 2:** Can ask questions and submit answers
- **Tier 3:** Admin - can edit/delete any questions and answers

## Commands

```bash
# Development
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run lint         # ESLint

# Database
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema to database
npx prisma studio    # Open Prisma Studio GUI
npx prisma migrate dev --name <name>  # Create migration
```

## Environment Variables

Create `.env.local` with:
```
DATABASE_URL=           # Neon PostgreSQL connection string
JWT_SECRET=             # Secret for JWT signing
NEXTAUTH_SECRET=        # NextAuth secret (if using NextAuth)
NEXTAUTH_URL=           # App URL (http://localhost:3000 for dev)
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Dark theme root layout
│   ├── page.tsx            # Home - question list
│   ├── questions/
│   │   └── [id]/page.tsx   # Question detail with answers
│   ├── auth/
│   │   ├── signin/page.tsx
│   │   └── signup/page.tsx
│   └── api/                # API routes
├── components/
│   ├── QuestionCard.tsx
│   ├── AnswerCard.tsx
│   ├── QuestionForm.tsx
│   ├── AnswerForm.tsx
│   ├── Navbar.tsx
│   └── AuthModal.tsx
├── context/
│   └── AuthContext.tsx     # User state, JWT management
├── lib/
│   ├── api.ts              # API client functions
│   ├── auth.ts             # JWT utilities
│   └── db.ts               # Prisma client
└── styles/
    └── globals.css         # Tailwind + dark theme
```

## API Endpoints

```
POST   /api/auth/signup           - Register with tier selection
POST   /api/auth/signin           - Login, returns JWT
GET    /api/questions             - List all questions (public)
POST   /api/questions             - Create question (Tier 1+)
GET    /api/questions/:id         - Get single question with answers
POST   /api/questions/:id/answers - Submit answer (Tier 2+)
PUT    /api/questions/:id         - Edit question (Tier 3 or owner)
DELETE /api/questions/:id         - Delete question (Tier 3)
PUT    /api/answers/:id           - Edit answer (Tier 3 or owner)
DELETE /api/answers/:id           - Delete answer (Tier 3)
```

## Database Schema

See `prisma/schema.prisma` for full schema. Key models:
- `User` - id, email, passwordHash, displayName, tier (1-3)
- `Question` - id, title, body, userId, timestamps
- `Answer` - id, body, questionId, userId, timestamps

## Design System (Dark Mode)

```css
--bg-primary: #0a0a0a;
--bg-secondary: #141414;
--bg-card: #1c1c1c;
--border: #2e2e2e;
--text-primary: #fafafa;
--text-secondary: #a3a3a3;
--accent: #22d3ee;        /* Cyan-400 */
--accent-hover: #06b6d4;  /* Cyan-500 */
--danger: #ef4444;
```

## Permission Helpers

```typescript
const canAskQuestion = (user: User | null) => user && user.tier >= 1;
const canAnswer = (user: User | null) => user && user.tier >= 2;
const canModerate = (user: User | null) => user && user.tier >= 3;
const canEdit = (user: User | null, authorId: string) =>
  user && (user.tier >= 3 || user.id === authorId);
```

## Key Files

- `TRIBUNAL_PLAN.md` - Original implementation plan from The Tribunal
- `prisma/schema.prisma` - Database schema
- `src/app/layout.tsx` - Root layout with dark theme
- `src/context/AuthContext.tsx` - Authentication state management
