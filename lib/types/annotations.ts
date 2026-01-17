export type AnnotationType = "question" | "hint";

export interface ProposedAnnotation {
  id: string;
  type: AnnotationType;
  text: string;
  positionHint?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  position?: {
    x: number;
    y: number;
  };
  color?: string;
}

export interface AnnotationProposal {
  annotations: ProposedAnnotation[];
}
