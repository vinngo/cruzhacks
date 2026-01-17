'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ChatInput from '@/components/landing/ChatInput';

export default function Home() {
  const [problem, setProblem] = useState('');
  const router = useRouter();

  const handleSubmit = () => {
    if (problem.trim()) {
      // Navigate to workspace
      router.push('/workspace');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center justify-center gap-8 px-8 max-w-3xl"
      >
        {/* Heading */}
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-semibold text-gray-900 tracking-tight">
            Socratic Whiteboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            An AI tutor that guides you through math problems using the Socratic method.
            Describe your problem below to get started.
          </p>
        </div>

        {/* Chat Input */}
        <ChatInput
          value={problem}
          onChange={setProblem}
          onSubmit={handleSubmit}
        />

        {/* Subtle hint */}
        <p className="text-sm text-gray-400 text-center">
          Work on a digital canvas while AI asks guiding questions
        </p>
      </motion.div>
    </div>
  );
}
