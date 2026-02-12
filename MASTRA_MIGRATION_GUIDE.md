# Mastra Migration Guide

## Overview

This guide provides step-by-step instructions for migrating from a simple debounced LLM call (using Vercel AI SDK directly) to the Mastra agent framework.

**Current Implementation:**
- Direct Vercel AI SDK usage in `/app/api/chat/route.ts`
- `useChat` hook from `@ai-sdk/react` in ChatPanel
- Time-based debouncing (5-second threshold) for canvas auto-analysis
- Inline tool definition (proposeAnnotation) in API route
- Claude Haiku model via Anthropic

**Target Implementation:**
- Mastra-powered agent with Memory
- Clean tool separation
- Built-in observability via Mastra Studio
- Same UX, better architecture

---

## Prerequisites

- Mastra 1.3.0+ installed
- Node.js and npm/bun
- Basic understanding of TypeScript and Next.js

---

## Task #1: Create proposeAnnotation Tool

### Location
Create: `mastra/tools/propose-annotation-tool.ts`

### Implementation

```typescript
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

/**
 * Tool for proposing annotations on the student's canvas.
 * The AI uses this to add visual guidance (questions/hints) to specific areas.
 */
export const proposeAnnotationTool = createTool({
  id: 'propose-annotation',
  description: 'Propose an annotation (question or hint) to appear on the student\'s canvas. Use this when you want to guide their thinking about a specific part of their work.',

  inputSchema: z.object({
    type: z
      .enum(['question', 'hint'])
      .describe('Type of annotation: question for Socratic questions, hint for scaffolding/partial solutions'),
    text: z
      .string()
      .describe('The annotation text. Keep concise (1-2 sentences max). Questions should be open-ended. Hints should be partial (not complete answers).'),
    positionHint: z
      .enum(['top-left', 'top-right', 'center'])
      .optional()
      .describe('Rough position preference. Algorithm will avoid overlaps.'),
  }),

  outputSchema: z.object({
    success: z.boolean(),
    annotationId: z.string().optional(),
    type: z.enum(['question', 'hint']),
    text: z.string(),
    positionHint: z.enum(['top-left', 'top-right', 'center']).optional(),
  }),

  execute: async ({ type, text, positionHint }) => {
    // Log for debugging
    console.log('🔧 proposeAnnotation tool called:', {
      type,
      text,
      positionHint,
    });

    // Generate a unique annotation ID
    const annotationId = crypto.randomUUID();

    // In Mastra, tool execution happens server-side
    // The actual annotation creation is handled client-side by ChatPanel
    // This tool just returns the data for the client to process
    return {
      success: true,
      annotationId,
      type,
      text,
      positionHint,
    };
  },
});
```

### Key Points
- **`createTool`**: Mastra's standard way to create tools
- **Input/Output schemas**: Define with Zod for type safety
- **Execute function**: Server-side logic; client intercepts tool calls
- **Return format**: Must match `outputSchema`

---

## Task #2: Create viewWhiteboard Tool (Optional)

### Location
Create: `mastra/tools/view-whiteboard-tool.ts`

### Implementation

```typescript
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

/**
 * Tool for the agent to explicitly "view" the current whiteboard state.
 * This is mainly for agent clarity - the screenshot is already sent in the message.
 */
export const viewWhiteboardTool = createTool({
  id: 'view-whiteboard',
  description: 'View the current state of the student\'s whiteboard canvas to analyze their work.',

  inputSchema: z.object({
    requestType: z
      .enum(['analyze', 'check-progress', 'review'])
      .optional()
      .describe('What you want to do with the whiteboard view'),
  }),

  outputSchema: z.object({
    status: z.string(),
    message: z.string(),
  }),

  execute: async ({ requestType = 'analyze' }) => {
    console.log('👁️ viewWhiteboard tool called:', requestType);

    // This tool is mostly semantic - the screenshot is already in the conversation
    // It helps the agent think through "I need to look at the canvas"
    return {
      status: 'success',
      message: 'Canvas screenshot is available in the conversation context. Analyze the student\'s work shown in the image.',
    };
  },
});
```

