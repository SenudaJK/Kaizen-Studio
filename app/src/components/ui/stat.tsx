import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const TONES = { sage: "text-sage", terracotta: "text-terracotta", espresso: "text-espresso" } as const;

/** A KPI tile: tiny mono label, big mono number. */
export function Stat({
  label,
  value,
  tone = "espresso",
  caption,
}: {
  label: ReactNode;
  value: ReactNode;
  tone?: keyof typeof TONES;
  caption?: ReactNode;
}) {
  return (
    <div className="bg-ivory px-4 py-3 rounded-xl editorial-border shadow-editorial min-w-0">
      <div className="text-[11px] font-mono uppercase text-slateWarm">{label}</div>
      <div className={cn("font-mono text-xl font-semibold mt-0.5", TONES[tone])}>{value}</div>
      {caption && <div className="text-[11px] text-slateWarm mt-0.5">{caption}</div>}
    </div>
  );
}
