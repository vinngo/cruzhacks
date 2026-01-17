"use client";

import { useContext, createContext, useState } from "react";

export type ProblemContextType = {
  problemText: string | null;
  problemImage: { url: string; file: File };
  setProblem(text: string): void;
  setProblemImage(file: File): void;
  clearProblem(): void;
};

export const ProblemContext = createContext<ProblemContextType | null>(null);

export const ProblemProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [problemText, setProblemText] = useState<string | null>(null);
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
    setProblemText(null);
    if (problemImage) {
      URL.revokeObjectURL(problemImage.url);
    }
    setProblemImageState(null);
  };

  return (
    <ProblemContext.Provider
      value={{
        problemText,
        problemImage: problemImage || { url: "", file: new File([], "") },
        setProblem,
        setProblemImage,
        clearProblem,
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
