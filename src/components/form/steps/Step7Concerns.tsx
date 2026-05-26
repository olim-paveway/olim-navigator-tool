"use client";

import { OptionCard } from "@/components/ui/OptionCard";
import type { FormData, Concern } from "@/types";

const OPTIONS: { value: Concern; icon: string }[] = [
  { value: "Bureaucracy", icon: "📝" },
  { value: "Housing", icon: "🏠" },
  { value: "Healthcare", icon: "🏥" },
  { value: "Schools", icon: "🏫" },
  { value: "Employment", icon: "💼" },
  { value: "Hebrew", icon: "🔤" },
  { value: "Finance", icon: "💰" },
  { value: "Community", icon: "👥" },
];

type Props = {
  data: Partial<FormData>;
  onUpdate: (updates: Partial<FormData>) => void;
  onNext: () => void;
};

export function Step7Concerns({ data, onUpdate, onNext }: Props) {
  const selected = data.concerns ?? [];

  const toggle = (concern: Concern) => {
    const next = selected.includes(concern)
      ? selected.filter((c) => c !== concern)
      : [...selected, concern];
    onUpdate({ concerns: next });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {"What are your biggest concerns?"}
      </h2>
      <p className="text-gray-500 mb-6">
        Select all that apply — your plan will address each one.
      </p>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.value}
            icon={opt.icon}
            selected={selected.includes(opt.value)}
            onClick={() => toggle(opt.value)}
          />
        ))}
      </div>
      <button
        type="button"
        disabled={selected.length === 0}
        onClick={onNext}
        className="w-full bg-olive text-white py-3 rounded-lg font-semibold hover:bg-olive-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue
        {selected.length > 0 && (
          <span className="ml-2 text-olive-light text-sm">
            ({selected.length} selected)
          </span>
        )}
      </button>
    </div>
  );
}
