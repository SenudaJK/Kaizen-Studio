"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { UserCircleIcon } from "@phosphor-icons/react/dist/ssr/UserCircle";
import { cn } from "@/lib/cn";

/**
 * Phone-sized home for what the desktop sidebar shows: this week's score, belt and log out.
 * The content is server-rendered and passed in as children; this only handles open/close.
 */
export function AccountPopover({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div ref={root} className="relative lg:hidden">
      <button
        type="button"
        aria-label="Account and progress"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "p-1.5 rounded-lg border border-stoneDark transition",
          open ? "bg-stone text-espresso" : "bg-ivory text-slateWarm hover:text-espresso",
        )}
      >
        <UserCircleIcon size={20} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl bg-ivory editorial-border shadow-floating animate-fade-in z-50 pt-1">
          {children}
        </div>
      )}
    </div>
  );
}
