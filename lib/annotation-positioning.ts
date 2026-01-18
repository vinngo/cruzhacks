import { Editor } from "tldraw";
import { ProposedAnnotation } from "./types/annotations";

export interface AnnotationPosition {
  x: number; // pixels from left (screen coordinates)
  y: number; // pixels from top (screen coordinates)
}

const ANNOTATION_WIDTH = 280; // Estimated card width in pixels
const ANNOTATION_HEIGHT = 120; // Estimated card height in pixels
const PADDING = 20; // Edge padding

/**
 * Calculate annotation position based on positionHint and viewport bounds
 * Uses screen coordinates (CSS pixels) for overlay positioning
 * MVP limitation: Uses viewport bounds, not shape overlap detection
 */
export function calculateAnnotationPosition(
  editor: Editor | null,
  annotation: ProposedAnnotation,
  existingPositions: AnnotationPosition[] = [],
): AnnotationPosition {
  // Fallback if no editor
  if (!editor) {
    return { x: PADDING, y: PADDING };
  }

  const { positionHint = "top-right" } = annotation;

  // Get viewport bounds (screen space)
  const viewport = editor.getViewportScreenBounds();

  // Calculate preferred position based on hint
  const preferredPosition = getPreferredPosition(positionHint, viewport);

  // Check if preferred position overlaps existing annotations
  if (!overlapsExisting(preferredPosition, existingPositions)) {
    return preferredPosition;
  }

  // Try other corners if preferred is taken
  const fallbackPositions = getAllPositions(viewport).filter(
    (pos) => !overlapsExisting(pos, existingPositions),
  );

  if (fallbackPositions.length > 0) {
    return fallbackPositions[0];
  }

  // Last resort: stack below last annotation
  if (existingPositions.length > 0) {
    const lastPos = existingPositions[existingPositions.length - 1];
    return { x: lastPos.x, y: lastPos.y + ANNOTATION_HEIGHT + 10 };
  }

  return preferredPosition; // Accept overlap if unavoidable
}

function getPreferredPosition(
  hint: string,
  viewport: { x: number; y: number; w: number; h: number },
): AnnotationPosition {
  const positions: Record<string, AnnotationPosition> = {
    "top-left": {
      x: PADDING,
      y: PADDING,
    },
    "top-right": {
      x: viewport.w - ANNOTATION_WIDTH - PADDING,
      y: PADDING,
    },
    "bottom-left": {
      x: PADDING,
      y: viewport.h - ANNOTATION_HEIGHT - PADDING,
    },
    "bottom-right": {
      x: viewport.w - ANNOTATION_WIDTH - PADDING,
      y: viewport.h - ANNOTATION_HEIGHT - PADDING,
    },
    center: {
      x: (viewport.w - ANNOTATION_WIDTH) / 2,
      y: (viewport.h - ANNOTATION_HEIGHT) / 2,
    },
  };

  return positions[hint] || positions["top-right"];
}

function getAllPositions(viewport: {
  x: number;
  y: number;
  w: number;
  h: number;
}): AnnotationPosition[] {
  return [
    getPreferredPosition("top-right", viewport),
    getPreferredPosition("top-left", viewport),
    getPreferredPosition("bottom-right", viewport),
    getPreferredPosition("bottom-left", viewport),
  ];
}

function overlapsExisting(
  pos: AnnotationPosition,
  existing: AnnotationPosition[],
): boolean {
  const box = {
    x1: pos.x,
    y1: pos.y,
    x2: pos.x + ANNOTATION_WIDTH,
    y2: pos.y + ANNOTATION_HEIGHT,
  };

  return existing.some((existingPos) => {
    const existingBox = {
      x1: existingPos.x,
      y1: existingPos.y,
      x2: existingPos.x + ANNOTATION_WIDTH,
      y2: existingPos.y + ANNOTATION_HEIGHT,
    };

    return !(
      box.x2 < existingBox.x1 ||
      box.x1 > existingBox.x2 ||
      box.y2 < existingBox.y1 ||
      box.y1 > existingBox.y2
    );
  });
}
