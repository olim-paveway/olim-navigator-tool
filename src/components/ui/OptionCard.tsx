"use client";

type OptionCardProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon?: string;
};

export function OptionCard({ label, selected, onClick, icon }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full text-left px-4 py-3 rounded-lg border-2 transition-all duration-150
        flex items-center gap-3 font-medium text-sm
        ${
          selected
            ? "border-olive bg-olive/10 text-olive"
            : "border-gray-200 bg-white text-gray-700 hover:border-olive/40"
        }
      `}
    >
      {icon && <span className="text-xl">{icon}</span>}
      <span className="flex-1">{label}</span>
      {selected && <span className="text-olive font-bold">✓</span>}
    </button>
  );
}
