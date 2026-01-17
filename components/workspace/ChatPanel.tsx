"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { useProblem } from "@/lib/problem-context";
import { Button } from "@/components/ui/button";
import { SendHorizontalIcon } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { cn } from "@/lib/utils";
import { DefaultChatTransport } from "ai";

export function ChatPanel() {
  const { problemText, problemImage } = useProblem();
  const [input, setInput] = useState("");

  const { messages, status, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        problem: {
          text: problemText || undefined,
          imageUrl: problemImage?.url || undefined,
        },
      },
    }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  return (
    <div className="flex h-full flex-col bg-white border-l border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-lg font-semibold text-gray-900">AI Tutor</h2>
      </div>

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
                      return <span key={index}>{part.text}</span>;
                    }
                    return null;
                  })}
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex w-full justify-start">
              <div className="max-w-[85%] rounded-2xl bg-gray-100 px-4 py-2.5 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <span className="animate-pulse">AI is thinking</span>
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
    </div>
  );
}

export default ChatPanel;