### Key Points
- **Semantic tool**: Helps agent reasoning, screenshot already in context
- **Optional**: You can skip this if you prefer to keep it simpler
- The TutorAgent references this but it's not strictly necessary

---

## Task #3: Update TutorAgent and Register in Mastra

### Part A: Update TutorAgent

**File**: `mastra/agents/tutor-agent.ts`

```typescript
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { proposeAnnotationTool } from '../tools/propose-annotation-tool';
// Optional: import { viewWhiteboardTool } from '../tools/view-whiteboard-tool';

export const tutorAgent = new Agent({
  id: 'tutor-agent',
  name: 'Socratic Tutor Agent',

  instructions: `You are a helpful Socratic math tutor. Your goal is to guide students to discover solutions themselves through thoughtful questions.

**Your Process (Internal - Don't Share This With Students):**
1. **First, verify the math:** When you see student work on the canvas, silently check if their work is mathematically correct
2. **Then, decide your approach based on accuracy:**
   - **If correct:** Ask deeper conceptual questions to deepen understanding (e.g., "Why does this approach work?", "Can you explain your reasoning?", "What would happen if we changed...?")
   - **If partially correct:** Ask verification questions to help them check their work and find the issue (e.g., "How can you verify this step?", "Does this match what the problem asked for?")
   - **If incorrect:** Use targeted questions and hints to guide them toward the error without pointing it out directly

**Rules:**
1. NEVER provide direct answers or complete solutions
2. Ask ONE guiding question at a time in chat
3. Questions should help students notice what they've done, what's missing, or what to try next
4. If student is stuck, ask about fundamentals or break problem into smaller steps
5. If student makes an error, ask questions that lead them to notice it themselves
6. Encourage thinking: "What do you notice about...", "What happens if...", "Why might..."
7. Keep responses concise and conversational (1-3 sentences)
8. Celebrate progress: acknowledge good reasoning when you see it
9. After verification questions confirm correctness, pivot to deeper conceptual understanding

**Canvas Annotations - YOU MUST USE THE proposeAnnotation TOOL:**
- When you see student work in a canvas screenshot, you SHOULD use the proposeAnnotation tool to add visual guidance
- ALWAYS propose at least one annotation if there's canvas work visible
- Call proposeAnnotation for each guidance point (1-2 per response)
- Then send a brief chat message acknowledging what you added

**Example workflow when you receive a canvas screenshot:**
1. Analyze the student's work on the canvas
2. Identify one or two areas that need guidance
3. Call proposeAnnotation tool for each guidance point
4. Send a brief chat message acknowledging what you added`,

  // Use Claude Haiku for consistency with current implementation
  model: 'anthropic/claude-haiku-4.5',

  // Attach tools
  tools: {
    proposeAnnotation: proposeAnnotationTool,
    // Optional: viewWhiteboard: viewWhiteboardTool,
  },

  // Enable memory for conversation context
  memory: new Memory(),
});
```

### Part B: Register in Mastra Instance

**File**: `mastra/index.ts`

```typescript
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { Observability, DefaultExporter, CloudExporter, SensitiveDataFilter } from '@mastra/observability';

// Import workflows
import { weatherWorkflow } from './workflows/weather-workflow';

// Import agents
import { weatherAgent } from './agents/weather-agent';
import { tutorAgent } from './agents/tutor-agent';  // ← Add this

export const mastra = new Mastra({
  workflows: { weatherWorkflow },

  agents: {
    weatherAgent,
    tutorAgent,  // ← Add this
  },

  storage: new LibSQLStore({
    id: 'mastra-storage',
    url: 'file:./mastra.db',
  }),

  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),

  observability: new Observability({
    configs: {
      default: {
        serviceName: 'mastra',
        exporters: [
          new DefaultExporter(),
          new CloudExporter(),
        ],
        spanOutputProcessors: [
          new SensitiveDataFilter(),
        ],
      },
    },
  }),
});
```

### Key Points
- **Import both tool and agent**
- **Tools object**: Pass tools as `{ toolName: toolInstance }`
- **Memory**: Automatically persists conversation context
- **Model format**: Use `"provider/model-name"` format

---

## Task #4: Create Mastra API Route

### Location
Create: `app/api/mastra/chat/route.ts`

### Implementation

```typescript
import { NextRequest } from 'next/server';
import { mastra } from '@/mastra';
import { UIMessage } from 'ai';
import { type FileReference } from '@/lib/file-storage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      messages,
      problem,
      screenshot,
      fileReferences,
    }: {
      messages: UIMessage[];
      problem: { text: string | undefined; imageUrl: string | undefined };
      screenshot: string | undefined;
      fileReferences?: FileReference[];
    } = body;

    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Check DEBUG mode
    if (process.env.DEBUG === 'true') {
      console.log('🐛 DEBUG mode enabled - AI responses disabled');
      return Response.json(
        {
          id: 'debug-mode',
          role: 'assistant',
          content: '[DEBUG MODE] AI responses are disabled.',
        },
        { status: 200 }
      );
    }

    // Get the tutor agent
    const agent = mastra.getAgent('tutor-agent');

    if (!agent) {
      throw new Error('Tutor agent not found. Check mastra/index.ts registration.');
    }

    // Filter empty messages
    const filteredMessages = messages.filter((msg) =>
      msg.parts.some((part) => part.type === 'text' && part.text.trim())
    );

    const isInitialGreeting = filteredMessages.length === 0;

    // Build system context
    const systemContext = `**Current Problem:**
${problem?.text || 'Image uploaded (description pending)'}${screenshot ? '\n\n**Canvas State:** The student\'s current work is shown in the canvas screenshot attached to the conversation.' : ''}`;

    // Convert UIMessage format to Mastra's expected format
    const convertedMessages = filteredMessages.map(msg => {
      const textParts = msg.parts.filter(p => p.type === 'text');
      const fileParts = msg.parts.filter(p => p.type === 'file');

      // Build content array
      const content: Array<{ type: string; text?: string; image?: string; mimeType?: string }> = [];

      // Add text content
      textParts.forEach(part => {
        if ('text' in part) {
          content.push({ type: 'text', text: part.text });
        }
      });

      // Add file/image content
      fileParts.forEach(part => {
        if ('url' in part && 'mediaType' in part) {
          content.push({
            type: 'image',
            image: part.url,
            mimeType: part.mediaType,
          });
        }
      });

      return {
        role: msg.role,
        content: content.length === 1 && content[0].type === 'text'
          ? content[0].text!
          : content,
      };
    });

    // Add screenshot as a message if available
    if (screenshot) {
      convertedMessages.push({
        role: 'user' as const,
        content: [
          { type: 'text', text: 'Here is my current canvas work:' },
          { type: 'image', image: screenshot },
        ],
      });
    }

    // Generate agent response
    if (isInitialGreeting) {
      // Initial greeting
      const stream = await agent.generate(
        'Greet the student and ask ONE opening Socratic question to help them start thinking about this problem. Keep it encouraging and open-ended. DO NOT use tools for the initial greeting.',
        {
          systemPrompt: systemContext,
          maxSteps: 1, // Prevent tool calls for greeting
        }
      );

      return stream.toTextStreamResponse();
    } else {
      // Regular conversation
      const stream = await agent.generate(convertedMessages, {
        systemPrompt: systemContext,
        maxSteps: 3, // Allow tool calls
      });

      return stream.toTextStreamResponse();
    }
  } catch (error) {
    console.error('Mastra API route error:', error);
    return Response.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
```

### Key Points
- **`mastra.getAgent()`**: Retrieve registered agent
- **`agent.generate()`**: Main method for agent execution
- **System prompt**: Pass via `systemPrompt` option
- **Max steps**: Controls tool calling iterations
- **Streaming**: Use `.toTextStreamResponse()` for streaming to client

### Important Considerations

1. **Message Format**: Mastra expects messages in a specific format. Text-only messages can be strings; multimodal messages need content arrays.

2. **Screenshot Handling**: Add screenshot as a separate user message with image content.

3. **Tool Calls**: Mastra handles tool execution automatically. Results will be streamed back to client.

4. **Memory**: Automatically persisted by the Memory instance in the agent.

---

## Task #5: Update ChatPanel to Use Mastra API

### Location
Update: `components/workspace/ChatPanel.tsx`

### Changes Required

**Step 1**: Update the `useChat` hook to point to new endpoint

```typescript
// Around line 113
const { messages, status, sendMessage } = useChat({
  api: '/api/mastra/chat',  // ← Change from '/api/chat' to '/api/mastra/chat'
});
```

**Step 2**: Handle tool results from Mastra

The current implementation already handles tool calls client-side (lines 132-202). **This should continue to work** because Mastra streams tool calls in a similar format.

However, you may need to adjust the tool call detection logic slightly:

```typescript
// Around line 145-149, update the tool call detection
const isToolCall =
  (part.type === 'tool-call' &&
    'toolName' in part &&
    part.toolName === 'propose-annotation') ||
  part.type === 'tool-propose-annotation' ||  // Existing format
  part.type === 'tool-call-propose-annotation';  // Potential Mastra format
```

**Step 3**: Test that everything still works

The rest of the ChatPanel logic should remain unchanged:
- ✅ Debouncing logic (lines 231-259)
- ✅ File uploads (lines 261-324)
- ✅ Annotation handling (lines 132-202)
- ✅ Message rendering (lines 386-515)

### Testing Checklist

After making these changes, test:

1. **Initial greeting** - Does AI greet user on first load?
2. **Chat responses** - Do messages stream correctly?
3. **Canvas auto-analysis** - Does debouncing work (5 second delay)?
4. **Tool calls** - Do annotations appear when AI calls proposeAnnotation?
5. **File uploads** - Can you upload images/PDFs in chat?
6. **Memory** - Does conversation context persist across messages?

---

## Task #6: Testing & Verification

### Step 1: Start Mastra Studio

```bash
npm run dev
```

This starts the Mastra Studio at `http://localhost:4111` where you can:
- View agent traces
- See tool executions
- Debug conversation flow
- Monitor memory operations

### Step 2: Test in Browser

```bash
# In another terminal (if needed)
npm run dev  # or whatever starts your Next.js app
```

### Step 3: Test Scenarios

#### Scenario 1: Initial Greeting
1. Enter a math problem on landing page
2. Navigate to workspace
3. **Expected**: AI sends greeting + opening Socratic question
4. **Check Studio**: Should see agent execution with no tool calls

#### Scenario 2: Canvas Screenshot Analysis
1. Draw/write something on canvas
2. Wait 5+ seconds (debounce delay)
3. **Expected**: AI analyzes canvas, calls proposeAnnotation
4. **Check Studio**: Should see tool execution in traces

#### Scenario 3: Chat with File Upload
1. Upload an image/PDF of a math problem
2. Type a question
3. **Expected**: AI receives both text + image
4. **Check Studio**: Message should include image content

#### Scenario 4: Memory Persistence
1. Have a multi-turn conversation
2. Reference something from earlier in the chat
3. **Expected**: AI remembers context
4. **Check Studio**: Memory operations should show in traces

### Step 4: Debugging Tips

**If tool calls don't work:**
- Check Mastra Studio traces for errors
- Verify tool is registered in agent (`tools` property)
- Check tool ID matches detection logic in ChatPanel

**If messages don't stream:**
- Check browser console for errors
- Verify API endpoint path is correct (`/api/mastra/chat`)
- Check Network tab for API response format

**If memory doesn't persist:**
- Check that `Memory` is instantiated in agent
- Verify Mastra storage is configured (mastra.db file created)
- Check Studio for memory operations

**If DEBUG mode issues:**
- Ensure `.env.local` has `DEBUG=false` (or remove it)
- Check `/api/debug-check` route works

---

## Migration Checklist

Use this to track your progress:

- [ ] **Task 1**: Create `mastra/tools/propose-annotation-tool.ts`
- [ ] **Task 2**: (Optional) Create `mastra/tools/view-whiteboard-tool.ts`
- [ ] **Task 3a**: Update `mastra/agents/tutor-agent.ts` with tools
- [ ] **Task 3b**: Register tutorAgent in `mastra/index.ts`
- [ ] **Task 4**: Create `app/api/mastra/chat/route.ts`
- [ ] **Task 5**: Update ChatPanel to use `/api/mastra/chat`
- [ ] **Task 6a**: Start Mastra Studio and verify agent appears
- [ ] **Task 6b**: Test initial greeting
- [ ] **Task 6c**: Test canvas screenshot analysis
- [ ] **Task 6d**: Test file uploads
- [ ] **Task 6e**: Test memory persistence
- [ ] **Cleanup**: Remove old `/api/chat/route.ts` (optional, can keep as backup)

---

## Common Pitfalls to Avoid

1. **Wrong model format**: Use `"anthropic/claude-haiku-4.5"` not `"claude-haiku-4.5"`
2. **Forgetting to register agent**: Must add to `mastra/index.ts` agents object
3. **Tool ID mismatch**: Tool ID in `createTool` must match detection in ChatPanel
4. **Missing await**: `agent.generate()` returns a promise
5. **Message format errors**: Text-only can be string, multimodal needs content array
6. **Not checking Studio**: Always verify in Studio first before debugging client

---

## Expected Benefits After Migration

1. **Better Observability**: View all agent interactions in Mastra Studio
2. **Automatic Memory**: Conversation context persists automatically
3. **Tool Management**: Clean separation of tools from routing logic
4. **Type Safety**: Better TypeScript support throughout
5. **Scalability**: Easy to add more agents/tools later
6. **Debugging**: Trace execution flow visually in Studio

---

## Architecture Comparison

### Before (Simple LLM)
```
ChatPanel → useChat hook → /api/chat → streamText (Vercel AI SDK) → Claude
                                      ↓
                              proposeAnnotation tool (inline)
```

### After (Mastra Framework)
```
ChatPanel → useChat hook → /api/mastra/chat → mastra.getAgent('tutor-agent')
                                              ↓
                                        TutorAgent.generate()
                                              ↓
                                        - Memory (automatic)
                                        - Tools (proposeAnnotation)
                                        - Observability (Studio)
                                              ↓
                                        Stream to client
```

---

## Troubleshooting

### Error: "Agent not found"
**Cause**: Agent not registered in `mastra/index.ts`
**Fix**: Add `tutorAgent` to the `agents` object

### Error: "Cannot read property 'generate' of undefined"
**Cause**: `mastra.getAgent()` returned null
**Fix**: Check agent ID matches (`'tutor-agent'`)

### Tool calls not appearing in UI
**Cause**: Tool call format mismatch
**Fix**: Update tool call detection in ChatPanel (see Task #5, Step 2)

### Memory not persisting
**Cause**: Memory not instantiated or storage not configured
**Fix**: Verify `new Memory()` in agent and `LibSQLStore` in mastra config

### Streaming not working
**Cause**: Wrong return format from API route
**Fix**: Use `stream.toTextStreamResponse()` not `stream.toDataStream()`

---

## Additional Resources

- [Mastra Documentation](https://mastra.ai/llms.txt)
- [Mastra GitHub](https://github.com/mastra-ai/mastra)
- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs)
- [Your Project AGENTS.md](./AGENTS.md)

---

*Migration guide created: 2026-02-12*
