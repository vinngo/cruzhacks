"use client";

import {
  Tldraw,
  createTLStore,
  loadSnapshot,
  getSnapshot,
  createShapeId,
  Editor,
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
function throttle(fn: Function, delay: number) {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: any[]) => {
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
}

export interface CustomTldrawEditorProps {
  onChange?: () => void;
}

const TldrawEditor = forwardRef<TldrawEditorRef, CustomTldrawEditorProps>(
  ({ onChange }, ref) => {
    const store = useMemo(() => createTLStore(), []);
    const editorRef = useRef<Editor | null>(null);

    useLayoutEffect(() => {
      // Load persisted state from localStorage
      const persisted = localStorage.getItem(STORAGE_KEY);
      if (persisted) {
        try {
          loadSnapshot(store, JSON.parse(persisted));
        } catch (error) {
          console.error("Failed to load canvas state:", error);
        }
      }

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
    }));

    return (
      <div className="w-full h-full">
        <Tldraw
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
