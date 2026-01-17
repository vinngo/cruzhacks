"use client";

import Image from "next/image";
import { useProblem } from "@/lib/problem-context";

export default function ProblemPanel() {
  const { problemText, problemImage } = useProblem();

  if (problemText) {
    return (
      <div className="h-full bg-gray-50 p-6 overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Problem</h2>
        <p className="text-gray-600 leading-relaxed">
          {problemText ? problemText : "No problem selected"}
        </p>
      </div>
    );
  } else if (problemImage && problemImage.url) {
    return (
      <div className="h-full bg-gray-50 p-6 overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Problem</h2>
        <Image
          src={problemImage.url}
          alt="Problem Image"
          width={500}
          height={300}
          className="max-w-full h-auto rounded-lg shadow-sm"
        />
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
