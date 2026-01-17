# Phase 2: Problem Input & AI Integration - Context

**Gathered:** 2026-01-16 (updated 2026-01-16 after 02-01 implementation)
**Status:** Ready for planning

<domain>
## Phase Boundary

Enable users to submit math problems (text or image) from the landing page, display the problem in the workspace reference panel, automatically capture canvas screenshots when user pauses drawing, and have AI analyze the canvas work to generate Socratic guiding questions (not answers) while maintaining conversation context.

This phase does NOT include: canvas annotations, chat UI in workspace sidebar (text responses only), or answer generation.

</domain>

<decisions>
## Implementation Decisions

### UI - Problem Input
- Single text input field with image upload button (ChatGPT-style with paperclip/image icon)
- User can type text OR upload image, not both simultaneously
- When image is uploaded, it replaces the text input entirely
- Show image preview when uploaded, hide text field
- User submits either text description or image as their problem

### Image Handling
- Store uploaded images as client-side object URLs using `URL.createObjectURL()`
- Keep both the File object (for potential AI upload) and the object URL (for display)
- Object URL enables immediate preview on landing page and display in workspace ProblemPanel
- Session-only persistence (URLs expire on page refresh, no server upload in Phase 2)
- Image displays in ProblemPanel using the object URL from context

### Behavior - Canvas Screenshot Capture
- Trigger: Debounced after user pauses drawing/editing
- Debounce timing: 2-3 seconds after last canvas change
- Automatic capture when pause threshold is met
- No manual trigger button needed for this phase

### UX - AI Response Timing & Feedback
- Show "AI is analyzing..." indicator in chat area immediately after screenshot capture
- If user continues drawing during analysis: cancel in-flight request, queue new analysis after debounce
- Latest canvas state is always most relevant — don't process stale screenshots
- AI response appears in chat area when ready

### Content - Question Format
- One Socratic question at a time, conversational style
- Natural dialogue flow like a tutoring session
- User can respond before AI asks next question
- Questions guide thinking, never provide direct answers

### AI Architecture
- Use simple `generateText` (Vercel AI SDK) for Phase 2
- Save `ToolLoopAgent` pattern for Phase 3 when annotation tools are added
- Streaming responses for better UX

### Chat Area UI
- Right sidebar position (problem left | canvas center | chat right)
- Panel proportions: 20% problem | 60% canvas | 20% chat
- Always visible (not collapsible) for Phase 2 simplicity
- Vertical scrolling for chat history

### User Interaction
- Chat input field at bottom of chat sidebar
- User can respond to AI via text messages OR by working on canvas
- Two independent triggers for AI responses:
  1. Canvas pause (2-3 sec debounce) → AI analyzes canvas state
  2. User sends text message → AI responds to text
- Send button or Enter key submits text messages

### AI Context Awareness
- AI always sees full context: original problem + chat history + current canvas screenshot
- Canvas-triggered responses: analyze canvas work against problem
- Text-triggered responses: respond to user's question/comment with canvas awareness
- Maintains conversation continuity across both trigger types

### Initial Workspace Behavior
- AI proactively sends greeting/scaffolding question immediately when user enters workspace
- Opening question examples: "What information does this problem give you?" or "Where would you like to start?"
- Invites thinking without being prescriptive
- User can respond via text OR by starting to draw

### Claude's Discretion
- Exact wording of "analyzing" indicator
- Error handling for API failures
- Canvas screenshot resolution and quality
- Message display format (user vs AI message styling)
- Chat input placeholder text
- Specific AI provider and model (OpenAI GPT-4, Claude, etc.)

</decisions>

<specifics>
## Specific Ideas

- ChatGPT-style input: familiar pattern users already understand
- 2-3 second debounce: balance between responsiveness and avoiding mid-thought captures
- Cancel old requests: waste prevention, always analyze current state
- Conversational one-at-a-time questions: mimics real tutoring session dynamic
- Right sidebar chat: natural reading flow (problem → canvas → guidance)
- 20/60/20 split: canvas gets majority of space, balanced sidebars
- Dual triggers: canvas AND text both valid ways to engage with AI
- Proactive greeting: AI initiates conversation to help students who don't know where to start
- Full context awareness: AI sees everything (problem, chat, canvas) for coherent tutoring

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-problem-input---ai-integration*
*Context gathered: 2026-01-16*
