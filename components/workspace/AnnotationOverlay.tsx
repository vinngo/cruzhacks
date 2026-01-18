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

interface AnnotationCardProps {
  annotation: ProposedAnnotation;
  onApprove: () => void;
  onDismiss: () => void;
  position: AnnotationPosition;
}

function AnnotationCard({
  annotation,
  onApprove,
  onDismiss,
  position,
}: AnnotationCardProps) {
  const isQuestion = annotation.type === "question";

  return (
    <div
      className={cn(
        "absolute z-10 w-70 p-4 rounded-lg shadow-lg border-2 backdrop-blur-sm",
        isQuestion
          ? "bg-blue-50/95 border-blue-400"
          : "bg-amber-50/95 border-amber-400",
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="mb-3">
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-wide",
            isQuestion ? "text-blue-700" : "text-amber-700",
          )}
        >
          {isQuestion ? "Question" : "Hint"}
        </span>
        <p className="mt-1 text-sm text-gray-800 leading-relaxed">
          {annotation.text}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onApprove}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors"
        >
          <CheckIcon className="w-4 h-4" />
          Approve
        </button>
        <button
          onClick={onDismiss}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded transition-colors"
        >
          <XIcon className="w-4 h-4" />
          Dismiss
        </button>
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
  // useMemo dependency array excludes editorRef - relies on proposedAnnotations only
  const calculatedPositions = useMemo(() => {
    const editor = editorRef.current?.getEditor() || null;
    const positions: AnnotationPosition[] = [];

    proposedAnnotations.forEach((annotation) => {
      const position = calculateAnnotationPosition(editor, annotation, positions);
      positions.push(position);
    });

    return positions;
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
    if (!editorRef.current) {
      console.warn("Editor ref not available");
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

  return (
    <>
      {proposedAnnotations.length > 0 ? (
        proposedAnnotations.map((annotation, index) => {
          const position =
            annotationPositions.get(annotation.id) ||
            calculatedPositions[index];
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
        })
      ) : (
        <div className="hidden">
          {/* No annotations to display - this div helps with debugging */}
          {console.log("📍 No annotations to render")}
        </div>
      )}
    </>
  );
}
