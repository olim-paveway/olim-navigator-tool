type ProgressBarProps = {
  step: number;
  totalSteps: number;
};

export function ProgressBar({ step, totalSteps }: ProgressBarProps) {
  const pct = Math.round(((step - 1) / (totalSteps - 1)) * 100);
  return (
    <div className="mb-8">
      <div className="flex justify-between text-xs text-gray-400 mb-2">
        <span>
          Step {step} of {totalSteps}
        </span>
        <span>{pct}% complete</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-olive transition-all duration-500 ease-out rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
