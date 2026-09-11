# HireMind AI

An AI-powered hiring platform that automates resume parsing, candidate scoring, interview generation, and hiring recommendations using Groq's Llama 3.3-70b model.

**Live Demo:** [hire-mind-ai-kappa.vercel.app](https://hire-mind-ai-kappa.vercel.app)

---

## Features

**Candidate Side**
- Register and login with JWT authentication
- Upload PDF resume — AI extracts skills, experience, and education
- Get an instant match score (0–100) against the job description
- Answer AI-generated interview questions tailored to your background
- Receive per-answer feedback and an overall evaluation

**Recruiter Side**
- Post job listings with required skills
- View all candidates ranked by AI match score
- Generate personalized interview questions for any candidate with one click
- Read full AI evaluation: score, recommendation (hire/maybe/reject), strengths, weaknesses
- Combined scoring dashboard: Resume (40%) + Interview (60%) = Final score

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TailwindCSS, React Router v6, Axios |
| Backend | Node.js, Express.js |
| Database | PostgreSQL via Supabase |
| Auth | JWT + bcrypt |
| Storage | Supabase Storage (PDF resumes) |
| AI | Groq API — llama-3.3-70b-versatile |
| Deployment | Render (backend), Vercel (frontend) |

---

## Architecture

```
Browser (React)
    │
    │  Axios HTTP + JWT header
    ▼
Express API (Node.js)
    │
    ├── Routes → Controllers → Services
    │
    ├── PostgreSQL (Supabase)     ← users, jobs, applications, interview_sessions
    ├── Supabase Storage          ← PDF resume files
    └── Groq API                  ← AI parsing, scoring, questions, evaluation
```

**Clean architecture layers:**
- **Routes** — URL mapping only
- **Controllers** — HTTP request/response handling only
- **Services** — all business logic and DB queries
- **Middleware** — JWT auth, role authorization, file upload, error handling

---

## Database Schema

```sql
users               -- candidates and recruiters (role column differentiates)
jobs                -- created by recruiters
applications        -- one per candidate per job (resume_url, parsed_resume jsonb, match_score)
interview_sessions  -- one per application (questions jsonb, answers jsonb, ai_feedback jsonb)
```

---

## AI Pipeline

```
1. Resume Upload
   PDF → pdf-parse (text extraction) → Groq → structured JSON
   { skills, experience, education, summary }

2. Match Scoring
   parsed_resume + job_description → Groq → { score, matched_skills, missing_skills }

3. Interview Generation
   job_context + candidate_resume → Groq → 5 questions (3 technical + 2 behavioral)

4. Answer Evaluation
   questions + answers → Groq → { per_answer_feedback, overall_score, recommendation }

5. Combined Score
   (match_score × 0.4) + (interview_score × 0.6) = final_score
```

---

## Project Structure

```
hiremind-ai/
├── backend/
│   ├── src/
│   │   ├── config/          # db.js, supabase.js, groq.js
│   │   ├── controllers/     # auth, resume, job, interview, dashboard
│   │   ├── routes/          # auth, resume, job, interview, dashboard
│   │   ├── services/        # auth, resume, ai, job, interview, dashboard
│   │   ├── middleware/       # auth, upload, errorHandler
│   │   └── index.js
│   ├── schema.sql
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/             # client.js, auth/resume/job/interview/dashboard api
    │   ├── components/      # ProtectedRoute, ParsedResumeCard, ErrorBoundary, LoadingSkeleton
    │   ├── context/         # AuthContext.jsx
    │   ├── pages/
    │   │   ├── candidate/   # Dashboard, Upload, Interview, ScoreCard
    │   │   └── recruiter/   # Dashboard, Candidates, CandidateDetail, InterviewResult, ScoringDashboard
    │   └── App.jsx
    └── package.json
```

---

## Local Setup

**Prerequisites:** Node.js 18+, a Supabase account, a Groq API key

**1. Clone the repo**
```bash
git clone https://github.com/YOUR_USERNAME/hiremind-ai.git
cd hiremind-ai
```

**2. Run the database schema**

Go to Supabase Dashboard → SQL Editor → paste and run `backend/schema.sql`

Also create a Storage bucket named `hiremind-resumes` (set to public)

**3. Backend setup**
```bash
cd backend
cp .env.example .env
# Fill in DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, GROQ_API_KEY
npm install
npm run dev
```

**4. Frontend setup**
```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:3000/api/v1
npm install
npm run dev
```

**5. Test the API**
```bash
curl http://localhost:3000/api/health
```

---

## API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/auth/register` | Public | Register candidate or recruiter |
| POST | `/api/v1/auth/login` | Public | Login, returns JWT |
| GET | `/api/v1/auth/me` | Auth | Get current user |

### Jobs
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/jobs` | Auth | List all active jobs |
| POST | `/api/v1/jobs` | Recruiter | Create a job |
| GET | `/api/v1/jobs/my-jobs` | Recruiter | Recruiter's jobs with stats |
| GET | `/api/v1/jobs/:id/candidates` | Recruiter | Ranked candidates for a job |
| PATCH | `/api/v1/jobs/applications/:id/status` | Recruiter | Update candidate status |
| PATCH | `/api/v1/jobs/:id/toggle` | Recruiter | Toggle job active/inactive |

### Resumes
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/resumes/upload` | Candidate | Upload PDF + trigger AI parsing |
| GET | `/api/v1/resumes/my-applications` | Candidate | Get own applications |

### Interviews
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/interviews/generate/:applicationId` | Recruiter | Generate AI questions |
| GET | `/api/v1/interviews/my-interviews` | Candidate | Get assigned interviews |
| POST | `/api/v1/interviews/:sessionId/submit` | Candidate | Submit answers + trigger evaluation |
| GET | `/api/v1/interviews/result/:applicationId` | Recruiter | Get AI evaluation result |

### Dashboard
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/dashboard/recruiter` | Recruiter | Combined scoring dashboard |
| GET | `/api/v1/dashboard/candidate` | Candidate | Candidate's own scores |

---

## Deployment

**Backend → Render**
- Root directory: `backend`
- Build: `npm install`
- Start: `node src/index.js`
- Environment variables: see `.env.production.example`

**Frontend → Vercel**
- Root directory: `frontend`
- Environment variable: `VITE_API_URL=https://your-render-url.onrender.com/api/v1`
- `vercel.json` handles React Router client-side routing

---

## Key Design Decisions

**Why one `users` table for both roles?** A `role` column is simpler than two tables. Auth middleware reads `role` from the JWT payload and controls access without extra joins.

**Why `jsonb` for AI output?** AI responses are dynamic — we don't know the shape upfront. `jsonb` gives us flexibility to store and query structured JSON directly in PostgreSQL.

**Why Groq over OpenAI?** Groq's inference speed is significantly faster (tokens/second), which matters for a real-time UX where the user waits for AI results.

**Why memory storage for Multer?** Files go directly from memory → Supabase Storage without touching disk. Faster and cleaner for a serverless-style deployment.

**Why 40/60 weighting for combined score?** Interview performance (demonstrated ability) is weighted higher than resume (documented history) because it's a better signal of actual capability.

---

Built in 7 days as an MVP. Stack: React · Node.js · PostgreSQL · Groq AI
