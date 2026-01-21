"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { useProblem } from "@/lib/problem-context";
import { ProposedAnnotation } from "@/lib/types/annotations";
import { Button } from "@/components/ui/button";
import {
  SendHorizontalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { cn } from "@/lib/utils";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { UIMessage, type ToolUIPart } from "ai";
import { motion, AnimatePresence } from "framer-motion";

type ProposeAnnotationInput = {
  type: "question" | "hint";
  text: string;
  positionHint?: "top-left" | "top-right" | "center";
};

type ProposeAnnotationOutput = {
  success: boolean;
  annotationId?: string;
};

type ProposeAnnotationToolUIPart = ToolUIPart<{
  proposeAnnotation: {
    input: ProposeAnnotationInput;
    output: ProposeAnnotationOutput;
  };
}>;

export function ChatPanel() {
  const {
    problemText,
    problemImage,
    chatInitialized,
    initializeChat,
    canvasScreenshot,
    addProposedAnnotation,
  } = useProblem();
  const [input, setInput] = useState("");
  const greetingSentRef = useRef(false);
  const lastMessageTimeRef = useRef<number>(0);
  const processedToolCallIdsRef = useRef<Set<string>>(new Set());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [forceReprocess, setForceReprocess] = useState(0);
  const [debugMessages, setDebugMessages] = useState<UIMessage[]>([]);
  const [isDebugMode, setIsDebugMode] = useState(false);

  // Add window function to clear cache if needed
  useEffect(() => {
    (window as Window & { clearMessageCache?: () => void }).clearMessageCache =
      () => {
        processedToolCallIdsRef.current.clear();
        setForceReprocess((prev) => prev + 1);
      };
  }, []);

  const { messages, status, sendMessage } = useChat();

  // Check if DEBUG mode is enabled
  useEffect(() => {
    const checkDebugMode = async () => {
      try {
        const response = await fetch("/api/debug-check");
        const data = await response.json();
        setIsDebugMode(data.isDebug);
      } catch (error) {
        // Silently fail, assume not in debug mode
        setIsDebugMode(false);
      }
    };
    checkDebugMode();
  }, []);

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    // Only process tool calls when not loading (message is complete)
    if (isLoading) {
      return;
    }

    messages.forEach((message) => {
      if (message.role === "assistant" && message.parts) {
        let foundToolCall = false;
        message.parts.forEach((part, index) => {
          // AI SDK can return tool calls in different formats:
          // Format 1: part.type === "tool-call" with toolName property
          // Format 2: part.type === "tool-{toolName}" with input property
          const isToolCall =
            (part.type === "tool-call" &&
              "toolName" in part &&
              part.toolName === "proposeAnnotation") ||
            part.type === "tool-proposeAnnotation";

          if (isToolCall) {
            // Get the unique tool call ID
            const toolCallId =
              "toolCallId" in part ? (part.toolCallId as string) : undefined;

            // Skip if we've already processed this specific tool call
            if (toolCallId && processedToolCallIdsRef.current.has(toolCallId)) {
              return;
            }

            foundToolCall = true;

            // Extract args from either 'args' or 'input' property
            const toolArgs = (
              "args" in part ? part.args : "input" in part ? part.input : null
            ) as {
              type: "question" | "hint";
              text: string;
              positionHint?: "top-left" | "top-right" | "center";
            } | null;

            if (toolArgs && typeof toolArgs === "object") {
              // Access properties directly
              const type = toolArgs.type;
              const text = toolArgs.text;
              const positionHint = toolArgs.positionHint;

              if (!text) {
                return;
              }

              const annotation: ProposedAnnotation = {
                id: crypto.randomUUID(), // Unique ID for each annotation
                type,
                text,
                positionHint,
              };
              addProposedAnnotation(annotation);

              // Mark this specific tool call as processed
              if (toolCallId) {
                processedToolCallIdsRef.current.add(toolCallId);
              }
            }
          }
        });

        if (!foundToolCall) {
        }
      }
    });
  }, [messages, addProposedAnnotation, forceReprocess, isLoading]);

  // Send initial greeting when component mounts
  useEffect(() => {
    if (
      !greetingSentRef.current &&
      !chatInitialized &&
      (problemText || problemImage?.url)
    ) {
      greetingSentRef.current = true;
      initializeChat();
      // Send empty message to trigger AI greeting
      sendMessage(
        { text: problemText },
        {
          body: {
            problem: {
              text: problemText || undefined,
              imageUrl: problemImage?.url || undefined,
            },
            screenshot: canvasScreenshot || undefined,
          },
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatInitialized, problemText, problemImage?.url]);

  // Automatically analyze canvas when screenshot changes
  useEffect(() => {
    if (!canvasScreenshot || !chatInitialized) {
      return;
    }

    const now = Date.now();
    const timeSinceLastMessage = now - lastMessageTimeRef.current;

    // Only auto-analyze if user hasn't sent a message in the last 5 seconds
    // This avoids interrupting active typing
    if (timeSinceLastMessage > 5000 && !isLoading) {
      setIsAnalyzing(true);
      // Send a canvas update marker (gets replaced in API with proper text)
      sendMessage(
        { text: "🎨" },
        {
          body: {
            problem: {
              text: problemText || undefined,
              imageUrl: problemImage?.url || undefined,
            },
            screenshot: canvasScreenshot || undefined,
          },
        },
      );
      setTimeout(() => setIsAnalyzing(false), 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasScreenshot]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      lastMessageTimeRef.current = Date.now();

      // If debug mode is on, add mock messages instead of calling API
      if (isDebugMode) {
        const userMessage: UIMessage = {
          id: crypto.randomUUID(),
          role: "user",
          parts: [{ type: "text", text: input }],
        };

        const mockAssistantMessage: UIMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          parts: [
            {
              type: "text",
              text: "[DEBUG MODE] This is a mock AI response. AI is currently disabled.",
            },
          ],
        };

        setDebugMessages((prev) => [
          ...prev,
          userMessage,
          mockAssistantMessage,
        ]);
        setInput("");
        return;
      }

      sendMessage(
        { text: input },
        {
          body: {
            problem: {
              text: problemText || undefined,
              imageUrl: problemImage?.url || undefined,
            },
            screenshot: canvasScreenshot || undefined,
          },
        },
      );
      setInput("");
    }
  };

  // Combine real messages with debug messages
  const displayMessages = isDebugMode
    ? [...messages, ...debugMessages]
    : messages;

  return (
    <motion.div
      className="flex h-full flex-col bg-white border-l border-gray-200"
      initial={false}
      animate={{
        width: isCollapsed ? 48 : 320,
      }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <motion.button
          className="mr-auto rounded-md bg-gray-100 px-2 py-1 text-sm font-medium text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand chat" : "Collapse chat"}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div>
            {isCollapsed ? (
              <ChevronLeftIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </div>
        </motion.button>
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.h2
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="text-lg font-semibold text-gray-900"
            >
              Elenchus
            </motion.h2>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {!isCollapsed ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col flex-1 min-h-0"
          >
            {/* Messages */}
            <Conversation className="flex-1">
              <ConversationContent>
                {displayMessages.length === 0 ? (
                  <ConversationEmptyState
                    title="Ready to help"
                    description="Ask a question about your problem to get started"
                  />
                ) : (
                  <>
                    {displayMessages.map((message) => (
                      <Message key={message.id} from={message.role}>
                        <MessageContent>
                          {message.parts.map((part, index) => {
                            if (part.type === "text") {
                              // Display canvas update marker as just emoji
                              const displayText =
                                part.text === "🎨" ? "🎨" : part.text;
                              return (
                                <MessageResponse key={index}>
                                  {displayText}
                                </MessageResponse>
                              );
                            }

                            // Render tool calls
                            const isToolCall =
                              (part.type === "tool-call" &&
                                "toolName" in part &&
                                part.toolName === "proposeAnnotation") ||
                              part.type === "tool-proposeAnnotation";

                            if (isToolCall) {
                              const toolPart =
                                part as ProposeAnnotationToolUIPart;
                              return (
                                <Tool key={index} defaultOpen={true}>
                                  <ToolHeader
                                    type={toolPart.type}
                                    state={toolPart.state}
                                    title="Propose Annotation"
                                  />
                                  <ToolContent>
                                    <ToolInput input={toolPart.input} />
                                    {toolPart.output && (
                                      <ToolOutput
                                        output={
                                          <MessageResponse>
                                            {toolPart.output.success
                                              ? `✓ Annotation created (ID: ${toolPart.output.annotationId})`
                                              : "✗ Failed to create annotation"}
                                          </MessageResponse>
                                        }
                                        errorText={toolPart.errorText}
                                      />
                                    )}
                                  </ToolContent>
                                </Tool>
                              );
                            }

                            return null;
                          })}
                        </MessageContent>
                      </Message>
                    ))}

                    {(isLoading || isAnalyzing) && (
                      <Message from="assistant">
                        <MessageContent>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <span className="animate-pulse">
                              {isAnalyzing
                                ? "Analyzing canvas"
                                : "AI is thinking"}
                            </span>
                            <span className="animate-[pulse_1s_ease-in-out_0.2s_infinite]">
                              .
                            </span>
                            <span className="animate-[pulse_1s_ease-in-out_0.4s_infinite]">
                              .
                            </span>
                            <span className="animate-[pulse_1s_ease-in-out_0.6s_infinite]">
                              .
                            </span>
                          </div>
                        </MessageContent>
                      </Message>
                    )}
                  </>
                )}
              </ConversationContent>

              <ConversationScrollButton />
            </Conversation>

            {/* Input */}
            <form onSubmit={onSubmit} className="border-t border-gray-200 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  disabled={isLoading}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50 disabled:text-gray-500"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  className="shrink-0"
                >
                  <SendHorizontalIcon className="size-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex items-center justify-center"
          >
            <span className="text-sm text-gray-500 rotate-90 whitespace-nowrap">
              AI
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default ChatPanel;
