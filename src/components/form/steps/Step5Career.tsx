"use client";

import { OptionCard } from "@/components/ui/OptionCard";
import type { FormData, Career } from "@/types";

const OPTIONS: { value: Career; icon: string }[] = [
  { value: "Remote worker", icon: "💻" },
  { value: "Need Israeli employment", icon: "🏢" },
  { value: "Self-employed", icon: "🚀" },
  { value: "Student", icon: "🎓" },
  { value: "Retired", icon: "🌴" },
];

type Props = {
  data: Partial<FormData>;
  onUpdate: (updates: Partial<FormData>) => void;
  onNext: () => void;
};

export function Step5Career({ data, onUpdate, onNext }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {"What's your career situation?"}
      </h2>
      <p className="text-gray-500 mb-6">
        Your employment status shapes the financial and practical side of your
        aliyah plan.
      </p>
      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.value}
            icon={opt.icon}
            selected={data.career === opt.value}
            onClick={() => {
              onUpdate({ career: opt.value });
              setTimeout(onNext, 200);
            }}
          />
        ))}
      </div>
    </div>
  );
}
