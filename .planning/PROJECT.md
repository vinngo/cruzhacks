# Socratic Whiteboard

## What This Is

An AI-powered math tutoring app that uses the Socratic method to guide students through problem-solving on a digital canvas. Users describe a math problem, then work it out on a tldraw whiteboard while an AI agent watches their progress and asks guiding questions — both in chat and directly on the canvas — without giving away the answer.

## Core Value

The AI guides through questions, not answers. Students learn by being nudged toward discovery, not told what to do.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can describe a math problem via text or image upload on initial screen
- [ ] User transitions to workspace with problem reference panel, canvas, and chat
- [ ] User can draw/write freely on tldraw canvas to work through problem
- [ ] AI receives canvas screenshots when user pauses (debounced)
- [ ] AI provides Socratic questions in collapsible chat sidebar
- [ ] AI proposes canvas annotations (text questions, hints/scaffolding)
- [ ] Canvas annotations appear with inline approve/dismiss buttons
- [ ] AI positions annotations to avoid overlapping existing canvas elements
- [ ] Chat and canvas annotations share conversation context
- [ ] Demo completes one full problem-solving flow with visible Socratic guidance

### Post-Hackathon Extension (In Progress)

- [ ] Migrate from simple LLM calls to Mastra agent framework
- [ ] Implement stateful canvas storage for scalability
- [ ] Add Mastra workflow for structured tutoring sessions
- [ ] Enable session tracking and analytics
- [ ] Add quality control checks for Socratic method adherence
- [ ] Implement canvas history and evolution tracking

### Out of Scope (Current)

- Multi-subject support beyond math — focus on math tutoring first
- User accounts/persistence — use session-based storage for now
- Mobile optimization — desktop is primary target
- Arrows/highlights on canvas — text and hints only for v1
- Error correction annotations — Socratic questioning handles this via chat

## Context

**Status:** Post-hackathon production extension

**Original Hackathon (Completed):**
- Education track: Socratic method, adaptive to any math level
- UX subtrack: Canvas-first design, non-intrusive guidance, clean transitions
- Vercel subtrack: AI SDK integration, streaming responses

**Current Phase:** Production extension with Mastra framework integration

**User flow:**
1. Landing page with centered chat input (ChatGPT/Claude style)
2. User describes math problem (text or uploads image)
3. Workspace appears: problem panel (left) + canvas (center) + collapsible chat (right)
4. User works on canvas
5. When user pauses, AI takes screenshot, analyzes progress against original problem
6. AI responds in chat with Socratic question AND/OR proposes canvas annotation
7. User approves/dismisses annotation inline
8. Loop until problem solved

**Canvas as source of truth:** The AI uses screenshots as EYES to see work, tldraw APIs as HANDS to annotate. All meaningful interaction happens on/around the canvas.

## Constraints

- **Tech stack**: Next.js, TypeScript, Tailwind, tldraw, Mastra framework, Vercel AI SDK
- **Architecture**: Mastra workflow + agent + stateful storage for scalability
- **Focus**: Production-ready features with observability and extensibility

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Canvas-first with collapsible chat | UX track requires clean, focused interface | — Pending |
| Inline approve/dismiss for annotations | Non-intrusive, keeps user in flow | — Pending |
| Problem in side panel, not on canvas | Canvas stays pure workspace for user's work | — Pending |
| Debounced screenshots vs real-time | Balance responsiveness with API costs/latency | — Pending |
| Text + hints only (no arrows/corrections) | Reduces complexity, keeps annotation scope tight | — Pending |

---
*Last updated: 2026-02-12 — Post-hackathon extension phase*
