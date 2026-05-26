"use client";

import { OptionCard } from "@/components/ui/OptionCard";
import type { FormData, TargetArea } from "@/types";

const OPTIONS: { value: TargetArea; icon: string }[] = [
  { value: "Tel Aviv", icon: "🏙️" },
  { value: "Jerusalem", icon: "🕍" },
  { value: "Ra'anana/Herzliya", icon: "🌳" },
  { value: "Modi'in", icon: "🏘️" },
  { value: "Beer Sheva", icon: "🌵" },
  { value: "Haifa", icon: "⚓" },
  { value: "Other", icon: "📍" },
];

type Props = {
  data: Partial<FormData>;
  onUpdate: (updates: Partial<FormData>) => void;
  onNext: () => void;
};

export function Step2Area({ data, onUpdate, onNext }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Where in Israel are you considering?
      </h2>
      <p className="text-gray-500 mb-6">
        Your target area affects housing, schools, and community resources.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.value}
            icon={opt.icon}
            selected={data.targetArea === opt.value}
            onClick={() => {
              onUpdate({ targetArea: opt.value });
              setTimeout(onNext, 200);
            }}
          />
        ))}
      </div>
    </div>
  );
}
