import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { canvasStorage } from "@/lib/canvas-storage";
import { TutorAgent } from "../agents/tutor-agent";

// Step 1: Initialize Session
const initializeSessionStep = createStep({
  id: "initialize-session",

  inputSchema: z.object({
    problemText: z.string().optional(),
    problemImageUrl: z.string().optional(),
    conversationId: z.string(),
  }),

  outputSchema: z.object({
    sessionId: z.string(),
    problemContext: z.string(),
    isValid: z.boolean(),
    startTime: z.number(),
  }),

  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }

    console.log("🎓 Initializing tutoring session:", inputData.conversationId);

    const hasValidProblem = !!(
      inputData.problemText || inputData.problemImageUrl
    );
    const problemContext =
      inputData.problemText ||
      (inputData.problemImageUrl
        ? "Problem provided as image"
        : "No problem provided");

    // TODO: Initialize metrics (not yet implemented in canvasStorage)
    // await canvasStorage.updateMetrics(inputData.conversationId, {
    //   sessionId: inputData.conversationId,
    //   startTime: Date.now(),
    //   completionStatus: "active",
    // });

    return {
      sessionId: inputData.conversationId,
      problemContext,
      isValid: hasValidProblem,
      startTime: Date.now(),
    };
  },
});

// Step 2: Analyze Canvas Work
const analyzeCanvasStep = createStep({
  id: "analyze-canvas",

  inputSchema: z.object({
    sessionId: z.string(),
    problemContext: z.string(),
    isValid: z.boolean(),
    startTime: z.number(),
  }),

  outputSchema: z.object({
    hasCanvasWork: z.boolean(),
    canvasTimestamp: z.number().optional(),
    analysisPrompt: z.string(),
    snapshotId: z.string().optional(),
    conversationId: z.string(),
  }),

  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }

    console.log("🔍 Analyzing canvas for conversation:", inputData.sessionId);

    const snapshot = await canvasStorage.getCurrentSnapshot(
      inputData.sessionId,
    );

    if (!snapshot) {
      return {
        hasCanvasWork: false,
        analysisPrompt: "No canvas work yet. Encourage student to begin.",
        conversationId: inputData.sessionId,
      };
    }

    // TODO: Update metrics (not yet implemented in canvasStorage)
    // const metrics = await canvasStorage.getMetrics(inputData.sessionId);
    // await canvasStorage.updateMetrics(inputData.sessionId, {
    //   totalAnalyses: (metrics?.totalAnalyses || 0) + 1,
    // });

    const timeSinceLastUpdate = Date.now() - snapshot.timestamp;
    const analysisPrompt = `
  **Problem**: ${inputData.problemContext}

  **Student's Canvas**: Last updated ${Math.floor(timeSinceLastUpdate / 1000)}s ago

  **Analysis Task**:
  1. View the canvas using the viewWhiteboard tool (conversationId: ${inputData.sessionId})
  2. Identify what the student has done correctly
  3. Find where they might be stuck or made errors
  4. Choose 1-2 specific areas needing guidance
  5. Use proposeAnnotation tool for each guidance point
  6. Return a brief encouraging message

  **Socratic Method Checklist**:
  - ❌ Do NOT give direct answers
  - ✅ DO ask questions that lead to discovery
  - ✅ DO acknowledge good reasoning
  - ✅ DO break down complex steps
  `;

    return {
      hasCanvasWork: true,
      canvasTimestamp: snapshot.timestamp,
      analysisPrompt,
      snapshotId: snapshot.id,
      conversationId: inputData.sessionId,
    };
  },
});

// Step 3: Generate Guidance via Agent
const generateGuidanceStep = createStep({
  id: "generate-guidance",

  inputSchema: z.object({
    hasCanvasWork: z.boolean(),
    canvasTimestamp: z.number().optional(),
    analysisPrompt: z.string(),
    snapshotId: z.string().optional(),
    conversationId: z.string(),
  }),

  outputSchema: z.object({
    guidance: z.string(),
    toolCallsCount: z.number(),
    annotationsProposed: z.number(),
    viewedCanvas: z.boolean(),
    conversationId: z.string(),
  }),

  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }

    console.log("💡 Generating guidance via tutor agent");

    if (!inputData.hasCanvasWork) {
      return {
        guidance: "Let me know when you start working on the problem!",
        toolCallsCount: 0,
        annotationsProposed: 0,
        viewedCanvas: false,
        conversationId: inputData.conversationId,
      };
    }

    const conversationId = inputData.conversationId;

    // Call tutor agent with structured prompt
    const response = await TutorAgent.generate(inputData.analysisPrompt, {
      maxSteps: 5,
    });

    const guidance = response.text;
    const toolCalls = response.toolCalls || [];

    const annotationsProposed = toolCalls.filter(
      (tc) =>
        tc.type === "tool-call" && tc.payload.toolName === "proposeAnnotation",
    ).length;

    const viewedCanvas = toolCalls.some(
      (tc) =>
        tc.type === "tool-call" && tc.payload.toolName === "viewWhiteboard",
    );

    // TODO: Update metrics (not yet implemented in canvasStorage)
    // const metrics = await canvasStorage.getMetrics(conversationId);
    // await canvasStorage.updateMetrics(conversationId, {
    //   annotationsProposed:
    //     (metrics?.annotationsProposed || 0) + annotationsProposed,
    // });

    return {
      guidance,
      toolCallsCount: toolCalls.length,
      annotationsProposed,
      viewedCanvas,
      conversationId,
    };
  },
});

