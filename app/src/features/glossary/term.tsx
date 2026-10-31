"use client";

import { useId, useState, type ReactNode } from "react";
import { GLOSSARY, type GlossaryKey } from "./terms";

/**
 * Wraps a piece of Lean Six Sigma jargon with a dotted underline and a plain-English
 * hint on hover, keyboard focus or tap (touch screens have no hover).
 *
 *   <Term k="sigma">Sigma level</Term>
 */
export function Term({
  k,
  children,
  align = "left",
}: {
  k: GlossaryKey;
  children?: ReactNode;
  /** Which edge the hint lines up with. Use "right" near the right side of the screen. */
  align?: "left" | "right";
}) {
  const tooltipId = useId();
  const entry = GLOSSARY[k];
  const [open, setOpen] = useState(false);

  return (
    <span
      tabIndex={0}
      role="button"
      aria-expanded={open}
      onClick={() => setOpen((value) => !value)}
      onBlur={() => setOpen(false)}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setOpen((value) => !value);
        }
      }}
      aria-describedby={tooltipId}
      className="group/term relative inline-block cursor-help border-b border-dotted border-slateWarm/60 focus:outline-none focus-visible:border-terracotta"
    >
      {children ?? entry.term}
      <span
        id={tooltipId}
        role="tooltip"
        className={`pointer-events-none ${open ? "block" : "hidden"} group-hover/term:block group-focus-visible/term:block animate-fade-in absolute ${align === "right" ? "right-0" : "left-0"} top-full z-40 mt-1.5 w-56 rounded-lg bg-espresso px-3 py-2 text-left font-sans text-[11px] font-normal normal-case leading-snug tracking-normal text-ivory shadow-floating`}
      >
        <span className="block font-semibold">{entry.term}</span>
        {entry.plain}
      </span>
    </span>
  );
}
