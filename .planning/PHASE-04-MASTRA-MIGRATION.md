# Phase 4: Mastra Framework Migration

**Status:** In Progress
**Started:** 2026-02-12
**Goal:** Migrate from simple LLM calls to production-ready Mastra architecture

---

## Overview

Transition from MVP hackathon demo (simple Vercel AI SDK) to production-ready architecture using Mastra framework for scalability, observability, and extensibility.

### Current Architecture (Phase 3)
```
ChatPanel → /api/chat → streamText (Vercel AI SDK) → Claude
                       ↓
                  proposeAnnotation tool (inline)
```

**Issues:**
- Canvas screenshot sent with every request (~2000-5000 tokens)
- No structured tutoring process enforcement
- No session tracking or analytics
- Limited observability
- Hard to extend with new features

### Target Architecture (Phase 4)
```
ChatPanel → /api/mastra/tutor → Tutor Workflow
                                 ↓
                            [5-Step Process]
                                 ↓
                            Tutor Agent
                                 ↓
                          Tools + Memory
                                 ↓
                          Canvas Storage
```

**Benefits:**
- 75% reduction in token usage (stateful canvas storage)
- Structured 5-step tutoring process
- Quality control (Socratic method validation)
- Session metrics and analytics
- Full observability in Mastra Studio
- Easy to extend with new features

---

## Implementation Tasks

### ✅ Completed
- [x] Architecture design
- [x] Migration guide created (MASTRA_MIGRATION_GUIDE.md)
- [x] Project state updated
- [x] Mastra packages installed (v1.3.0)

### 🚧 In Progress

#### Task 1: Canvas Storage Layer
**File:** `lib/canvas-storage.ts`

**Requirements:**
- Store canvas snapshots by conversation ID
- Track snapshot history (last 50 snapshots)
- Session metrics (duration, analyses, annotations, completion)
- Cleanup methods for session management

**Key Methods:**
- `saveSnapshot(conversationId, screenshot, metadata)`
- `getCurrentSnapshot(conversationId)`
- `getHistory(conversationId)`
- `updateMetrics(conversationId, updates)`
- `getMetrics(conversationId)`

**Storage Backend:** LibSQL (mastra.db)

---

#### Task 2: Mastra Tools
**Files:**
- `mastra/tools/propose-annotation-tool.ts`
- `mastra/tools/view-whiteboard-tool.ts`

**proposeAnnotation Tool:**
- Input: `{ type: 'question' | 'hint', text: string, positionHint?: string }`
- Output: `{ success: boolean, annotationId: string, ... }`
- Execution: Return data for client-side annotation creation

**viewWhiteboard Tool:**
- Input: `{ conversationId: string, analysis?: 'full' | 'changes-only' }`
- Output: `{ success: boolean, screenshot?: string, timestamp?: number }`
- Execution: Retrieve current canvas snapshot from storage

---

#### Task 3: Tutor Agent Update
**File:** `mastra/agents/tutor-agent.ts`

**Changes:**
- Import and attach tools (proposeAnnotation, viewWhiteboard)
- Update instructions to use tools
- Keep Memory instance
- Use `anthropic/claude-haiku-4.5` model

---

#### Task 4: Tutor Workflow
**File:** `mastra/workflows/tutor-workflow.ts`

**5-Step Process:**

1. **Initialize Session**
   - Validate problem input
   - Set up session context
   - Initialize metrics

2. **Analyze Canvas**
   - Retrieve current snapshot from storage
   - Build structured analysis prompt
   - Update analysis count

3. **Generate Guidance**
   - Call tutor agent with structured prompt
   - Agent uses viewWhiteboard + proposeAnnotation tools
   - Extract guidance and tool call counts

4. **Quality Check**
   - Validate no direct answers given
   - Check for Socratic questions
   - Verify annotation count reasonable
   - Flag issues/warnings

5. **Track Progress**
   - Update session metrics
   - Detect completion indicators
   - Calculate session duration

**Workflow Trigger Schema:**
```typescript
{
  problemText?: string;
  problemImageUrl?: string;
  conversationId: string;
  action: 'initialize' | 'analyze' | 'full';
}
```

---

#### Task 5: Register in Mastra
**File:** `mastra/index.ts`

**Changes:**
- Import tutorWorkflow
- Add to workflows object: `{ weatherWorkflow, tutorWorkflow }`
- Verify tutorAgent already registered in agents

---

#### Task 6: New API Route
**File:** `app/api/mastra/tutor/route.ts`

**Responsibilities:**
- Handle POST requests with messages, problem, screenshot
- Generate/track conversation ID
- Store canvas screenshot (if provided)
- Execute tutor workflow
- Return guidance + metadata to client

