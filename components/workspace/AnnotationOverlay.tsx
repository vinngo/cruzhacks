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
import { useMemo } from "react";

interface AnnotationCardProps {
  annotation: ProposedAnnotation;
  onApprove: (id: string) => void;
  onDismiss: (id: string) => void;
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
          onClick={() => onApprove(annotation.id)}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors"
        >
          <CheckIcon className="w-4 h-4" />
          Approve
        </button>
        <button
          onClick={() => onDismiss(annotation.id)}
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
  const { proposedAnnotations, removeProposedAnnotation } = useProblem();

  const handleApprove = (id: string) => {
    // Will be implemented in next plan (canvas integration)
    console.log("Approve annotation:", id);
    // For now, just remove from proposed list
    removeProposedAnnotation(id);
  };

  const handleDismiss = (id: string) => {
    removeProposedAnnotation(id);
  };

  // Calculate positions for all annotations using smart positioning
  // useMemo dependency array excludes editorRef - relies on proposedAnnotations only
  const annotationPositions = useMemo(() => {
    const editor = editorRef.current?.getEditor() || null;
    const positions: AnnotationPosition[] = [];

    proposedAnnotations.forEach((annotation) => {
      const position = calculateAnnotationPosition(editor, annotation, positions);
      positions.push(position);
    });

    return positions;
  }, [proposedAnnotations]);

  return (
    <>
      {proposedAnnotations.map((annotation, index) => (
        <AnnotationCard
          key={annotation.id}
          annotation={annotation}
          onApprove={handleApprove}
          onDismiss={handleDismiss}
          position={annotationPositions[index]}
        />
      ))}
    </>
  );
}
