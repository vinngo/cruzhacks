"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ChatInput from "@/components/landing/ChatInput";
import { useProblem } from "@/lib/problem-context";
import { cn } from "@/lib/utils";

export default function Home() {
  const [problemText, setProblemText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const router = useRouter();
  const { setProblem, setProblemImage } = useProblem();

  const handleSubmit = () => {
    if (problemText.trim() || image) {
      // Navigate to workspace
      if (problemText.trim()) {
        setProblem(problemText);
      }
      if (image) {
        setProblemImage(image);
      }
      setSubmitted(true);
      setTimeout(() => {
        router.push("/workspace");
      }, 800);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center justify-center gap-8 px-8 max-w-3xl"
      >
        {/* Heading */}
        <div className="text-center space-y-4">
          <motion.h1
            animate={{
              x: submitted ? -630 : 0,
              y: submitted ? -200 : 0,
              transition: { duration: 0.5, ease: "easeInOut" },
            }}
            className={cn(
              "font-semibold text-gray-900 tracking-tight",
              submitted ? "text-4xl" : "text-6xl",
            )}
          >
            Socratical
          </motion.h1>
          <motion.p
            animate={{ opacity: submitted ? 0 : 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-xl text-gray-600 max-w-2xl"
          >
            An intelligent whiteboard for visual problem solving.
          </motion.p>
        </div>

        {/* Chat Input */}
        <motion.div
          animate={{ opacity: submitted ? 0 : 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full"
        >
          <ChatInput
            value={problemText}
            onChange={setProblemText}
            onSubmit={handleSubmit}
            image={image}
            onImageSelect={setImage}
          />
        </motion.div>

        {/* Subtle hint */}
        <motion.p
          animate={{ opacity: submitted ? 0 : 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-sm text-gray-400 text-center"
        >
          Work on a digital canvas while AI asks guiding questions
        </motion.p>
      </motion.div>
    </div>
  );
}
