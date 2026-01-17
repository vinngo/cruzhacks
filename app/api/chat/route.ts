import { convertToModelMessages, streamText, UIMessage } from "ai";
import { SYSTEM_PROMPT } from "@/lib/ai/prompt";

export async function POST(req: Request) {
  try {
    const {
      messages,
      problem,
    }: {
      messages: UIMessage[];
      problem: { text: string | undefined; imageUrl: string | undefined };
    } = await req.json();

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
${problem?.text || "Image uploaded (description pending)"}`;

    const result = isInitialGreeting
      ? streamText({
          model: "openai/gpt-4.1-nano",
          system: systemMessage,
          prompt:
            "Greet the student and ask ONE opening Socratic question to help them start thinking about this problem. Examples: 'What information does this problem give you?' or 'What do you think would be a good first step?' Keep it encouraging and open-ended.",
          temperature: 0.7,
          onError: ({ error }) => {
            console.error("AI streaming error:", error);
          },
        })
      : streamText({
          model: "openai/gpt-4.1-nano",
          system: systemMessage,
          messages: await convertToModelMessages(filteredMessages),
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
