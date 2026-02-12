# Project State

## Project Reference

See: .planning/PROJECT.md

**Core value:** The AI guides through questions, not answers. Students learn by being nudged toward discovery, not told what to do.
**Current focus:** Phase 4 — Mastra Framework Migration (Production Extension)

## Current Position

Phase: 4 (Post-Hackathon Extension)
Status: Architecture planning complete, implementation starting
Last activity: 2026-02-12 — Mastra migration architecture designed

Progress: Hackathon demo complete (10/10 plans) | Extension phase starting

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
| **Mastra framework for production** | 04 | Workflow orchestration + agent autonomy + built-in observability for scalability |
| **Stateful canvas storage** | 04 | Store screenshots once, reference by ID; reduces token usage ~75% vs sending every request |
| **Workflow + Agent hybrid** | 04 | Workflow enforces structured tutoring process; agent handles conversational AI |
| **LibSQL storage for sessions** | 04 | Persistent storage for canvas snapshots, metrics, and session tracking |
| **Quality control workflow step** | 04 | Automatic validation that AI follows Socratic method (no direct answers) |

### Pending Todos

(None yet)

### Blockers/Concerns

(None yet)

## Session Continuity

Last session: 2026-02-12
Focus: Mastra framework migration architecture
Status: Design complete, implementation guide created
Next up: Implement Phase 4 migration tasks:
  1. Create canvas storage layer (lib/canvas-storage.ts)
  2. Create Mastra tools (proposeAnnotation, viewWhiteboard)
  3. Create tutor workflow (mastra/workflows/tutor-workflow.ts)
  4. Update tutor agent with tools
  5. Create new API route (/api/mastra/tutor)
  6. Update ChatPanel to use workflow endpoint
  7. Test in Mastra Studio
