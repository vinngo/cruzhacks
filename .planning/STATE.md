# Project State

## Project Reference

See: .planning/PROJECT.md

**Core value:** The AI guides through questions, not answers. Students learn by being nudged toward discovery, not told what to do.
**Current focus:** Phase 1 — Foundation & Canvas

## Current Position

Phase: 2 of 3 (Problem Input & AI Integration)
Plan: 1 of 3 complete
Status: Phase in progress
Last activity: 2026-01-16 — Completed 02-01-PLAN.md (Problem input & state management)

Progress: █░░░░░░░░░ 33% (Phase 2)

## Performance Metrics

**Velocity:**
- Total plans completed: 5
- Average duration: N/A (manual implementation)

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation-canvas | 4/4 (complete) | 39.5 min | 9.9 min |
| 02-problem-input---ai-integration | 1/3 (in progress) | Manual | Manual |

## Accumulated Context

### Decisions

| Decision | Phase | Rationale |
|----------|-------|-----------|
| Tailwind CSS v4 zero-config | 01-01 | Simpler setup, faster builds with @import directive |
| Crimson Text serif for headings | 01-01 | Academic aesthetic for tutoring app |
| Google Fonts CDN delivery | 01-01 | Fast font loading without local hosting |
| System fonts for body text | 01-01 | Performance and native platform familiarity |
| ChatGPT/Claude aesthetic with centered input | 01-02 | Clean, familiar UX for initial problem entry |
| template.tsx for page transitions | 01-02 | Enables exit animations (template re-renders on navigation) |
| 300ms transition duration | 01-02 | Smooth transitions without feeling sluggish |
| react-resizable-panels Group/Separator API | 01-03 | Library exports differ from documentation (verified via Node.js) |
| Hide tldraw menus, keep toolbar | 01-03 | Minimal UI focus on canvas, toolbar needed for drawing tools |
| 500ms throttle for localStorage | 01-03 | Balance performance vs data loss risk |
| Welcome hint on empty canvas | 01-03 | Guide first-time users to start working |
| Pivot to flexbox layout from react-resizable-panels | 01-04 | Multiple rendering issues; flexbox achieves 20/80 split without complexity |
| Remove welcome hint text | 01-04 | tldraw text shape API incompatible with simple programmatic insertion |
| "Socratical" branding | 01-04 | Shorter, more distinctive than "Socratic Whiteboard" |
| Client-side object URLs for images | 02-01 | URL.createObjectURL() enables preview/display without server upload |
| React Context over Redux/Zustand | 02-01 | Simpler state management appropriate for 3-phase project scope |
| Next.js Image with object URLs | 02-01 | Works without configuration; no optimization needed for client blobs |
| Text OR image (mutually exclusive) | 02-01 | Clearer UX than allowing both simultaneously |

### Pending Todos

(None yet)

### Blockers/Concerns

(None yet)

## Session Continuity

Last session: 2026-01-16
Stopped at: Completed 02-01-PLAN.md (manual implementation)
Resume file: None
Next up: Plan 02-02 - AI SDK integration and Socratic chat API
