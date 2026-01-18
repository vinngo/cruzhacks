"use client";

import {
  Tldraw,
  createTLStore,
  getSnapshot,
  createShapeId,
  Editor,
  toRichText,
} from "tldraw";
import "tldraw/tldraw.css";
import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { createScreenshotPartUtil } from "@/lib/utils";

const STORAGE_KEY = "socratic-whiteboard-canvas";

// Custom throttle function to avoid external dependencies
function throttle<T extends unknown[]>(
  fn: (...args: T) => void,
  delay: number,
) {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: T) => {
    if (!timeout) {
      timeout = setTimeout(() => {
        fn(...args);
        timeout = null;
      }, delay);
    }
  };
}

export interface TldrawEditorRef {
  captureScreenshot: () => Promise<string[] | null>;
  getEditor: () => Editor | null;
  addAnnotationToCanvas: (
    text: string,
    screenPosition: { x: number; y: number },
    color: string,
  ) => void;
}

export interface CustomTldrawEditorProps {
  onChange?: () => void;
}

const TldrawEditor = forwardRef<TldrawEditorRef, CustomTldrawEditorProps>(
  ({ onChange }, ref) => {
    const store = useMemo(() => createTLStore(), []);
    const editorRef = useRef<Editor | null>(null);

    useLayoutEffect(() => {
      // Clear canvas state on mount to ensure each problem starts fresh
      localStorage.removeItem(STORAGE_KEY);

      // Save to localStorage on changes (throttled to 500ms)
      const cleanup = store.listen(
        throttle(() => {
          const snapshot = getSnapshot(store);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
          // Notify parent component of changes
          if (onChange) {
            onChange();
          }
        }, 500),
      );

      return cleanup;
    }, [store, onChange]);

    const handleMount = (editor: Editor) => {
      editorRef.current = editor;
    };

    useImperativeHandle(ref, () => ({
      captureScreenshot: async () => {
        if (!editorRef.current) {
          console.warn("Editor not mounted yet");
          return null;
        }

        try {
          const util = createScreenshotPartUtil(editorRef.current);

          const part = await util.getPart();

          const result = util.buildContent(part);

          return result;
        } catch (error) {
          console.error("Failed to capture screenshot:", error);
          return null;
        }
      },
      getEditor: () => editorRef.current,
      addAnnotationToCanvas: (
        text: string,
        screenPosition: { x: number; y: number },
        color: string,
      ) => {
        if (!editorRef.current) {
          console.warn("Editor not mounted yet");
          return;
        }

        // CRITICAL: Convert screen coordinates to page coordinates
        // calculateAnnotationPosition returns screen pixels, but createShape expects page coordinates
        const pagePosition = editorRef.current.screenToPage(screenPosition);

        const shapeId = createShapeId();

        editorRef.current.createShape({
          id: shapeId,
          type: "text",
          x: pagePosition.x,
          y: pagePosition.y,
          props: {
            richText: toRichText(text),
            color, // 'blue' for questions, 'yellow' for hints (tldraw colors)
            size: "m",
            font: "sans",
            textAlign: "start",
            w: 250, // Width of text box
            autoSize: false,
            scale: 1,
          },
        });

        // Optional: Select the new shape to draw attention
        editorRef.current.select(shapeId);
      },
    }));

    return (
      <div className="w-full h-full">
        <Tldraw
          licenseKey={process.env.NEXT_PUBLIC_TLDRAW_LICENSE_KEY}
          store={store}
          onMount={handleMount}
          components={{
            ContextMenu: null,
            ActionsMenu: null,
            HelpMenu: null,
            MainMenu: null,
            StylePanel: null,
            // Toolbar remains visible (undefined means keep default)
          }}
        />
      </div>
    );
  },
);

TldrawEditor.displayName = "TldrawEditor";

export default TldrawEditor;
