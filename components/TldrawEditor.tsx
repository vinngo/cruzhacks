"use client";

import { Tldraw, createTLStore, Editor } from "tldraw";
import "tldraw/tldraw.css";
import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { createScreenshotPartUtil } from "@/lib/utils";

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

    const handleMount = (editor: Editor) => {
      editorRef.current = editor;

      // Notify parent on canvas changes if onChange provided
      if (onChange) {
        const cleanup = store.listen(() => {
          onChange();
        });
        return cleanup;
      }
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
