"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MESSAGES = [
  "Analysing your aliyah profile...",
  "Consulting our Israel knowledge base...",
  "Building your personalised timeline...",
  "Preparing your document checklist...",
  "Generating your PDF plan...",
  "Almost ready...",
];

type Props = {
  leadId: string;
  onComplete: (pdfUrl: string, score: number) => void;
  onError: () => void;
};

export function LoadingScreen({ leadId, onComplete, onError }: Props) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIndex((i) => Math.min(i + 1, MESSAGES.length - 1));
    }, 3000);

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/status/${leadId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === "completed" && data.pdfUrl) {
          clearInterval(pollInterval);
          clearInterval(msgInterval);
          onComplete(data.pdfUrl, data.readinessScore ?? 0);
        } else if (data.status === "failed") {
          clearInterval(pollInterval);
          clearInterval(msgInterval);
          onError();
        }
      } catch {
        // Ignore transient fetch errors during polling
      }
    }, 2000);

    return () => {
      clearInterval(msgInterval);
      clearInterval(pollInterval);
    };
  }, [leadId, onComplete, onError]);

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 border-4 border-olive border-t-transparent rounded-full animate-spin mb-8" />
      <AnimatePresence mode="wait">
        <motion.p
          key={msgIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="text-gray-600 text-lg"
        >
          {MESSAGES[msgIndex]}
        </motion.p>
      </AnimatePresence>
      <p className="text-gray-400 text-sm mt-4">
        This usually takes about 15 seconds
      </p>
    </div>
  );
}
