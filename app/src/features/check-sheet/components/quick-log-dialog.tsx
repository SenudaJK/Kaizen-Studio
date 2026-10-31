"use client";

import { useEffect, useState } from "react";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useAction } from "@/hooks/use-action";
import { logFriction } from "../actions";
import { AddTriggerForm } from "./add-trigger-form";

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

/**
 * The header's always-available "I just slipped" button. Press L anywhere to open it:
 * logging a blocker should take two seconds, or people won't do it.
 */
export function QuickLogDialog({ triggers }: { triggers: Array<{ id: string; name: string }> }) {
  const [open, setOpen] = useState(false);
  const { run, isPending } = useAction();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "l" || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      event.preventDefault();
      setOpen(true);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)} aria-keyshortcuts="L">
        <PlusIcon size={14} weight="bold" />
        <span className="hidden sm:inline">Log a blocker</span>
        <span className="sm:hidden">Log</span>
        <kbd className="hidden lg:inline font-mono text-[10px] bg-ivory/20 px-1.5 py-0.5 rounded">L</kbd>
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} eyebrow="Non-judgmental data capture" title="Log a blocker">
        <p className="text-xs text-slateWarm mb-4">
          Every slip is just a clue about what to fix in your routine. What got in the way?
        </p>

        {triggers.length > 0 && (
          <ul className="space-y-2 mb-4">
            {triggers.map((trigger) => (
              <li key={trigger.id}>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    run(() => logFriction({ triggerId: trigger.id }), {
                      successMessage: `Logged “${trigger.name}”. Thanks for the honest data.`,
                      onSuccess: () => setOpen(false),
                    })
                  }
                  className="w-full p-3 rounded-xl bg-paper hover:bg-terracottaLight border border-stoneDark hover:border-terracotta/40 flex items-center justify-between text-left transition disabled:opacity-60"
                >
                  <span className="text-xs font-semibold text-espresso">{trigger.name}</span>
                  <span className="font-mono text-xs text-terracotta font-semibold">+1</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <AddTriggerForm logNow showSuggestions={triggers.length === 0} onAdded={() => setOpen(false)} />
      </Modal>
    </>
  );
}
