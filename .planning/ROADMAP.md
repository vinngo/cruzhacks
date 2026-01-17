# Roadmap

**Project:** Socratic Whiteboard
**Created:** 2025-01-16
**Phases:** 3

## Overview

This roadmap delivers a working AI-powered math tutoring demo in 3 phases over ~48 hours. Phase 1 establishes the canvas workspace, Phase 2 connects AI analysis to user input, and Phase 3 implements Socratic guidance via chat and canvas annotations. The structure follows natural build dependencies: canvas must exist before AI can analyze it, and AI analysis must work before proposing annotations.

## Phases

### Phase 1: Foundation & Canvas

**Goal:** User has a functional workspace with a working tldraw canvas for problem-solving
**Depends on:** Nothing (first phase)
**Requirements:** INIT-01, INIT-04, WORK-01, WORK-02, WORK-04, CANV-01, CANV-03, CANV-04

**Success Criteria:**
1. User sees landing page with centered chat input on initial load
2. User transitions to workspace view with three-panel layout (problem panel, canvas, chat area)
3. User can draw, write, and erase freely on tldraw canvas
4. Canvas retains all user work during session without data loss
5. Workspace provides clear visual hierarchy with canvas as primary focus

**Plans:** 4 plans

Plans:
- [x] 01-01-PLAN.md — Project foundation (Next.js + dependencies + Tailwind)
- [x] 01-02-PLAN.md — Landing page with chat input and page transitions
- [x] 01-03-PLAN.md — Workspace layout and tldraw canvas integration
- [x] 01-04-PLAN.md — Navigation integration and user flow verification

---

### Phase 2: Problem Input & AI Integration

**Goal:** AI receives and analyzes user's math problem and canvas work using Socratic method
**Depends on:** Phase 1
**Requirements:** INIT-02, INIT-03, CANV-02, AI-01, AI-02, AI-03, AI-04

**Success Criteria:**
1. User can describe math problem via text input on landing page
2. User can upload image of math problem from landing page
3. Original problem displays in problem reference panel in workspace
4. AI receives canvas screenshot automatically when user pauses drawing
5. AI analyzes canvas work against original problem and generates guiding questions (not answers)
6. AI maintains conversation context across multiple interactions

**Plans:** 3 plans

Plans:
- [x] 02-01-PLAN.md — Problem input with text/image toggle and state management
- [ ] 02-02-PLAN.md — AI chat system with streaming responses and initial greeting
- [ ] 02-03-PLAN.md — Canvas screenshot capture with debounced AI analysis

---

### Phase 3: Guidance & Annotations

**Goal:** AI provides Socratic guidance through chat responses and interactive canvas annotations
**Depends on:** Phase 2
**Requirements:** AI-05, WORK-03, ANNO-01, ANNO-02, ANNO-03, ANNO-04, ANNO-05, ANNO-06

**Success Criteria:**
1. User receives AI's Socratic questions in collapsible chat sidebar
2. AI proposes text question annotations that appear on canvas with approve/dismiss buttons
3. AI proposes hint/scaffolding annotations (partial equations, next steps) on canvas
4. AI positions proposed annotations to avoid overlapping user's existing canvas work
5. User can approve annotation to add it to canvas via tldraw API
6. User can dismiss annotation to remove it without leaving traces
7. Complete demo flow: user submits problem, works on canvas, receives guidance, solves problem

**Plans:** 3 plans

Plans:
- [ ] 03-01-PLAN.md — Collapsible chat sidebar + AI structured annotation proposals
- [ ] 03-02-PLAN.md — Annotation overlay UI with approve/dismiss + smart positioning
- [ ] 03-03-PLAN.md — Canvas integration (approve/dismiss handlers) + demo verification

---

## Progress

| Phase | Status | Completed |
|-------|--------|-----------|
| 1 - Foundation & Canvas | Complete | 2026-01-16 |
| 2 - Problem Input & AI Integration | In progress | — |
| 3 - Guidance & Annotations | Not started | — |

---

*Roadmap for milestone: v1.0 (hackathon demo)*
