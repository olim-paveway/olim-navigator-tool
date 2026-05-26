"use client";

import { useState } from "react";
import type { FormData } from "@/types";

type Props = {
  data: Partial<FormData>;
  onUpdate: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onSubmit: () => void;
};

export function Step8Contact({ data, onUpdate, onSubmit }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.firstName?.trim()) e.firstName = "First name is required";
    if (!data.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      e.email = "Valid email address required";
    if (!data.gdprConsent) e.gdprConsent = "Consent is required to receive your plan";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    onSubmit();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {"Almost there — where should we send your plan?"}
      </h2>
      <p className="text-gray-500 mb-6">
        Your personalised PDF will be delivered to your inbox within 60 seconds.
      </p>

      <div className="space-y-4 mb-6">
        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            type="text"
            value={data.firstName ?? ""}
            onChange={(e) => {
              onUpdate({ firstName: e.target.value });
              if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: "" }));
            }}
            placeholder="Moshe"
            className={`w-full px-4 py-3 rounded-lg border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-olive/40 ${
              errors.firstName ? "border-red-400" : "border-gray-200"
            }`}
          />
          {errors.firstName && (
            <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={data.email ?? ""}
            onChange={(e) => {
              onUpdate({ email: e.target.value });
              if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
            }}
            placeholder="moshe@example.com"
            className={`w-full px-4 py-3 rounded-lg border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-olive/40 ${
              errors.email ? "border-red-400" : "border-gray-200"
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* GDPR */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.gdprConsent ?? false}
              onChange={(e) => {
                onUpdate({ gdprConsent: e.target.checked });
                if (errors.gdprConsent)
                  setErrors((prev) => ({ ...prev, gdprConsent: "" }));
              }}
              className="mt-1 h-4 w-4 accent-olive"
            />
            <span className="text-sm text-gray-600">
              I consent to receive my personalised aliyah plan and occasional
              helpful resources from Olim Paveway. I can unsubscribe at any
              time.{" "}
              <a
                href="https://www.olimpaveway.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-olive underline"
              >
                Privacy Policy
              </a>
            </span>
          </label>
          {errors.gdprConsent && (
            <p className="text-red-500 text-xs mt-1">{errors.gdprConsent}</p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="w-full bg-olive text-white py-4 rounded-lg font-bold text-base hover:bg-olive-dark transition-colors"
      >
        Generate My Aliyah Plan →
      </button>
    </div>
  );
}
