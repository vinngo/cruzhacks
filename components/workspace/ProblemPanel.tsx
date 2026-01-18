"use client";

import Image from "next/image";
import { useProblem } from "@/lib/problem-context";

export default function ProblemPanel() {
  const { problemText, problemImage } = useProblem();

  if (problemText) {
    return (
      <div className="h-full bg-background p-6 overflow-y-auto">
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Problem</h2>
          <p className="text-gray-600 leading-relaxed">
            {problemText ? problemText : "No problem selected"}
          </p>
        </div>
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-5 rounded-r-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            💡 How to Use Socratical
          </h3>
          <div className="space-y-3 text-gray-700">
            <div className="flex gap-3">
              <span className="text-blue-600 font-bold flex-shrink-0">1.</span>
              <p>
                <strong>Start working on the canvas</strong> - Draw, write
                equations, or sketch your thinking process
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-blue-600 font-bold flex-shrink-0">2.</span>
              <p>
                <strong>Get Socratic guidance</strong> - The AI tutor will ask
                questions to help you discover the solution yourself
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-blue-600 font-bold flex-shrink-0">3.</span>
              <p>
                <strong>Use chat for discussion</strong> - Ask questions, share
                your reasoning, and get feedback in the chat panel
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-blue-200">
              <p className="text-sm text-gray-600 italic">
                💭 Tip: You can use other tools such as shapes, text, and even
                images to enhance your problem-solving process with the agent.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (problemImage && problemImage.url) {
    return (
      <div className="h-full bg-background p-6 overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Problem</h2>
        <Image
          src={problemImage.url}
          alt="Problem Image"
          width={500}
          height={300}
          className="max-w-full h-auto rounded-lg shadow-sm"
        />
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-5 rounded-r-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            💡 How to Use Socratical
          </h3>
          <div className="space-y-3 text-gray-700">
            <div className="flex gap-3">
              <span className="text-blue-600 font-bold flex-shrink-0">1.</span>
              <p>
                <strong>Start working on the canvas</strong> - Draw, write
                equations, or sketch your thinking process
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-blue-600 font-bold flex-shrink-0">2.</span>
              <p>
                <strong>Get Socratic guidance</strong> - The AI tutor will ask
                questions to help you discover the solution yourself
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-blue-600 font-bold flex-shrink-0">3.</span>
              <p>
                <strong>Use chat for discussion</strong> - Ask questions, share
                your reasoning, and get feedback in the chat panel
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-blue-200">
              <p className="text-sm text-gray-600 italic">
                💭 Tip: You can use other tools such as shapes, text, and even
                images to enhance your problem-solving process with the agent.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="h-full bg-gray-50 p-6 overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Problem</h2>
        <p className="text-gray-600 leading-relaxed">No problem selected</p>
      </div>
    );
  }
}
