# Phase 2: Problem Input & AI Integration - Plan 02-03 Context

**Gathered:** 2026-01-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement automatic canvas screenshot capture with intelligent debouncing that sends canvas snapshots to AI for Socratic analysis when the user pauses drawing. AI receives both the original problem context AND current canvas state to provide guidance.

This plan integrates the canvas (from Phase 1) with the chat system (from 02-02) to enable AI analysis of visual work.

</domain>

<decisions>
## Implementation Decisions

### Behavior — Debouncing & Screenshot Triggering
- **Debounce timing:** 3-5 seconds (long pause)
  - Only triggers when user truly pauses to think
  - Minimizes interruptions, ensures meaningful analysis moments
  - Not on every stroke - only deliberate pauses
- **Interruption handling:** Cancel and restart timer
  - If user resumes drawing before AI finishes analyzing, cancel the current analysis
  - Start fresh debounce timer from the new activity
  - Keeps analysis focused on the latest work, avoids analyzing stale screenshots
- **Visual feedback:** Subtle indicator
  - Show "Analyzing canvas..." or similar status indicator when screenshot is captured
  - Display in chat area or as small notification
  - User should know when AI is looking at their work

### UX — User Awareness & Control
- **Manual control:** Automatic only
  - No manual trigger button
  - AI analyzes based on pause detection only
  - Simpler UX, less cognitive load
- **Disable option:** Always on
  - Auto-analysis is core feature, always active
  - No toggle to disable
  - Simpler implementation, reinforces AI-guided learning model

### Behavior — AI Analysis Strategy
- **Commentary approach:** Proactive
  - AI automatically analyzes canvas and offers observations/Socratic questions
  - Don't wait for user to ask - AI takes initiative
  - Example: "I notice you started by drawing X... what does that represent?"
- **Problem context comparison:** Claude's discretion
  - AI should reference original problem when analyzing canvas
  - Decide when explicit comparison is relevant vs when to focus on current work
- **Image quality:** Claude's discretion
  - Balance screenshot quality vs payload size/API costs
  - Must be readable for AI to analyze effectively

</decisions>

<specifics>
## Specific Ideas

- AI should take initiative in guidance - this is a tutor, not a passive assistant
- Long debounce (3-5s) ensures AI comments at meaningful moments, not mid-thought
- Cancel-on-resume pattern keeps analysis fresh and relevant to current work
- Subtle feedback keeps user aware without being intrusive

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-problem-input---ai-integration*
*Context gathered: 2026-01-17*
