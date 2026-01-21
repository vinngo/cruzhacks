"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useProblem } from "@/lib/problem-context";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";

export default function Home() {
  const router = useRouter();
  const { setProblem, setProblemImage } = useProblem();

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    // Set problem data
    if (message.text.trim()) {
      setProblem(message.text);
    }
    if (message.files && message.files.length > 0) {
      // Convert the first file attachment to File object
      const fileUrl = message.files[0];
      if (fileUrl && fileUrl.url) {
        fetch(fileUrl.url)
          .then((res) => res.blob())
          .then((blob) => {
            const file = new File([blob], fileUrl.filename || "image.png", {
              type: fileUrl.mediaType || "image/png",
            });
            setProblemImage(file);
          })
          .catch(() => {
            // Handle error silently
          });
      }
    }

    // Navigate immediately to workspace
    router.push("/workspace");
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
            layoutId="socratical-header"
            className="font-semibold text-gray-900 tracking-tight text-6xl"
          >
            Socratical
          </motion.h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            An intelligent whiteboard for visual problem solving.
          </p>
        </div>

        {/* Chat Input */}
        <div className="w-full">
          <PromptInputProvider>
            <PromptInput globalDrop multiple onSubmit={handleSubmit}>
              <PromptInputAttachments>
                {(attachment) => <PromptInputAttachment data={attachment} />}
              </PromptInputAttachments>
              <PromptInputBody>
                <PromptInputTextarea placeholder="Enter your problem or question..." />
              </PromptInputBody>
              <PromptInputFooter>
                <PromptInputTools>
                  <PromptInputActionMenu>
                    <PromptInputActionMenuTrigger />
                    <PromptInputActionMenuContent>
                      <PromptInputActionAddAttachments />
                    </PromptInputActionMenuContent>
                  </PromptInputActionMenu>
                </PromptInputTools>
                <PromptInputSubmit />
              </PromptInputFooter>
            </PromptInput>
          </PromptInputProvider>
        </div>

        {/* Subtle hint */}
        <p className="text-sm text-gray-400 text-center">
          Work on a digital canvas while AI asks guiding questions
        </p>
      </motion.div>
    </div>
  );
}
