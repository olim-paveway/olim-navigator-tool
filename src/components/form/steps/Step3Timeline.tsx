"use client";

import { OptionCard } from "@/components/ui/OptionCard";
import type { FormData, Timeline } from "@/types";

const OPTIONS: { value: Timeline; icon: string; description: string }[] = [
  { value: "0-6 months", icon: "🚀", description: "Moving very soon" },
  { value: "6-12 months", icon: "📅", description: "Within the year" },
  { value: "1-2 years", icon: "🗓️", description: "Planning ahead" },
  { value: "Just exploring", icon: "🔍", description: "Still considering" },
];

type Props = {
  data: Partial<FormData>;
  onUpdate: (updates: Partial<FormData>) => void;
  onNext: () => void;
};

export function Step3Timeline({ data, onUpdate, onNext }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {"What's your aliyah timeline?"}
      </h2>
      <p className="text-gray-500 mb-6">
        This helps us prioritise the most time-sensitive steps for you.
      </p>
      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            label={`${opt.value} — ${opt.description}`}
            icon={opt.icon}
            selected={data.timeline === opt.value}
            onClick={() => {
              onUpdate({ timeline: opt.value });
              setTimeout(onNext, 200);
            }}
          />
        ))}
      </div>
    </div>
  );
}
