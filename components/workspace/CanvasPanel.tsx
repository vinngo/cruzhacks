"use client";

import { useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useProblem } from "@/lib/problem-context";
import { TldrawEditorRef } from "@/components/TldrawEditor";

const TldrawEditor = dynamic(() => import("@/components/TldrawEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <p className="text-gray-500 text-lg">Loading canvas...</p>
    </div>
  ),
});

export default function CanvasPanel() {
  const { setCanvasScreenshot } = useProblem();
  const editorRef = useRef<TldrawEditorRef>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleCanvasChange = useCallback(() => {
    console.log("Canvas onChange triggered (debounced from TldrawEditor)");

    // Cancel previous timer if user resumes drawing (cancel-on-resume)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer (4 seconds - middle of 3-5s range)
    debounceTimerRef.current = setTimeout(async () => {
      if (!editorRef.current) return;

      try {
        const result = await editorRef.current.captureScreenshot();
        if (result && result.length > 1) {
          // Extract screenshot from result array [description, screenshot]
          const screenshot = result[1];
          if (screenshot) {
            console.log(
              "Canvas screenshot captured, length:",
              screenshot.length,
            );
            console.log("Screenshot format:", screenshot.substring(0, 50));
            setCanvasScreenshot(screenshot);
          }
        }
      } catch (error) {
        console.error("Failed to capture screenshot:", error);
      }
    }, 4000); // 4 seconds
  }, [setCanvasScreenshot]);

  return (
    <div className="h-full relative">
      <TldrawEditor ref={editorRef} onChange={handleCanvasChange} />
    </div>
  );
}
