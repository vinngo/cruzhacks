# Project State

## Project Reference

See: .planning/PROJECT.md

**Core value:** The AI guides through questions, not answers. Students learn by being nudged toward discovery, not told what to do.
**Current focus:** Phase 1 — Foundation & Canvas

## Current Position

Phase: 3 of 3 (Guidance Annotations)
Plan: 2 of 3 complete
Status: Phase in progress
Last activity: 2026-01-18 — Completed 03-02-PLAN.md (Annotation overlay with smart positioning)

Progress: █████████░ 90% (9/10 plans complete)

## Performance Metrics

**Velocity:**
- Total plans completed: 9
- Average duration: ~7.5 min (automated plans only)

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation-canvas | 4/4 (complete) | 39.5 min | 9.9 min |
| 02-problem-input---ai-integration | 3/3 (complete) | Manual | Manual |
| 03-guidance-annotations | 2/3 (in progress) | ~18 min | ~9 min |

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
| useMemo excludes editorRef from dependencies | 03-02 | Prevents unnecessary recalculations when editor mounts |
| processedMessageIds Set for duplicate prevention | 03-02 | Prevents duplicate annotations on re-renders |
| setState callback pattern in annotation state | 03-02 | Avoids stale closure bugs in add/remove operations |
| MVP viewport-based positioning | 03-02 | Simpler than shape overlap detection, sufficient for phase 3 |
| Blue theme for questions, amber for hints | 03-02 | Distinct visual identity helps students recognize annotation type |

### Pending Todos

(None yet)

### Blockers/Concerns

(None yet)

## Session Continuity

Last session: 2026-01-18
Stopped at: Completed 03-02-PLAN.md (Annotation overlay with smart positioning)
Resume file: None
Next up: Plan 03-03 - Canvas integration (approve creates shapes)
