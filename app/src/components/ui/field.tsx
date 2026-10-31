import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

const CONTROL =
  "w-full bg-stone/70 border border-stoneDark rounded-xl px-3.5 py-2.5 text-sm text-espresso placeholder:text-slateWarm focus:outline-none focus:border-terracotta transition";

export function TextInput({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(CONTROL, className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(CONTROL, className)} {...props} />;
}

/** A label, a control and an optional hint, wired together for screen readers. */
export function Field({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-espresso mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-slateWarm mt-1.5">{hint}</span>}
    </label>
  );
}
