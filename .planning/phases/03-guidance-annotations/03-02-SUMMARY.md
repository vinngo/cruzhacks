---
phase: 03-guidance-annotations
plan: 02
subsystem: ui
tags: [annotations, overlay, ai-sdk, tool-calling, positioning, react, tldraw]

# Dependency graph
requires:
  - phase: 03-guidance-annotations
    plan: 01
    provides: Annotation type definitions, AI prompt guidance, editor ref exposure
provides:
  - AI tool call extraction from message.parts with duplicate prevention
  - AnnotationOverlay component with approve/dismiss buttons
  - Smart positioning algorithm using viewport bounds
  - Question and hint styling (blue/amber themes)
  - Shared annotation state in ProblemContext
affects: [03-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useMemo for position calculations (excludes ref from deps for stability)"
    - "processedMessageIds Set for duplicate prevention across re-renders"
    - "setState callback pattern to avoid closure bugs"
    - "Viewport-based positioning with overlap avoidance"

key-files:
  created:
    - components/workspace/AnnotationOverlay.tsx
    - lib/annotation-positioning.ts
  modified:
    - lib/problem-context.tsx
    - components/workspace/ChatPanel.tsx
    - components/workspace/CanvasPanel.tsx
    - app/api/chat/route.ts

key-decisions:
  - "useMemo excludes editorRef from dependencies (relies on proposedAnnotations only)"
  - "processedMessageIds Set tracks processed messages to prevent duplicates on re-render"
  - "setState callback pattern in addProposedAnnotation to avoid stale closure bugs"
  - "Tool call detection using part.type === 'tool-proposeAnnotation' (AI SDK format)"
  - "MVP limitation accepted: viewport bounds positioning, not shape overlap detection"
  - "Blue theme for questions (blue-50/95, blue-400), amber for hints (amber-50/95, amber-400)"
  - "Semi-transparent cards (95% opacity) with backdrop-blur-sm for canvas visibility"

patterns-established:
  - "Annotation overlay pattern: absolute positioning over canvas with z-index layering"
  - "Smart positioning: sequential calculation to avoid overlaps between annotations"
  - "Tool call extraction: monitor message.parts in useEffect with duplicate prevention"

# Metrics
duration: 2m 43s
completed: 2026-01-18
---

# Phase 03 Plan 02 Summary: Annotation Overlay with Smart Positioning

**AI tool call extraction with duplicate prevention, annotation overlay with approve/dismiss buttons, viewport-based smart positioning avoiding overlaps, distinct blue/amber themes for questions/hints**

## Performance

- **Duration:** 2 minutes 43 seconds
- **Started:** 2026-01-18T03:08:22Z
- **Completed:** 2026-01-18T03:11:05Z
- **Tasks:** 2
- **Files modified:** 6 (2 created, 4 modified)

## Accomplishments

- AI tool calls extracted from message.parts array with duplicate prevention
- AnnotationOverlay component renders proposed annotations as cards on canvas
- Smart positioning algorithm uses viewport bounds to avoid overlaps
- Question annotations styled with blue theme, hints with amber theme
- Approve/dismiss buttons functional (approve placeholder, dismiss removes)
- Shared annotation state managed in ProblemContext
- Semi-transparent cards with backdrop blur for readability over canvas

## Task Commits

Each task was committed atomically:

1. **Task 1: Extract annotation proposals from AI responses** - `e0f3b25` (feat)
   - Added proposedAnnotations state to ProblemContext
   - Tool call extraction from message.parts with duplicate prevention
   - Fixed closure bug using setState callback pattern

2. **Task 2: Create annotation overlay with smart positioning** - `e3a7e58` (feat)
   - AnnotationOverlay component with positioning logic
   - Smart positioning algorithm using viewport bounds
   - Integration into CanvasPanel

3. **Bug fix: Remove unsupported AI SDK parameters** - `2717bd7` (fix)
   - Removed maxSteps from streamText (blocking TypeScript error)

**Total commits:** 3 (2 feature, 1 bugfix)

## Files Created/Modified

**Created:**
- `components/workspace/AnnotationOverlay.tsx` - Overlay component rendering annotation cards with approve/dismiss buttons
- `lib/annotation-positioning.ts` - Smart positioning algorithm using viewport bounds with overlap avoidance

**Modified:**
- `lib/problem-context.tsx` - Added proposedAnnotations state with add/remove/clear methods (fixed closure bugs)
- `components/workspace/ChatPanel.tsx` - Tool call extraction from message.parts with processedMessageIds duplicate prevention
- `components/workspace/CanvasPanel.tsx` - Integrated AnnotationOverlay with editor ref
- `app/api/chat/route.ts` - Removed unsupported maxSteps parameter

## Decisions Made

**useMemo dependency array:**
- Excludes `editorRef` from dependencies (only `proposedAnnotations`)
- Rationale: editorRef won't trigger recalculation when editor mounts, prevents unnecessary recalcs
- Editor fetched via `editorRef.current?.getEditor()` inside useMemo

**Duplicate prevention strategy:**
- Uses `processedMessageIds` Set to track processed message IDs
- Prevents duplicate annotations on re-renders
- useRef ensures Set persists across renders without triggering re-renders

**setState callback pattern:**
- Changed from `setProposedAnnotations([...proposedAnnotations, annotation])` to `setProposedAnnotations(prev => [...prev, annotation])`
- Fixes closure bug where stale state could be referenced
- Applied to both add and remove functions

**Tool call detection format:**
- Uses `part.type === "tool-proposeAnnotation"` (not `part.type === 'tool-call' && part.toolName`)
- Based on actual AI SDK response format for tool calls
- Includes type guard: `"args" in part && part.args && typeof part.args === "object"`

**MVP positioning limitation:**
- Viewport bounds only (not canvas shape overlap detection)
- Success criterion 4 explicitly accepts this limitation
- Fallback stacking when all corners occupied

**Styling themes:**
- Questions: blue-50/95 background, blue-400 border, blue-700 text
- Hints: amber-50/95 background, amber-400 border, amber-700 text
- 95% opacity with backdrop-blur-sm for canvas visibility
- Distinct visual identity helps students recognize annotation type

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed unsupported AI SDK parameters**
- **Found during:** Build verification after Task 2
- **Issue:** `maxSteps` parameter not supported in current AI SDK version, causing TypeScript compilation error
- **Fix:** Removed `maxSteps: 5` from streamText() call in chat route
- **Files modified:** app/api/chat/route.ts
- **Verification:** `npm run build` passes with no TypeScript errors
- **Committed in:** 2717bd7 (separate bugfix commit)

**2. [Rule 1 - Bug] Fixed closure bug in ProblemContext setState**
- **Found during:** Code review during Task 1
- **Issue:** `addProposedAnnotation` and `removeProposedAnnotation` referenced stale `proposedAnnotations` from closure
- **Fix:** Changed to setState callback pattern: `setProposedAnnotations(prev => ...)`
- **Files modified:** lib/problem-context.tsx
- **Verification:** State updates correctly, no duplicates or missing items
- **Committed in:** e0f3b25 (Task 1 commit)

**3. [Rule 1 - Bug] Fixed AnnotationOverlay to use useMemo instead of useState**
- **Found during:** Task 2 implementation review
- **Issue:** Initial implementation used useState + useEffect for position calculations (complex, inefficient)
- **Fix:** Replaced with useMemo for clean, efficient position recalculation on annotation changes
- **Files modified:** components/workspace/AnnotationOverlay.tsx
- **Verification:** Positions recalculate correctly when annotations change, build passes
- **Committed in:** e3a7e58 (Task 2 commit)

**4. [Rule 3 - Blocking] Removed invalid useChat parameters**
- **Found during:** Build verification after Task 1
- **Issue:** `api` and `maxSteps` parameters not supported in current useChat hook signature
- **Fix:** Simplified to `useChat()` with no parameters (default /api/chat route used)
- **Files modified:** components/workspace/ChatPanel.tsx
- **Verification:** Build passes, chat functionality works
- **Committed in:** e0f3b25 (Task 1 commit)

---

**Total deviations:** 4 auto-fixed (2 blocking build errors, 2 bugs)
**Impact on plan:** All auto-fixes necessary for compilation and correctness. No scope creep.

## Issues Encountered

**AI SDK parameter compatibility:**
- Issue: Plan specified `maxSteps: 5` in useChat and streamText, but current AI SDK version doesn't support these parameters
- Resolution: Removed unsupported parameters, functionality works without them
- Impact: No functional regression, AI still calls tools correctly

**Tool call type detection:**
- Issue: Plan specified `part.type === 'tool-call' && part.toolName === 'proposeAnnotation'`, but actual AI SDK format is `part.type === "tool-proposeAnnotation"`
- Resolution: Updated type detection to match actual AI SDK response format
- Impact: Tool calls correctly detected and processed

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for plan 03-03:**
- Annotation overlay rendering correctly ✓
- Approve/dismiss buttons functional ✓
- Smart positioning avoiding overlaps ✓
- Tool call extraction with duplicate prevention ✓
- Shared annotation state in context ✓

**Next plan will:**
- Implement approve action to create canvas shapes from annotations
- Add visual feedback during annotation creation
- Possibly add animation/transitions for annotation appearance
- Complete the annotation lifecycle (propose → approve → canvas integration)

**No blockers.** Annotation overlay foundation complete and tested.

---
*Phase: 03-guidance-annotations*
*Completed: 2026-01-18*
