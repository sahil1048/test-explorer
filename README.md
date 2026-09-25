# Test Explorer

**Live app:** [testexplorer.in](https://testexplorer.in) · Preview deploy: [test-explorer-nine.vercel.app](https://test-explorer-nine.vercel.app)

A multi-tenant SaaS platform for schools and exam-prep centers — one place for a school to run academics, staff and student records, assessments, and results, alongside the original competitive-exam practice experience for students. **Work in progress**, evolving module by module from a single-school exam tool into a full school-operations platform.

## What it does

- **Academics** — academic years, grades, sections and subjects, scoped per school (organization) and per year, with promotion/archival instead of destructive edits.
- **People** — school-admin and teacher management with invite lifecycle, and a grade/section-aware student directory.
- **Assessment builder & question bank** — infrastructure for authoring questions and assembling assessments per subject/section.
- **Student assessment experience** — the exam-taking flow: timed attempts, autosave, and submission.
- **Teacher evaluation workspace & productivity engine** — grading and day-to-day teacher workflows.
- **Principal intelligence center** — school-level oversight and analytics surfaces.
- **Communication & parent engagement** — announcements and parent-facing views.
- **Role-based access** — `super_admin`, `school_admin`, `teacher`, and `student` roles mapped to a central capability/permission model, enforced with Postgres row-level security per organization (tenant).
- **Resumable onboarding** — a step-by-step wizard for a new school to set itself up (organization details, academic year, grades/sections, staff invites).

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router), TypeScript |
| Styling/UI | Tailwind CSS, shadcn/ui |
| Backend | Supabase (Postgres, Auth, Row-Level Security) |
| Deployment | Vercel |

## Architecture notes

- Multi-tenant by design: every school is an `organization`, and tenant-owned tables carry `organization_id` protected by RLS policies rather than app-level filtering alone.
- Additive migrations: new modules (academic years, grades, sections, people, notifications, audit events, onboarding progress) are layered onto the existing schema rather than replacing it, so the original competitive-exam catalog kept working while the school platform was built out underneath it.
- Full module design docs — covering the school foundation, question bank, assessment builder, student assessment experience, teacher workspace, principal intelligence, and communication modules — live under [`docs/`](./docs).

## Status

Actively evolving: core academics, people, and onboarding foundations are in place; assessment, grading, and analytics modules are being built out module by module. Not yet hardened for production school deployment — see `docs/` for the module-by-module implementation plans.
