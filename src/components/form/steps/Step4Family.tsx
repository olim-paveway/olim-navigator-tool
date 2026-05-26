"use client";

import { OptionCard } from "@/components/ui/OptionCard";
import type { FormData, FamilyType } from "@/types";

const OPTIONS: { value: FamilyType; icon: string }[] = [
  { value: "Single", icon: "🧑" },
  { value: "Couple", icon: "👫" },
  { value: "Couple with children", icon: "👨‍👩‍👧" },
  { value: "Retiree/s", icon: "🌅" },
];

type Props = {
  data: Partial<FormData>;
  onUpdate: (updates: Partial<FormData>) => void;
  onNext: () => void;
};

export function Step4Family({ data, onUpdate, onNext }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {"What's your family situation?"}
      </h2>
      <p className="text-gray-500 mb-6">
        Family structure affects schools, housing size, and absorption benefits.
      </p>
      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.value}
            icon={opt.icon}
            selected={data.familyType === opt.value}
            onClick={() => {
              onUpdate({ familyType: opt.value });
              setTimeout(onNext, 200);
            }}
          />
        ))}
      </div>
    </div>
  );
}
