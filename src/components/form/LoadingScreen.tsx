"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CONSULTATION_URL } from "@/lib/config";

const MESSAGES = [
  "Analysing your aliyah profile...",
  "Consulting our Israel knowledge base...",
  "Building your personalised timeline...",
  "Preparing your document checklist...",
  "Generating your PDF plan...",
  "Almost ready...",
];

// After this many seconds, show the thank-you screen regardless of status
const TIMEOUT_SECONDS = 90;

type Props = {
  leadId: string;
  onComplete: (pdfUrl: string, score: number) => void;
  onError: () => void;
};

export function LoadingScreen({ leadId, onComplete, onError }: Props) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [timedOut, setTimedOut] = useState(false);

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

    // Safety valve — show thank-you after TIMEOUT_SECONDS even if pipeline is still running
    const timeoutId = setTimeout(() => {
      clearInterval(pollInterval);
      clearInterval(msgInterval);
      setTimedOut(true);
    }, TIMEOUT_SECONDS * 1000);

    return () => {
      clearInterval(msgInterval);
      clearInterval(pollInterval);
      clearTimeout(timeoutId);
    };
  }, [leadId, onComplete, onError]);

  if (timedOut) {
    return <ThankYouScreen />;
  }

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
        This usually takes about 30 seconds
      </p>

      {/* Reassurance while they wait */}
      <div className="mt-10 max-w-sm bg-olive/5 border border-olive/20 rounded-xl p-5 text-left">
        <p className="text-olive font-semibold text-sm mb-1">Almost there!</p>
        <p className="text-gray-500 text-sm leading-relaxed">
          Your personalised aliyah plan is being prepared. Once ready, it will
          land straight in your inbox — check your spam folder if you
          don&apos;t see it within a few minutes.
        </p>
      </div>
    </div>
  );
}

export function ThankYouScreen() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-20 h-20 bg-olive/10 border-2 border-olive/30 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-4xl">✉️</span>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        Thank you for using the Olim Navigator Tool!
      </h2>
      <p className="text-gray-500 text-base leading-relaxed max-w-sm mb-2">
        Your personalised aliyah plan is on its way to your inbox.
      </p>
      <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-8">
        Don&apos;t see it? Check your <strong>spam or junk folder</strong> —
        some email providers filter it the first time.
      </p>

      <a
        href={CONSULTATION_URL}
        className="bg-olive text-white px-6 py-3 rounded-lg font-semibold hover:bg-olive-dark transition-colors text-sm"
      >
        Book a Free Consultation →
      </a>
    </div>
  );
}
