import { createTool } from "@mastra/core/tools";
import z from "zod";

export const proposeAnnotationTool = createTool({
  id: "propose-annotation",
  description:
    "Propose an annotation (question or hint) to appear on the student's canvas. Use this when you want to guide their thinking about a specific part of their work.",
  inputSchema: z.object({
    type: z
      .enum(["question", "hint"])
      .describe(
        "Type of annotation: question for Socratic questions, hint for scaffolding (NEVER partial solutions)",
      ),
    text: z
      .string()
      .describe(
        "The annotation text. Keep concise (1-2 sentences max). Question should be open-ended. Hints should be partial (not complete answers).",
      ),
    positionHint: z
      .enum(["top-left", "top-right", "center"])
      .optional()
      .describe("Rough position preference. Algorithm will avoid overlaps."),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    annotationId: z.string().optional(),
    type: z.enum(["question", "hint"]),
    text: z.string(),
    positionHint: z
      .enum(["top-left", "top-right", "center"])
      .optional()
      .describe("Rough position preference. Algorithm will avoid overlaps."),
  }),
  execute: async ({ type, text, positionHint }) => {
    const annotationId = crypto.randomUUID();
    return {
      success: true,
      annotationId,
      type,
      text,
      positionHint,
    };
  },
});
