import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("bg-ivory rounded-2xl editorial-border shadow-editorial p-6", className)} {...props} />;
}

const EYEBROW_TONES = {
  terracotta: "text-terracotta",
  sage: "text-sage",
  slate: "text-slateWarm",
} as const;

export type EyebrowTone = keyof typeof EYEBROW_TONES;

export function Eyebrow({ tone = "terracotta", className, ...props }: ComponentProps<"span"> & { tone?: EyebrowTone }) {
  return (
    <span
      className={cn("font-mono text-[11px] uppercase tracking-widest font-semibold", EYEBROW_TONES[tone], className)}
      {...props}
    />
  );
}

/** Eyebrow + serif title + optional description, with an optional control on the right. */
export function SectionHeader({
  eyebrow,
  tone = "sage",
  title,
  description,
  action,
}: {
  eyebrow: ReactNode;
  tone?: EyebrowTone;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
      <div>
        <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
        <h2 className="font-serif text-2xl text-espresso mt-0.5">{title}</h2>
        {description && <p className="text-xs text-slateWarm mt-1 max-w-md">{description}</p>}
      </div>
      {action && <div className="shrink-0 self-start">{action}</div>}
    </div>
  );
}
