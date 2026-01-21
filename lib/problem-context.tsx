"use client";

import { ProposedAnnotation } from "./types/annotations";
import { AnnotationPosition } from "./annotation-positioning";
import { useContext, createContext, useState } from "react";

export type ProblemContextType = {
  problemText: string;
  problemImage: { url: string; file: File };
  setProblem(text: string): void;
  setProblemImage(file: File): void;
  clearProblem(): void;
  chatInitialized: boolean;
  initializeChat(): void;
  canvasScreenshot: string | null;
  setCanvasScreenshot(screenshot: string | null): void;
  proposedAnnotations: ProposedAnnotation[];
  annotationPositions: Map<string, AnnotationPosition>;
  addProposedAnnotation(annotation: ProposedAnnotation): void;
  removeProposedAnnotation(id: string): void;
  clearProposedAnnotations(): void;
  setAnnotationPosition(id: string, position: AnnotationPosition): void;
};

export const ProblemContext = createContext<ProblemContextType | null>(null);

export const ProblemProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [problemText, setProblemText] = useState<string>("");
  const [problemImage, setProblemImageState] = useState<{
    url: string;
    file: File;
  } | null>(null);

  const setProblem = (text: string) => {
    setProblemText(text);
  };

  const setProblemImage = (file: File) => {
    const url = URL.createObjectURL(file);
    setProblemImageState({ url, file });
  };

  const clearProblem = () => {
    setProblemText("");
    if (problemImage) {
      URL.revokeObjectURL(problemImage.url);
    }
    setProblemImageState(null);
  };

  const [chatInitialized, setChatInitialized] = useState(false);

  const initializeChat = () => {
    setChatInitialized(true);
  };

  const [canvasScreenshot, setCanvasScreenshotState] = useState<string | null>(
    null,
  );

  const setCanvasScreenshot = (screenshot: string | null) => {
    setCanvasScreenshotState(screenshot);
  };

  const [proposedAnnotations, setProposedAnnotations] = useState<
    ProposedAnnotation[]
  >([]);

  const [annotationPositions, setAnnotationPositions] = useState<
    Map<string, AnnotationPosition>
  >(new Map());

  const addProposedAnnotation = (annotation: ProposedAnnotation) => {
    setProposedAnnotations((prev) => [...prev, annotation]);
  };

  const removeProposedAnnotation = (id: string) => {
    setProposedAnnotations((prev) =>
      prev.filter((annotation) => annotation.id !== id),
    );
    setAnnotationPositions((prev) => {
      const updated = new Map(prev);
      updated.delete(id);
      return updated;
    });
  };

  const clearProposedAnnotations = () => {
    setProposedAnnotations([]);
    setAnnotationPositions(new Map());
  };

  const setAnnotationPosition = (id: string, position: AnnotationPosition) => {
    setAnnotationPositions((prev) => new Map(prev).set(id, position));
  };

  return (
    <ProblemContext.Provider
      value={{
        problemText,
        problemImage: problemImage || { url: "", file: new File([], "") },
        setProblem,
        setProblemImage,
        clearProblem,
        chatInitialized,
        initializeChat,
        canvasScreenshot,
        setCanvasScreenshot,
        proposedAnnotations,
        annotationPositions,
        addProposedAnnotation,
        removeProposedAnnotation,
        clearProposedAnnotations,
        setAnnotationPosition,
      }}
    >
      {children}
    </ProblemContext.Provider>
  );
};

export const useProblem = () => {
  const context = useContext(ProblemContext);
  if (!context) {
    throw new Error("useProblemContext must be used within a ProblemProvider");
  }
  return context;
};
