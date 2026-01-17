import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Editor } from "tldraw";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface BasePromptPart<T extends string = string> {
  type: T;
}

export interface ScreenshotPart extends BasePromptPart<"screenshot"> {
  screenshot: string | null;
}

async function blobToDataUrl(file: Blob): Promise<string> {
  return await new Promise((resolve, reject) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.onabort = (error) => reject(error);
      reader.readAsDataURL(file);
    }
  });
}

export function createScreenshotPartUtil(editor: Editor) {
  return {
    type: "screenshot" as const,
    getPart: async (): Promise<ScreenshotPart> => {
      const allShapes = editor.getCurrentPageShapeIds();

      if (allShapes.size === 0) {
        return { type: "screenshot" as const, screenshot: null };
      }

      const pageBounds = editor.getCurrentPageBounds();

      if (!pageBounds) {
        return { type: "screenshot" as const, screenshot: null };
      }

      const { w, h } = pageBounds;

      const scale = Math.max(w, h) > 8000 ? 8000 / Math.max(w, h) : 1;

      const shapesArr = Array.from(allShapes);

      const result = await editor.toImage(shapesArr, {
        format: "png",
        background: true,
        bounds: pageBounds,
        padding: 0,
        pixelRatio: 1,
        scale,
      });

      const screenshot = await blobToDataUrl(result.blob);

      return { type: "screenshot" as const, screenshot };
    },
    buildContent: ({ screenshot }: ScreenshotPart) => {
      if (!screenshot) {
        return [];
      }

      return [
        "Here is the entire canvas. You can see everything on the page.",
        screenshot,
      ];
    },
  };
}
