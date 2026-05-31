-- HireMind AI — Database Schema
-- Run this in your Supabase project: Dashboard → SQL Editor → New Query

-- Enable UUID extension (Supabase has this by default, but just in case)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USERS ────────────────────────────────────────────────────────────────────
-- One table for both candidates and recruiters.
-- role column differentiates them — no need for separate tables.
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(255)        NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT                NOT NULL,
  role          VARCHAR(20)         NOT NULL DEFAULT 'candidate'
                CHECK (role IN ('candidate', 'recruiter')),
  created_at    TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

-- ─── JOBS ─────────────────────────────────────────────────────────────────────
-- Created by recruiters. Candidates apply to jobs.
-- required_skills is stored as TEXT — we'll send it to Groq for NLP matching.
CREATE TABLE IF NOT EXISTS jobs (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recruiter_id   UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title          VARCHAR(255) NOT NULL,
  description    TEXT         NOT NULL,
  required_skills TEXT        NOT NULL,   -- free-form: "React, Node, PostgreSQL"
  is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── APPLICATIONS ─────────────────────────────────────────────────────────────
-- One row per candidate per job.
-- parsed_resume: Groq extracts skills/experience from PDF → stored as JSON
-- match_score: 0-100, calculated by AI comparing resume vs job requirements
CREATE TABLE IF NOT EXISTS applications (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id   UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id         UUID         NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  resume_url     TEXT         NOT NULL,   -- Supabase Storage public URL
  parsed_resume  JSONB,                   -- AI extracted: {skills, experience, education}
  match_score    INTEGER      CHECK (match_score BETWEEN 0 AND 100),
  status         VARCHAR(30)  NOT NULL DEFAULT 'applied'
                 CHECK (status IN ('applied', 'reviewed', 'interviewed', 'hired', 'rejected')),
  applied_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  -- Prevent duplicate applications
  UNIQUE(candidate_id, job_id)
);

-- ─── INTERVIEW SESSIONS ────────────────────────────────────────────────────────
-- One session per application.
-- questions: Array of AI-generated questions [{id, question, type}]
-- answers: Candidate's responses [{question_id, answer}]
-- ai_feedback: Groq's overall evaluation text
-- recommendation: hire / maybe / reject
CREATE TABLE IF NOT EXISTS interview_sessions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID         NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  questions      JSONB,                   -- AI generated interview questions
  answers        JSONB,                   -- Candidate submitted answers
  score          INTEGER      CHECK (score BETWEEN 0 AND 100),
  ai_feedback    TEXT,                    -- Detailed Groq feedback
  recommendation VARCHAR(20)  CHECK (recommendation IN ('hire', 'maybe', 'reject')),
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE(application_id)                  -- One interview per application
);

-- ─── INDEXES ──────────────────────────────────────────────────────────────────
-- Indexes speed up common queries. Always index foreign keys and filter columns.
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter    ON jobs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_apps_candidate    ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_apps_job          ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_apps_score        ON applications(match_score DESC);  -- For ranking
CREATE INDEX IF NOT EXISTS idx_sessions_app      ON interview_sessions(application_id);

-- ─── VERIFY ───────────────────────────────────────────────────────────────────
-- After running this, execute:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- You should see: users, jobs, applications, interview_sessions