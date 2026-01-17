"use client";

import { useRouter } from "next/navigation";
import { useProblem } from "@/lib/problem-context";
import { RotateCcw } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const { clearProblem } = useProblem();

  const handleRestart = () => {
    // Clear localStorage canvas state
    localStorage.removeItem("socratic-whiteboard-canvas");

    // Clear problem context
    clearProblem();

    // Redirect to home
    router.push("/");
  };

  return (
    <div className="flex items-center justify-between border-b px-3 py-3">
      <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">
        Socratical
      </h1>

      <button
        onClick={handleRestart}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        Restart
      </button>
    </div>
  );
}
