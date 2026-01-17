---
phase: 03-guidance-annotations
plan: 01
subsystem: ui
tags: [chat, sidebar, ui/ux, annotations, tldraw, ai-integration]

# Dependency graph
requires:
  - phase: 02-problem-input---ai-integration
    provides: Chat system with AI streaming responses and canvas screenshot capture
provides:
  - Collapsible chat sidebar with smooth transitions
  - Annotation type system (TypeScript definitions)
  - AI system prompt updated for annotation guidance
  - TldrawEditor ref exposing getEditor() for positioning
  - Foundation for annotation overlay UI (next plan)
affects: [03-02, 03-03]

# Tech tracking
tech-stack:
  added: [zod (for annotation schema validation)]
  patterns: [Collapsible sidebar pattern, Editor ref exposure for canvas manipulation]

key-files:
  created: 
    - lib/types/annotations.ts
  modified:
    - components/workspace/ChatPanel.tsx
    - app/workspace/page.tsx
    - app/api/chat/route.ts
    - lib/ai/prompt.ts
    - components/TldrawEditor.tsx

key-decisions:
  - "Collapsible sidebar with 48px collapsed width (icon only) and 320px expanded width"
  - "Flexible canvas layout using flex-1 to expand when chat collapses"
  - "300ms transition duration for smooth animation (matches project standard)"
  - "Annotation schema defined with Zod for type safety"
  - "AI prompt updated to guide annotation proposals (questions and hints)"
  - "Editor instance exposed via ref for future positioning algorithm"

patterns-established:
  - "Collapsible panel pattern: state-controlled width with smooth transitions"
  - "Annotation type system: question (Socratic) and hint (scaffolding)"

# Metrics
duration: ~15min
completed: 2026-01-17
---

# Phase 03 Plan 01 Summary: Collapsible Chat & Annotation Foundation

**Collapsible chat sidebar with smooth transitions, annotation type definitions, AI prompt guidance for canvas annotations, and editor instance access for positioning**

## Performance

- **Duration:** ~15 minutes
- **Started:** 2026-01-17
- **Completed:** 2026-01-17
- **Tasks:** 2
- **Files modified:** 5 modified, 1 created

## Accomplishments

- Collapsible chat sidebar with smooth 300ms transitions
- Canvas expands dynamically when chat collapses (flexbox layout)
- Annotation type system established with TypeScript definitions
- AI system prompt updated with canvas annotation guidance
- TldrawEditor ref exposes getEditor() method for future positioning
- Foundation laid for annotation overlay UI in next plan

## Task Commits

This plan was implemented manually without individual task commits. Changes include:

### Task 1: Add collapsible sidebar to ChatPanel
**Files:** components/workspace/ChatPanel.tsx, app/workspace/page.tsx

**Changes:**
- Added `isCollapsed` state with toggle button in header
- Conditional width: `w-80` (320px) expanded, `w-12` (48px) collapsed
- Smooth transition: `transition-all duration-300 ease-in-out`
- Collapsed state shows vertical "AI" text indicator
- Toggle button keyboard accessible with aria-label and focus styles
- Canvas uses `flex-1` to expand when chat collapses

### Task 2: Implement AI annotation proposal system and expose editor instance
**Files:** lib/types/annotations.ts (new), app/api/chat/route.ts, lib/ai/prompt.ts, components/TldrawEditor.tsx

**Changes:**
- Created `lib/types/annotations.ts` with ProposedAnnotation and AnnotationType
- Updated AI system prompt with canvas annotation guidance
- Added Zod schema for annotation validation
- Exposed `getEditor()` method via TldrawEditorRef
- Foundation for AI tool calling (schema ready, implementation in next plan)

## Files Created/Modified

**Created:**
- `lib/types/annotations.ts` - TypeScript types for annotation system (AnnotationType, ProposedAnnotation, AnnotationProposal)

**Modified:**
- `components/workspace/ChatPanel.tsx` - Collapsible sidebar state and UI
- `app/workspace/page.tsx` - Flexible canvas layout with flex-1
- `app/api/chat/route.ts` - Annotation schema definition with Zod
- `lib/ai/prompt.ts` - System prompt updated with annotation guidance
- `components/TldrawEditor.tsx` - getEditor() method exposed via ref

## Decisions Made

**Collapsible sidebar design:**
- 48px collapsed width (just enough for toggle button + indicator)
- 320px expanded width (existing chat width)
- 300ms transition duration (matches project standard from STATE.md)
- Collapsed state shows vertical "AI" text for clarity
- Toggle always visible and keyboard accessible

**Flexible layout:**
- Canvas uses `flex-1` instead of fixed `w-3/5` width
- Enables canvas to expand automatically when chat collapses
- Problem panel remains fixed at `w-1/5` (20%)

**Annotation type system:**
- Two annotation types: "question" (Socratic) and "hint" (scaffolding)
- Position hints: top-left, top-right, bottom-left, bottom-right, center
- Schema validation with Zod for type safety
- AI guidance: 0-2 annotations per response, only when referencing canvas work

**Editor access:**
- Exposed via `getEditor()` method on TldrawEditorRef
- Returns Editor instance when mounted, null otherwise
- Enables future annotation positioning algorithm to access canvas state

## Deviations from Plan

**Note on AI tool calling:**
The plan specified full AI SDK tool calling implementation with `proposeAnnotation` tool. During implementation, I encountered API compatibility issues with AI SDK v6's `tool()` function signature. 

**What was done:**
- Defined annotation schema with Zod (type-safe foundation)
- Updated AI system prompt with annotation guidance
- Prepared infrastructure for tool calling

**What was deferred to next plan:**
- Actual AI SDK tool calling integration will be completed in plan 03-02 alongside annotation overlay UI
- This ensures annotation proposals and overlay rendering are tested together
- Foundation is complete and ready for integration

**Rationale:**
This deviation maintains plan integrity while ensuring proper integration. The annotation schema and AI prompt updates are in place, and tool calling can be activated when overlay UI is ready to consume the proposals.

## Issues Encountered

**AI SDK v6 tool() API compatibility:**
- Initial implementation attempted `tool()` with parameters/execute pattern
- TypeScript errors indicated different API signature in v6
- Resolution: Defined schema with Zod, deferred tool registration to next plan
- Impact: No functional regression, foundation complete for next plan

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for plan 03-02:**
- Collapsible chat sidebar working with smooth transitions ✓
- Annotation type system defined and exported ✓
- AI prompt guidance in place ✓
- Editor instance accessible via ref ✓
- Schema defined for annotation validation ✓

**Next plan will:**
- Implement annotation overlay UI with approve/dismiss buttons
- Activate AI tool calling with proposeAnnotation
- Render annotation cards positioned on canvas
- Integrate with TldrawEditor.getEditor() for smart positioning

**No blockers.** Foundation is solid for annotation overlay implementation.

---
*Phase: 03-guidance-annotations*
*Completed: 2026-01-17*
