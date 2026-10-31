"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { XIcon } from "@phosphor-icons/react/dist/ssr/X";
import { Eyebrow } from "./card";

/**
 * A modal built on the native <dialog> element, so focus trapping, Escape-to-close and
 * the inert background come from the browser instead of hand-rolled code.
 */
export function Modal({
  open,
  onClose,
  eyebrow,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  eyebrow?: string;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        // A click on the backdrop lands on the <dialog> element itself.
        if (event.target === ref.current) onClose();
      }}
      className={`m-auto w-[calc(100%-2rem)] ${wide ? "max-w-2xl" : "max-w-md"} max-h-[85vh] overflow-y-auto rounded-2xl bg-ivory p-0 text-espresso editorial-border shadow-floating backdrop:bg-espresso/50 backdrop:backdrop-blur-xs`}
    >
      {open && (
        <div className="p-6 animate-fade-in">
          <div className="flex items-start justify-between gap-4 border-b border-stoneDark pb-3 mb-4">
            <div>
              {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
              <h2 className="font-serif text-2xl text-espresso">{title}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="text-slateWarm hover:text-espresso p-1 -mr-1 rounded-lg transition"
            >
              <XIcon size={20} />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
