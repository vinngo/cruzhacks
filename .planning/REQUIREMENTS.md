# Requirements: Socratic Whiteboard

**Defined:** 2025-01-16
**Core Value:** The AI guides through questions, not answers. Students learn by being nudged toward discovery, not told what to do.

## v1 Requirements

Requirements for hackathon demo. Each maps to roadmap phases.

### Initial Experience

- [x] **INIT-01**: User sees landing page with centered chat input (ChatGPT/Claude style)
- [x] **INIT-02**: User can describe math problem via text in chat input
- [x] **INIT-03**: User can upload image of math problem
- [x] **INIT-04**: User transitions to workspace view after submitting problem

### Canvas

- [x] **CANV-01**: User can draw and write freely on tldraw canvas
- [ ] **CANV-02**: Canvas captures screenshot when user pauses (debounced)
- [x] **CANV-03**: Canvas state persists during session
- [x] **CANV-04**: tldraw provides standard drawing tools (pen, shapes, eraser)

### AI Analysis

- [ ] **AI-01**: AI receives canvas screenshot on user pause
- [ ] **AI-02**: AI analyzes current work against original problem
- [ ] **AI-03**: AI generates Socratic questions (guides, not answers)
- [ ] **AI-04**: AI maintains conversation context across chat and canvas
- [ ] **AI-05**: AI responds in chat sidebar with context-aware questions

### Annotations

- [ ] **ANNO-01**: AI proposes text question annotations on canvas
- [ ] **ANNO-02**: AI proposes hint/scaffolding annotations (partial equations, next steps)
- [ ] **ANNO-03**: Proposed annotations appear with inline approve/dismiss buttons
- [ ] **ANNO-04**: AI positions annotations to avoid overlapping user's work
- [ ] **ANNO-05**: Approved annotations render on canvas via tldraw API
- [ ] **ANNO-06**: Dismissed annotations are removed without trace

### Workspace

- [x] **WORK-01**: Problem reference panel displays original problem
- [x] **WORK-02**: Main canvas area shows tldraw workspace
- [ ] **WORK-03**: Collapsible chat sidebar for AI conversation
- [x] **WORK-04**: Layout provides clear visual hierarchy (canvas primary)

## v2 Requirements

Deferred to future iterations. Tracked but not in current roadmap.

### Enhanced Features

- **CANV-05**: Export canvas to PDF
- **CANV-06**: Undo/redo history viewer
- **AI-06**: Multi-step problem planning
- **AI-07**: Adaptive difficulty adjustment
- **ANNO-07**: Collaborative annotations (multiple users)
- **WORK-05**: Customizable layout preferences
- **WORK-06**: Dark mode support

### Persistence

- **PERS-01**: User accounts and authentication
- **PERS-02**: Save problem sessions
- **PERS-03**: Problem history/library
- **PERS-04**: Resume incomplete problems

### Multi-Subject

- **SUBJ-01**: Science problem support
- **SUBJ-02**: Writing/essay guidance
- **SUBJ-03**: Programming tutoring

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| User accounts/auth | Hackathon demo doesn't require persistence |
| Multi-subject beyond math | Keeps demo focused, math is sufficient for education track |
| Mobile optimization | Desktop demo is sufficient for judging |
| Real-time collaboration | Adds complexity, single-user is enough |
| Arrows/highlights on canvas | Text and hints only for v1, reduces annotation scope |
| Direct error correction | Socratic questioning handles via conversation |
| Problem library/templates | Not needed for demo flow |
| Session recording/playback | Nice-to-have, not core value |
| Custom AI model training | Use off-the-shelf LLM via Vercel AI SDK |

## Traceability

Which phases cover which requirements. Updated by create-roadmap.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INIT-01 | Phase 1 | Complete |
| INIT-02 | Phase 2 | Complete |
| INIT-03 | Phase 2 | Complete |
| INIT-04 | Phase 1 | Complete |
| CANV-01 | Phase 1 | Complete |
| CANV-02 | Phase 2 | Pending |
| CANV-03 | Phase 1 | Complete |
| CANV-04 | Phase 1 | Complete |
| AI-01 | Phase 2 | Pending |
| AI-02 | Phase 2 | Pending |
| AI-03 | Phase 2 | Pending |
| AI-04 | Phase 2 | Pending |
| AI-05 | Phase 3 | Pending |
| ANNO-01 | Phase 3 | Pending |
| ANNO-02 | Phase 3 | Pending |
| ANNO-03 | Phase 3 | Pending |
| ANNO-04 | Phase 3 | Pending |
| ANNO-05 | Phase 3 | Pending |
| ANNO-06 | Phase 3 | Pending |
| WORK-01 | Phase 1 | Complete |
| WORK-02 | Phase 1 | Complete |
| WORK-03 | Phase 3 | Pending |
| WORK-04 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 23
- Unmapped: 0

---
*Requirements defined: 2025-01-16*
*Last updated: 2025-01-16 after roadmap creation*
