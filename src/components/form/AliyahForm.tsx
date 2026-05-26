"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProgressBar } from "./ProgressBar";
import { LoadingScreen } from "./LoadingScreen";
import { SuccessScreen } from "./SuccessScreen";
import { Step1Country } from "./steps/Step1Country";
import { Step2Area } from "./steps/Step2Area";
import { Step3Timeline } from "./steps/Step3Timeline";
import { Step4Family } from "./steps/Step4Family";
import { Step5Career } from "./steps/Step5Career";
import { Step6SpouseCareer } from "./steps/Step6SpouseCareer";
import { Step7Concerns } from "./steps/Step7Concerns";
import { Step8Contact } from "./steps/Step8Contact";
import type { FormData } from "@/types";

type FormState = "form" | "loading" | "success" | "error";

const TOTAL_STEPS = 8;

export function AliyahForm() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [formState, setFormState] = useState<FormState>("form");
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [leadId, setLeadId] = useState<string | null>(null);
  const [result, setResult] = useState<{ pdfUrl: string; score: number } | null>(null);

  const updateForm = useCallback((updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const handleSubmit = useCallback(async () => {
    setFormState("loading");
    try {
      // Capture UTM params from URL
      const urlParams = new URLSearchParams(window.location.search);
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          utmSource: urlParams.get("utm_source"),
          utmMedium: urlParams.get("utm_medium"),
          utmCampaign: urlParams.get("utm_campaign"),
        }),
      });
      if (!res.ok) throw new Error("Submit failed");
      const { leadId: id } = await res.json();
      setLeadId(id);
    } catch {
      setFormState("error");
    }
  }, [formData]);

  if (formState === "loading" && leadId) {
    return (
      <LoadingScreen
        leadId={leadId}
        onComplete={(pdfUrl, score) => {
          setResult({ pdfUrl, score });
          setFormState("success");
        }}
        onError={() => setFormState("error")}
      />
    );
  }

  if (formState === "success" && result) {
    return (
      <SuccessScreen
        pdfUrl={result.pdfUrl}
        score={result.score}
        firstName={formData.firstName ?? ""}
      />
    );
  }

  if (formState === "error") {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-2 font-medium">Something went wrong.</p>
        <p className="text-gray-500 text-sm mb-6">
          Please try again — your answers have been saved.
        </p>
        <button
          onClick={() => {
            setFormState("form");
            setLeadId(null);
          }}
          className="bg-olive text-white px-6 py-3 rounded-lg font-semibold hover:bg-olive-dark transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const stepProps = { data: formData, onUpdate: updateForm, onNext: goNext };

  return (
    <div className="max-w-lg mx-auto">
      <ProgressBar step={step} totalSteps={TOTAL_STEPS} />

      <div className="relative overflow-hidden min-h-[380px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ x: direction > 0 ? 60 : -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? -60 : 60, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            {step === 1 && <Step1Country {...stepProps} />}
            {step === 2 && <Step2Area {...stepProps} />}
            {step === 3 && <Step3Timeline {...stepProps} />}
            {step === 4 && <Step4Family {...stepProps} />}
            {step === 5 && <Step5Career {...stepProps} />}
            {step === 6 && <Step6SpouseCareer {...stepProps} />}
            {step === 7 && <Step7Concerns {...stepProps} />}
            {step === 8 && (
              <Step8Contact {...stepProps} onSubmit={handleSubmit} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {step > 1 && formState === "form" && (
        <button
          onClick={goBack}
          className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Back
        </button>
      )}
    </div>
  );
}