// Step 4: Quality Check
const qualityCheckStep = createStep({
  id: "quality-check",

  inputSchema: z.object({
    guidance: z.string(),
    toolCallsCount: z.number(),
    annotationsProposed: z.number(),
    viewedCanvas: z.boolean(),
    conversationId: z.string(),
  }),

  outputSchema: z.object({
    passesQualityCheck: z.boolean(),
    issues: z.array(z.string()),
    warnings: z.array(z.string()),
    guidance: z.string(),
    conversationId: z.string(),
  }),

  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }

    console.log("✅ Running quality check on guidance");

    const issues: string[] = [];
    const warnings: string[] = [];

    const lowercaseGuidance = inputData.guidance.toLowerCase();

    // Check for direct answers (red flags)
    const directAnswerPhrases = [
      "the answer is",
      "the solution is",
      "equals to",
      "the result is",
      "it should be",
    ];

    directAnswerPhrases.forEach((phrase) => {
      if (lowercaseGuidance.includes(phrase)) {
        issues.push(`Contains direct answer phrase: "${phrase}"`);
      }
    });

    // Check for Socratic questions (good signs)
    const socraticIndicators = ["?", "what", "why", "how", "can you"];
    const hasSocraticElements = socraticIndicators.some((indicator) =>
      lowercaseGuidance.includes(indicator),
    );

    if (!hasSocraticElements) {
      warnings.push("No Socratic questions detected");
    }

    // Check annotation count
    if (inputData.annotationsProposed === 0) {
      warnings.push("No annotations proposed for canvas work");
    } else if (inputData.annotationsProposed > 3) {
      warnings.push(
        `Many annotations (${inputData.annotationsProposed}) - might overwhelm student`,
      );
    }

    const passesQualityCheck = issues.length === 0;

    if (!passesQualityCheck) {
      console.warn("⚠️  Quality check failed:", issues);
    }

    return {
      passesQualityCheck,
      issues,
      warnings,
      guidance: inputData.guidance,
      conversationId: inputData.conversationId,
    };
  },
});

// Step 5: Track Progress
const trackProgressStep = createStep({
  id: "track-progress",

  inputSchema: z.object({
    passesQualityCheck: z.boolean(),
    issues: z.array(z.string()),
    warnings: z.array(z.string()),
    guidance: z.string(),
    conversationId: z.string(),
  }),

  outputSchema: z.object({
    progressTracked: z.boolean(),
    isComplete: z.boolean(),
    sessionDuration: z.number(),
  }),

  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }

    const conversationId = inputData.conversationId;

    console.log("📊 Tracking progress for session:", conversationId);

    // TODO: Implement metrics tracking in canvasStorage
    // const metrics = await canvasStorage.getMetrics(conversationId);

    // Check for completion indicators
    const completionPhrases = [
      "great job",
      "well done",
      "you solved it",
      "correct solution",
      "completed",
    ];

    const isComplete = completionPhrases.some((phrase) =>
      inputData.guidance.toLowerCase().includes(phrase),
    );

    // TODO: Track completion status once metrics are implemented
    // if (isComplete) {
    //   await canvasStorage.updateMetrics(conversationId, {
    //     completionStatus: "completed",
    //   });
    // }

    const sessionDuration = Date.now();

    return {
      progressTracked: true,
      isComplete,
      sessionDuration,
    };
  },
});

// Build the workflow
const tutorWorkflow = createWorkflow({
  id: "tutor-workflow",
  inputSchema: z.object({
    problemText: z.string().optional(),
    problemImageUrl: z.string().optional(),
    conversationId: z.string(),
    action: z.enum(["initialize", "analyze", "full"]).default("full"),
  }),
  outputSchema: z.object({
    progressTracked: z.boolean(),
    isComplete: z.boolean(),
    sessionDuration: z.number(),
  }),
})
  .then(initializeSessionStep)
  .then(analyzeCanvasStep)
  .then(generateGuidanceStep)
  .then(qualityCheckStep)
  .then(trackProgressStep);

tutorWorkflow.commit();

export { tutorWorkflow };
