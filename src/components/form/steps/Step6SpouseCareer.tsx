"use client";

import { OptionCard } from "@/components/ui/OptionCard";
import type { FormData, SpouseCareer } from "@/types";

const OPTIONS: { value: SpouseCareer; icon: string }[] = [
  { value: "N/A", icon: "—" },
  { value: "Remote", icon: "💻" },
  { value: "Needs Israeli job", icon: "🏢" },
  { value: "Professional license transfer", icon: "📋" },
  { value: "Other", icon: "❓" },
];

type Props = {
  data: Partial<FormData>;
  onUpdate: (updates: Partial<FormData>) => void;
  onNext: () => void;
};

export function Step6SpouseCareer({ data, onUpdate, onNext }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {"What about your spouse's career?"}
      </h2>
      <p className="text-gray-500 mb-6">
        Select N/A if you are single or your spouse situation was already
        covered.
      </p>
      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.value}
            icon={opt.icon}
            selected={data.spouseCareer === opt.value}
            onClick={() => {
              onUpdate({ spouseCareer: opt.value });
              setTimeout(onNext, 200);
            }}
          />
        ))}
      </div>
    </div>
  );
}
