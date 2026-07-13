"use client";

import { OptionCard } from "@/components/ui/OptionCard";
import type { FormData, Country } from "@/types";

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
              onUpdate({ country: opt.value });
              setTimeout(onNext, 200);
            }}
          />
        ))}
      </div>
    </div>
  );
}
