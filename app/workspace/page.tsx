"use client";

import dynamic from "next/dynamic";
import ProblemPanel from "@/components/workspace/ProblemPanel";
import CanvasPanel from "@/components/workspace/CanvasPanel";
import { ChatPanel } from "@/components/workspace/ChatPanel";

const TldrawEditor = dynamic(() => import("@/components/TldrawEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <p className="text-gray-500 text-lg">Loading canvas...</p>
    </div>
  ),
});

export default function WorkspacePage() {
  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Left: Problem Panel (20% width) */}
      <div className="w-1/5 h-full">
        <ProblemPanel />
      </div>

      {/* Center: Canvas Panel (60% width) */}
      <div className="w-3/5 h-full">
        <CanvasPanel>
          <TldrawEditor />
        </CanvasPanel>
      </div>

      {/* Right: Chat Panel (20% width) */}
      <div className="w-1/5 h-full">
        <ChatPanel />
      </div>
    </div>
  );
}
