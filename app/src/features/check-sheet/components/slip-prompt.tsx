"use client";

import { Modal } from "@/components/ui/modal";
import { useAction } from "@/hooks/use-action";
import { logFriction } from "../actions";
import { AddTriggerForm } from "./add-trigger-form";

/**
 * Appears right after a habit is marked as slipped. The moment of the slip is the best
 * moment to capture *why*, so this turns a miss into a data point in one tap.
 */
export function SlipPrompt({
  habitName,
  triggers,
  onClose,
}: {
  /** null = closed */
  habitName: string | null;
  triggers: Array<{ id: string; name: string }>;
  onClose: () => void;
}) {
  const { run, isPending } = useAction();

  return (
    <Modal open={habitName !== null} onClose={onClose} eyebrow="No blame, just data" title="What got in the way?">
      <p className="text-xs text-slateWarm mb-4">
        “{habitName}” didn&apos;t happen. That&apos;s information about your routine, not about your willpower. Tap the
        closest cause and we&apos;ll count it.
      </p>

      {triggers.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {triggers.map((trigger) => (
            <button
              key={trigger.id}
              type="button"
              disabled={isPending}
              onClick={() =>
                run(() => logFriction({ triggerId: trigger.id }), {
                  successMessage: `Logged “${trigger.name}”.`,
                  onSuccess: onClose,
                })
              }
              className="px-3 py-2 rounded-xl bg-paper border border-stoneDark text-xs font-medium text-espresso hover:bg-terracottaLight hover:border-terracotta/40 transition disabled:opacity-60"
            >
              {trigger.name}
            </button>
          ))}
        </div>
      )}

      <AddTriggerForm logNow showSuggestions={triggers.length === 0} onAdded={onClose} />

      <div className="flex justify-end mt-4">
        <button type="button" onClick={onClose} className="text-xs text-slateWarm hover:text-espresso px-3 py-1.5">
          Skip for now
        </button>
      </div>
    </Modal>
  );
}
