"use client";

import { useState } from "react";
import { OptionCard } from "@/components/ui/OptionCard";
import type { FormData, Country } from "@/types";
import { US_STATES } from "@/lib/us-states";

const OPTIONS: { value: Country; icon: string }[] = [
  { value: "USA", icon: "🇺🇸" },
  { value: "UK", icon: "🇬🇧" },
  { value: "Canada", icon: "🇨🇦" },
  { value: "Australia", icon: "🇦🇺" },
  { value: "South Africa", icon: "🇿🇦" },
  { value: "Other", icon: "🌍" },
];

type Props = {
  data: Partial<FormData>;
  onUpdate: (updates: Partial<FormData>) => void;
  onNext: () => void;
};

export function Step1Country({ data, onUpdate, onNext }: Props) {
  const [stateError, setStateError] = useState(false);

  const handleContinue = () => {
    if (!data.state) {
      setStateError(true);
      return;
    }
    onNext();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Where are you making aliyah from?
      </h2>
      <p className="text-gray-500 mb-6">
        {"We'll tailor your plan to your country's specific requirements."}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.value}
            icon={opt.icon}
            selected={data.country === opt.value}
            onClick={() => {
              if (opt.value === "USA") {
                // USA needs a state before advancing — don't auto-next
                onUpdate({ country: opt.value });
              } else {
                onUpdate({ country: opt.value, state: undefined });
                setTimeout(onNext, 200);
              }
            }}
          />
        ))}
      </div>

      {data.country === "USA" && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Which state?
          </label>
          <select
            value={data.state ?? ""}
            onChange={(e) => {
              onUpdate({ state: e.target.value });
              if (stateError) setStateError(false);
            }}
            className={`w-full px-4 py-3 rounded-lg border text-gray-900 focus:outline-none focus:ring-2 focus:ring-olive/40 ${
              stateError ? "border-red-400" : "border-gray-200"
            }`}
          >
            <option value="" disabled>
              Select your state…
            </option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {stateError && (
            <p className="text-red-500 text-xs mt-1">Please select your state</p>
          )}
          <button
            type="button"
            onClick={handleContinue}
            className="w-full mt-4 bg-olive text-white py-3 rounded-lg font-bold text-sm hover:bg-olive-dark transition-colors"
          >
            Continue →
          </button>
        </div>
      )}
    </div>
  );
}
