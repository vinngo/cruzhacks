"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { useProblem } from "@/lib/problem-context";
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

export function ChatPanel() {
  const {
    problemText,
    problemImage,
    chatInitialized,
    initializeChat,
    canvasScreenshot,
  } = useProblem();
  const [input, setInput] = useState("");
  const greetingSentRef = useRef(false);
  const lastMessageTimeRef = useRef<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { messages, status, sendMessage } = useChat();

  const isLoading = status === "submitted" || status === "streaming";

  // Send initial greeting when component mounts
  useEffect(() => {
    if (
      !greetingSentRef.current &&
      !chatInitialized &&
      (problemText || problemImage?.url)
    ) {
      console.log("Triggering initial greeting");
      greetingSentRef.current = true;
      initializeChat();
      // Send empty message to trigger AI greeting
      sendMessage(
        { text: "" },
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
    if (!canvasScreenshot || !chatInitialized) return;

    const now = Date.now();
    const timeSinceLastMessage = now - lastMessageTimeRef.current;

    // Only auto-analyze if user hasn't sent a message in the last 5 seconds
    // This avoids interrupting active typing
    if (timeSinceLastMessage > 5000 && !isLoading) {
      console.log(
        "Auto-analyzing canvas screenshot, length:",
        canvasScreenshot.length,
      );
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

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-white border-l border-gray-200 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-12" : "w-80",
      )}
    >
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-gray-900">AI Tutor</h2>
        )}
        <button
          className="ml-auto rounded-md bg-gray-100 px-2 py-1 text-sm font-medium text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand chat" : "Collapse chat"}
        >
          {isCollapsed ? (
            <ChevronLeftIcon className="h-4 w-4" />
          ) : (
            <ChevronRightIcon className="h-4 w-4" />
          )}
        </button>
      </div>
      {!isCollapsed && (
        <>
          {/* Messages */}
          <Conversation className="flex-1">
            <ConversationContent>
              {messages.length === 0 ? (
                <ConversationEmptyState
                  title="Ready to help"
                  description="Ask a question about your problem to get started"
                />
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex w-full",
                      message.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900",
                      )}
                    >
                      {message.parts.map((part, index) => {
                        if (part.type === "text") {
                          // Display canvas update marker as just emoji
                          const displayText =
                            part.text === "🎨" ? "🎨" : part.text;
                          return <span key={index}>{displayText}</span>;
                        }
                        return null;
                      })}
                    </div>
                  </div>
                ))
              )}

              {(isLoading || isAnalyzing) && (
                <div className="flex w-full justify-start">
                  <div className="max-w-[85%] rounded-2xl bg-gray-100 px-4 py-2.5 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <span className="animate-pulse">
                        {isAnalyzing ? "Analyzing canvas" : "AI is thinking"}
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
                  </div>
                </div>
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
        </>
      )}
      {isCollapsed && (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-sm text-gray-500 rotate-90 whitespace-nowrap">
            AI
          </span>
        </div>
      )}
    </div>
  );
}

export default ChatPanel;
