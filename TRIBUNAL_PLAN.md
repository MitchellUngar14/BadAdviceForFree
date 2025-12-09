# Bad Advice For Free - Implementation Plan

## Project Overview

A Q&A platform where users can ask questions and receive answers from other users with a three-tier role system:
- **Tier 1:** Ask questions only
- **Tier 2:** Ask and answer questions
- **Tier 3:** Admin with edit/remove permissions

**Design:** Dark mode, sleek, modern interface with sign-up/sign-in functionality.

---

## Recommended Approach

**Full-Stack Next.js 14 Application** with:
- Next.js App Router for frontend and API routes
- PostgreSQL database (via Neon or Vercel Postgres)
- Prisma ORM for type-safe database access
- Tailwind CSS for dark-mode styling
- JWT-based authentication with role-based access control

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React, Tailwind CSS |
| Backend | Next.js API Routes |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Auth | JWT + bcrypt |
| Deployment | Vercel |

---

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

---

## Database Schema (Prisma)

```prisma
model User {
  id           String     @id @default(uuid())
  email        String     @unique
  passwordHash String     @map("password_hash")
  displayName  String     @map("display_name")
  tier         Int        @default(1)
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @updatedAt @map("updated_at")
  questions    Question[]
  answers      Answer[]

  @@map("users")
}

model Question {
  id        String   @id @default(uuid())
  title     String
  body      String?
  userId    String?  @map("user_id")
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  answers   Answer[]
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("questions")
}

model Answer {
  id         String   @id @default(uuid())
  body       String
  questionId String   @map("question_id")
  question   Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  userId     String?  @map("user_id")
  user       User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  @@map("answers")
}
```

---

## API Endpoints

```
POST   /api/auth/signup          - Register with tier selection
POST   /api/auth/signin          - Login, returns JWT
GET    /api/questions            - List all questions (public)
POST   /api/questions            - Create question (Tier 1+)
GET    /api/questions/:id        - Get single question with answers
POST   /api/questions/:id/answers - Submit answer (Tier 2+)
PUT    /api/questions/:id        - Edit question (Tier 3 or owner)
DELETE /api/questions/:id        - Delete question (Tier 3)
PUT    /api/answers/:id          - Edit answer (Tier 3 or owner)
DELETE /api/answers/:id          - Delete answer (Tier 3)
```

---

## Color Palette (Dark Mode)

```css
:root {
  --bg-primary: #0a0a0a;
  --bg-secondary: #141414;
  --bg-card: #1c1c1c;
  --border: #2e2e2e;
  --text-primary: #fafafa;
  --text-secondary: #a3a3a3;
  --accent: #22d3ee;        /* Cyan-400 */
  --accent-hover: #06b6d4;  /* Cyan-500 */
  --danger: #ef4444;
}
```

---

## Implementation Phases

### Phase 1: Project Setup
1. Initialize Next.js 14 project with TypeScript and Tailwind CSS
2. Configure Tailwind for dark mode with custom color palette
3. Set up PostgreSQL database (Neon recommended)
4. Initialize Prisma with the schema defined above
5. Create project folder structure

### Phase 2: Authentication System
1. Build signup page with tier selection (explain what each tier allows)
2. Build signin page with email/password
3. Implement password hashing with bcrypt
4. Create JWT token generation and verification utilities
5. Build AuthContext for client-side auth state
6. Add protected API route middleware

### Phase 3: Core Features
1. Create question list page (home) - public, shows all questions
2. Build question detail page with answers
3. Implement "Ask Question" form (Tier 1+)
4. Implement "Submit Answer" form (Tier 2+)
5. Add edit/delete functionality for admins (Tier 3) and content owners

### Phase 4: UI Polish
1. Design and implement Navbar with auth state awareness
2. Create QuestionCard and AnswerCard components
3. Add tier badges and visual indicators
4. Implement toast notifications for actions
5. Add loading states and error handling
6. Ensure mobile responsiveness

### Phase 5: Deployment
1. Deploy to Vercel (connects seamlessly with Next.js)
2. Configure environment variables for database and JWT secret
3. Set up the custom domain (badadviceforfree.com)
4. Test all flows in production

---

## Key Considerations

- **Security First:** Sanitize all user input, use parameterized queries (Prisma handles this), implement rate limiting on auth endpoints
- **User Experience:** Clear indication of what each tier can do during signup, smooth transitions, helpful error messages
- **Scalability:** The Next.js + PostgreSQL stack scales well; add Redis caching later if needed
- **Content Moderation:** Consider adding a "report" feature for Tier 3 admins to review flagged content

---

## Future Enhancements

- Voting system for answers
- Categories/tags for questions
- Search functionality
- User profiles
- Email notifications

---

## Permission Helpers

```typescript
const canAskQuestion = (user: User | null) => user && user.tier >= 1;
const canAnswer = (user: User | null) => user && user.tier >= 2;
const canModerate = (user: User | null) => user && user.tier >= 3;
const canEdit = (user: User | null, authorId: string) =>
  user && (user.tier >= 3 || user.id === authorId);
```

---

## Tier Visual Indicators

- **Tier 1:** Default user icon
- **Tier 2:** Badge with "Advisor" label in accent color
- **Tier 3:** Shield icon with "Admin" label (gold or red)
