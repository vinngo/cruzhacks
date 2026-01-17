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

    // Build context-aware system message
    const systemMessage = `${SYSTEM_PROMPT}

**Current Problem:**
${problem?.text || "Image uploaded (description pending)"}

Provide ONE Socratic question to guide the student.`;

    const result = streamText({
      model: "openai/gpt-4.1-nano",
      system: systemMessage,
      messages: await convertToModelMessages(messages),
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
