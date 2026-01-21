"use client";

import { useEffect } from "react";
import CanvasPanel from "@/components/workspace/CanvasPanel";
import { ChatPanel } from "@/components/workspace/ChatPanel";
import { useProblem } from "@/lib/problem-context";
import { useRouter } from "next/navigation";
import Navbar from "@/components/workspace/Navbar";

export default function WorkspacePage() {
  const { problemText, problemImage } = useProblem();
  const router = useRouter();

  useEffect(() => {
    if (!problemText || !problemImage) {
      router.push("/");
    }
  }, [problemText, problemImage, router]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {/* Top: Navbar */}
      <Navbar />

      {/* Bottom: Panels (fills remaining space) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Center: Canvas Panel (flexible, expands when chat collapses) */}
        <div className="flex-1 h-full">
          <CanvasPanel />
        </div>

        {/* Right: Chat Panel (controls its own width via isCollapsed state) */}
        <div className="h-full">
          <ChatPanel />
        </div>
      </div>
    </div>
  );
}