**Request Body:**
```typescript
{
  messages: UIMessage[];
  problem: { text?: string; imageUrl?: string };
  screenshot?: string;
  conversationId?: string;
  action?: 'initialize' | 'analyze' | 'full';
}
```

**Response:**
```typescript
{
  conversationId: string;
  guidance: string;
  metadata: {
    annotationsProposed: number;
    viewedCanvas: boolean;
    qualityPassed: boolean;
    qualityWarnings: string[];
    isComplete: boolean;
    sessionDuration: number;
  };
}
```

---

#### Task 7: Update ChatPanel
**File:** `components/workspace/ChatPanel.tsx`

**Changes:**
- Update useChat API endpoint: `/api/mastra/tutor`
- Add conversation ID tracking (useRef)
- Include conversationId in all sendMessage calls
- Pass action type: 'initialize' for first message, 'analyze' for rest

**No UI Changes Required:**
- Keep existing debouncing logic (5 seconds)
- Keep existing annotation handling
- Keep existing message rendering
- Maintain same UX

---

#### Task 8: Testing & Validation
**Checklist:**

- [ ] Start Mastra Studio (`npm run dev`)
- [ ] Verify tutorWorkflow appears in Studio
- [ ] Test initial greeting
  - Expected: AI greets, asks opening question
  - Studio: See workflow execution, no tool calls
- [ ] Test canvas screenshot analysis
  - Draw on canvas, wait 5+ seconds
  - Expected: AI analyzes, proposes annotations
  - Studio: See viewWhiteboard + proposeAnnotation tool calls
- [ ] Test file uploads in chat
  - Upload image/PDF with message
  - Expected: AI sees file, responds appropriately
  - Studio: Message includes image content
- [ ] Test memory persistence
  - Multi-turn conversation referencing earlier context
  - Expected: AI remembers previous messages
  - Studio: Memory operations logged
- [ ] Verify token usage reduction
  - Compare request sizes before/after
  - Expected: ~75% reduction in payload size
- [ ] Check quality control
  - Verify no direct answers in responses
  - Expected: Quality check passes, warnings logged if needed
  - Studio: Quality step shows pass/fail status
- [ ] Test session metrics
  - Complete a full problem-solving session
  - Expected: Metrics tracked (duration, annotations, completion)
  - Storage: Metrics retrievable via canvasStorage.getMetrics()

---

## Architecture Benefits

### Scalability
- **Token Efficiency:** 75% reduction through stateful storage
- **Performance:** Constant request size regardless of conversation length
- **Cost:** Lower API costs due to reduced token usage

### Quality & Observability
- **Structured Process:** 5-step workflow ensures consistency
- **Quality Control:** Automatic Socratic method validation
- **Full Visibility:** Every step traced in Mastra Studio
- **Metrics:** Session tracking, analytics, completion detection

### Extensibility
- **Easy Feature Additions:** Add workflow steps without refactoring
- **Tool Modularity:** New tools plug in cleanly
- **Multi-Agent Ready:** Foundation for adding more agents later
- **Canvas History:** Track evolution, enable replay features

---

## Migration Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing UX | High | Maintain same ChatPanel interface, test thoroughly |
| Tool call format differences | Medium | Test tool detection logic, update if needed |
| Storage performance | Low | LibSQL is fast, monitor in Studio |
| Workflow complexity | Medium | Start simple, iterate based on Studio traces |
| Message format mismatches | Medium | Verify Mastra message format, test edge cases |

---

## Success Metrics

1. **Token Reduction:** ≥70% reduction in average request size
2. **Quality:** 100% of responses pass Socratic method check
3. **Performance:** Response latency ≤ current implementation
4. **UX:** Zero breaking changes for end users
5. **Observability:** All sessions fully traced in Studio
6. **Completion Rate:** Track % of sessions that solve problem

---

## Future Enhancements (Post-Migration)

Once Phase 4 is complete, these become easy additions:

1. **Canvas History & Replay**
   - Store full canvas evolution
   - Enable "replay session" feature
   - Show student progress over time

2. **Adaptive Difficulty**
   - Workflow step to adjust question complexity
   - Based on student performance metrics

3. **Hint Escalation**
   - If student stuck > 5 min, provide more direct hints
   - Workflow branch based on time elapsed

4. **Multi-Student Collaboration**
   - Multiple conversation IDs share same canvas
   - Annotations from different tutors

5. **Analytics Dashboard**
   - Session completion rates
   - Average time to solve
   - Common sticking points
   - Annotation effectiveness

6. **Assessment Agent**
   - Separate agent to evaluate final solution
   - Provide summary of learning points

---

## Notes

- All existing migration guidance in `MASTRA_MIGRATION_GUIDE.md`
- Mastra skill available: `/mastra` for documentation
- Current Mastra version: 1.3.0
- Use `anthropic/claude-haiku-4.5` for consistency

---

*Last updated: 2026-02-12*
