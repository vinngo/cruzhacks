"use client";

import { useProblem } from "@/lib/problem-context";
import { ProposedAnnotation } from "@/lib/types/annotations";
import { CheckIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  calculateAnnotationPosition,
  AnnotationPosition,
} from "@/lib/annotation-positioning";
import { TldrawEditorRef } from "@/components/TldrawEditor";
import { useMemo, useEffect } from "react";
import { Button } from "../ui/button";

interface AnnotationCardProps {
  annotation: ProposedAnnotation;
  onApprove: () => void;
  onDismiss: () => void;
  position: AnnotationPosition;
}

export default function AnnotationCard({
  annotation,
  onApprove,
  onDismiss,
  position,
}: AnnotationCardProps) {
  const isQuestion = annotation.type === "question";

  return (
    <div
      className={cn(
        "absolute z-10 w-70 p-4 rounded-lg shadow-lg border-2 border-dashed backdrop-blur-sm",
        isQuestion
          ? "bg-background border-blue-400"
          : "bg-background border-amber-400",
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="mb-3">
        <span
          className={cn(
            "text-xs uppercase tracking-wide font-serif",
            isQuestion ? "text-blue-700" : "text-amber-700",
          )}
        >
          {isQuestion ? "Question" : "Hint"}
        </span>
        <p className="mt-1 text-xs text-gray-800 leading-relaxed">
          {annotation.text}
        </p>
      </div>

      <div className="flex gap-2">
        <Button onClick={onApprove} variant={"outline"}>
          <CheckIcon className="w-4 h-4" />
          Approve
        </Button>
        <Button onClick={onDismiss}>
          <XIcon className="w-4 h-4" />
          Dismiss
        </Button>
      </div>
    </div>
  );
}

interface AnnotationOverlayProps {
  editorRef: React.RefObject<TldrawEditorRef | null>;
}

export function AnnotationOverlay({ editorRef }: AnnotationOverlayProps) {
  const {
    proposedAnnotations,
    removeProposedAnnotation,
    annotationPositions,
    setAnnotationPosition,
  } = useProblem();

  // Debug: Log when proposed annotations change
  useEffect(() => {
    console.log("📍 AnnotationOverlay render:", {
      annotationCount: proposedAnnotations.length,
      annotations: proposedAnnotations,
      hasEditorRef: !!editorRef.current,
    });
  }, [proposedAnnotations, editorRef]);

  // Calculate positions for all annotations using smart positioning
  // Note: We access editorRef.current during render which React warns about.
  // This is intentional - we need the editor instance for position calculation.
  // The positions may be briefly stale but will update on next render.
  const calculatedPositions = useMemo(() => {
    const editor = editorRef.current?.getEditor() || null;
    const positions: AnnotationPosition[] = [];

    proposedAnnotations.forEach((annotation) => {
      const position = calculateAnnotationPosition(
        editor,
        annotation,
        positions,
      );
      positions.push(position);
    });

    return positions;
    // editorRef is intentionally omitted to avoid re-calculating on every ref change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposedAnnotations]);

  // Store calculated positions in context for approve reuse
  useEffect(() => {
    proposedAnnotations.forEach((annotation, index) => {
      if (!annotationPositions.has(annotation.id)) {
        setAnnotationPosition(annotation.id, calculatedPositions[index]);
      }
    });
  }, [
    proposedAnnotations,
    calculatedPositions,
    annotationPositions,
    setAnnotationPosition,
  ]);

  const handleApprove = (annotation: ProposedAnnotation) => {
    console.log("🎯 handleApprove called with annotation:", annotation);

    if (!editorRef.current) {
      console.warn("Editor ref not available");
      return;
    }

    // Validate annotation has text
    if (!annotation.text) {
      console.error("⚠️ Annotation missing text property:", annotation);
      return;
    }

    // Retrieve stored screen position (avoid recalculation drift)
    const storedPosition = annotationPositions.get(annotation.id);
    if (!storedPosition) {
      console.warn("No stored position for annotation:", annotation.id);
      return;
    }

    // Convert annotation type to tldraw color
    const color = annotation.type === "question" ? "blue" : "yellow";

    console.log("📝 Adding annotation to canvas:", {
      text: annotation.text,
      position: storedPosition,
      color,
    });

    // Add to canvas as text shape (addAnnotationToCanvas handles screen-to-page conversion)
    editorRef.current.addAnnotationToCanvas(
      annotation.text,
      storedPosition,
      color,
    );

    // Remove from proposed annotations (also removes from annotationPositions map)
    removeProposedAnnotation(annotation.id);
  };

  const handleDismiss = (id: string) => {
    // Simply remove from state - no trace left
    removeProposedAnnotation(id);
  };

  // Debug log for empty state
  if (proposedAnnotations.length === 0) {
    console.log("📍 No annotations to render");
  }

  return (
    <>
      {proposedAnnotations.map((annotation, index) => {
        const position =
          annotationPositions.get(annotation.id) || calculatedPositions[index];
        console.log("🎯 Rendering annotation card:", {
          id: annotation.id,
          text: annotation.text,
          position,
        });
        return (
          <AnnotationCard
            key={annotation.id}
            annotation={annotation}
            onApprove={() => handleApprove(annotation)}
            onDismiss={() => handleDismiss(annotation.id)}
            position={position}
          />
        );
      })}
    </>
  );
}
