import {
  convertToModelMessages,
  streamText,
  UIMessage,
  ModelMessage,
} from "ai";
import { z } from "zod";
import { SYSTEM_PROMPT } from "@/lib/ai/prompt";

// Define annotation tool schema for AI to propose canvas annotations
const proposeAnnotationSchema = z.object({
  type: z
    .enum(["question", "hint"])
    .describe(
      "Type of annotation: question for Socratic questions, hint for scaffolding/partial solutions",
    ),
  text: z
    .string()
    .describe(
      "The annotation text. Keep concise (1-2 sentences max). Questions should be open-ended. Hints should be partial (not complete answers).",
    ),
  positionHint: z
    .enum(["top-left", "top-right", "bottom-left", "bottom-right", "center"])
    .optional()
    .describe("Rough position preference. Algorithm will avoid overlaps."),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Request body keys:", Object.keys(body));
    console.log("Screenshot present:", !!body.screenshot);
    console.log("Screenshot length:", body.screenshot?.length);

    const {
      messages,
      problem,
      screenshot,
    }: {
      messages: UIMessage[];
      problem: { text: string | undefined; imageUrl: string | undefined };
      screenshot: string | undefined;
    } = body;

    console.log("screenshot:", screenshot);

    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: "Messages array is required" },
        { status: 400 },
      );
    }

    // Filter out empty messages (used for initial greeting trigger)
    const filteredMessages = messages.filter((msg) =>
      msg.parts.some((part) => part.type === "text" && part.text.trim()),
    );

    // Check if this is the initial greeting (no valid messages)
    const isInitialGreeting = filteredMessages.length === 0;

    // Build context-aware system message
    const systemMessage = `${SYSTEM_PROMPT}

**Current Problem:**
${problem?.text || "Image uploaded (description pending)"}${screenshot ? "\n\n**Canvas State:** The student's current work is shown in the canvas screenshot attached to the conversation." : ""}`;

    // Convert filtered messages to model messages
    const modelMessages = await convertToModelMessages(filteredMessages);

    // Add screenshot as an image message if available
    if (screenshot) {
      modelMessages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: "Here is my current canvas work:",
          },
          {
            type: "image",
            image: screenshot,
          },
        ],
      } as ModelMessage);
    }

    const result = isInitialGreeting
      ? streamText({
          model: "anthropic/claude-haiku-4.5",
          system: systemMessage,
          prompt:
            "Greet the student and ask ONE opening Socratic question to help them start thinking about this problem. Examples: 'What information does this problem give you?' or 'What do you think would be a good first step?' Keep it encouraging and open-ended.",
          temperature: 0.7,
          onError: ({ error }) => {
            console.error("AI streaming error:", error);
          },
        })
      : streamText({
          model: "anthropic/claude-haiku-4.5",
          system: systemMessage,
          messages: modelMessages,
          temperature: 0.7,
          onError: ({ error }) => {
            console.error("AI streaming error:", error);
          },
        });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("API route error:", error);
    return Response.json(
      { error: "Failed to process chat request" },
      { status: 500 },
    );
  }
}
