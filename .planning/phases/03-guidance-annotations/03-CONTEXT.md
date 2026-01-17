# Phase 3: Guidance & Annotations - Context

**Gathered:** 2026-01-17
**Status:** Ready for planning

<domain>
## Phase Boundary

AI provides Socratic guidance through chat responses and interactive canvas annotations. Users receive AI-proposed annotations (questions and hints/scaffolding) that appear on the canvas with approve/dismiss controls. Approved annotations are added to the tldraw canvas. Chat sidebar is collapsible for flexible workspace layout.

</domain>

<decisions>
## Implementation Decisions

### UI — Chat Sidebar
- User controls only — no auto-collapse behavior
- When collapsed: slides off-screen with visible edge/tab for pulling back
- User can toggle open/closed at will

### UI — Annotation Appearance
- Floating cards with shadows positioned near relevant canvas areas
- Card-style overlays, not tooltips or edge panels
- Approve/dismiss buttons: Icon buttons (checkmark for approve, X for dismiss)
- Minimal and clean button styling

### UX — Annotation Interaction Flow
- Show all proposed annotations at once (not one-by-one or queued)
- After approve: card disappears immediately (annotation now on canvas via tldraw)
- After dismiss: card disappears immediately (no confirmation, clean removal)
- No "are you sure" dialogs — direct interactions

### Claude's Discretion
- Smart positioning algorithm details (avoiding overlap logic)
- Exact shadow/spacing/typography for annotation cards
- Animation timing for expand/collapse and card removal
- When AI proposes annotations (timing relative to canvas changes)
- Limit on max annotations shown at once (if needed)
- Types of hints/scaffolding beyond text questions

</decisions>

<specifics>
## Specific Ideas

None — user focused on clear interaction patterns without specific product references.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-guidance-annotations*
*Context gathered: 2026-01-17*
