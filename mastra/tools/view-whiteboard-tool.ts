import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { canvasStorage } from "@/lib/canvas-storage";

export const viewWhiteboardTool = createTool({
  id: "view-whiteboard",
  description:
    "View the current state of the student's whiteboard canvas. Call this whenever you need to see their work to provide guidance.",

  inputSchema: z.object({
    conversationId: z
      .string()
      .describe("The conversation ID to retrieve canvas for"),
    analysis: z
      .enum(["full", "changes-only", "specific-area"])
      .optional()
      .describe("Type of analysis to perform"),
  }),

  outputSchema: z.object({
    success: z.boolean(),
    screenshot: z.string().optional(),
    timestamp: z.number().optional(),
    message: z.string(),
  }),

  execute: async ({ conversationId, analysis = "full" }) => {
    console.log(
      "👁️  viewWhiteboard tool called for conversation:",
      conversationId,
    );

    const snapshot = await canvasStorage.getCurrentSnapshot(conversationId);

    if (!snapshot) {
      return {
        success: false,
        message:
          "No canvas work available. The student hasn't drawn anything yet.",
      };
    }

    // Return the screenshot for the agent to analyze
    return {
      success: true,
      screenshot: snapshot.screenshot,
      timestamp: snapshot.timestamp,
      message: `Canvas snapshot retrieved (taken ${Math.floor((Date.now() - snapshot.timestamp) / 1000)}s ago).
  Analyze the student's work.`,
    };
  },
});
