"use client";

import { Tldraw, createTLStore, Editor } from "tldraw";
import "tldraw/tldraw.css";
import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { createScreenshotPartUtil } from "@/lib/utils";

// Debounce utility - only call after user stops making changes
function debounce(fn: Function, delay: number) {
  let timeoutId: NodeJS.Timeout | null = null;
  return (...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

export interface TldrawEditorRef {
  captureScreenshot: () => Promise<string[] | null>;
  getEditor: () => Editor | null;
}

export interface CustomTldrawEditorProps {
  onChange?: () => void;
}

const TldrawEditor = forwardRef<TldrawEditorRef, CustomTldrawEditorProps>(
  ({ onChange }, ref) => {
    const store = useMemo(() => createTLStore(), []);
    const editorRef = useRef<Editor | null>(null);

    // Create stable debounced onChange function
    const debouncedOnChange = useMemo(() => {
      if (!onChange) return null;
      return debounce(onChange, 1000); // 1 second debounce at tldraw level
    }, [onChange]);

    // Set up debounced onChange listener
    useEffect(() => {
      if (!debouncedOnChange) return;

      const cleanup = store.listen(() => {
        debouncedOnChange();
      });

      return cleanup;
    }, [store, debouncedOnChange]);

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
