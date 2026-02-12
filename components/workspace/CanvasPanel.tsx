"use client";

import { useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { useProblem } from "@/lib/problem-context";
import { TldrawEditorRef } from "@/components/TldrawEditor";
import { AnnotationOverlay } from "./AnnotationOverlay";
import { useDebounce } from "@/hooks/useDebounce";

const TldrawEditor = dynamic(() => import("@/components/TldrawEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <p className="text-gray-500 text-lg">Loading canvas...</p>
    </div>
  ),
});

const SCREENSHOT_DEBOUNCE_MS = 3000;
const SCREENSHOT_INDEX = 1;

export default function CanvasPanel() {
  const { setCanvasScreenshot } = useProblem();
  const editorRef = useRef<TldrawEditorRef>(null);

  const captureScreenshot = useCallback(async () => {
    if (!editorRef.current) {
      console.warn("Canvas editor not available for screenshot capture");
      return;
    }

    try {
      const result = await editorRef.current.captureScreenshot();

      if (!result || !Array.isArray(result)) {
        console.warn("Invalid screenshot result format");
        return;
      }

      const screenshot = result[SCREENSHOT_INDEX];

      if (!screenshot || typeof screenshot !== "string") {
        console.warn("Screenshot data not found in result");
        return;
      }

      console.log("Canvas screenshot captured, length:", screenshot.length);
      console.log("Screenshot format:", screenshot.substring(0, 50));
      setCanvasScreenshot(screenshot);
    } catch (error) {
      console.error("Failed to capture canvas screenshot:", error instanceof Error ? error.message : error);
    }
  }, [setCanvasScreenshot]);

  const handleCanvasChange = useDebounce(captureScreenshot, SCREENSHOT_DEBOUNCE_MS);

  return (
    <div className="h-full relative">
      <TldrawEditor ref={editorRef} onChange={handleCanvasChange} />
      <AnnotationOverlay editorRef={editorRef} />
    </div>
  );
}
