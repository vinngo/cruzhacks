"use client";

import { useEffect } from "react";
import ProblemPanel from "@/components/workspace/ProblemPanel";
import CanvasPanel from "@/components/workspace/CanvasPanel";
import { ChatPanel } from "@/components/workspace/ChatPanel";
import { useProblem } from "@/lib/problem-context";
import { useRouter } from "next/navigation";

export default function WorkspacePage() {
  const { problemText, problemImage } = useProblem();
  const router = useRouter();

  useEffect(() => {
    if (!problemText || !problemImage) {
      router.push("/");
    }
  }, [problemText, problemImage, router]);

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Left: Problem Panel (20% width) */}
      <div className="w-1/5 h-full">
        <ProblemPanel />
      </div>

      {/* Center: Canvas Panel (60% width) */}
      <div className="w-3/5 h-full">
        <CanvasPanel />
      </div>

      {/* Right: Chat Panel (20% width) */}
      <div className="w-1/5 h-full">
        <ChatPanel />
      </div>
    </div>
  );
}
