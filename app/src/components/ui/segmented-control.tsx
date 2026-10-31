import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
}

/** Pill-style tabs: the prototype's "segmented control". */
export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: ReadonlyArray<SegmentOption<T>>;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex bg-stone p-1 rounded-xl border border-stoneDark">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition inline-flex items-center gap-1.5",
              active ? "bg-ivory text-espresso shadow-sm" : "text-slateWarm hover:text-espresso",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
