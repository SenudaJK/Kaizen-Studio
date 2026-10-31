"use client";

import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/field";
import { useAction } from "@/hooks/use-action";
import { addFrictionTrigger } from "../actions";
import { SUGGESTED_TRIGGERS } from "../starter-templates";

/**
 * Adds a new blocker. With `logNow`, it also records one occurrence immediately
 * (the quick-log flow); without it, it only starts tracking.
 */
export function AddTriggerForm({
  logNow = false,
  showSuggestions = false,
  onAdded,
}: {
  logNow?: boolean;
  showSuggestions?: boolean;
  onAdded?: () => void;
}) {
  const { run, isPending } = useAction();

  const add = (name: string, onDone?: () => void) =>
    run(() => addFrictionTrigger({ name, logNow }), {
      successMessage: logNow ? `Logged “${name}”. Thanks for the honest data.` : `Now tracking “${name}”.`,
      onSuccess: () => {
        onDone?.();
        onAdded?.();
      },
    });

  return (
    <div className="space-y-3">
      {showSuggestions && (
        <div>
          <p className="text-[11px] text-slateWarm mb-2">Common ones, tap to add:</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_TRIGGERS.map((name) => (
              <button
                key={name}
                type="button"
                disabled={isPending}
                onClick={() => add(name)}
                className="px-2.5 py-1.5 rounded-lg bg-ivory border border-stoneDark text-xs text-espresso hover:bg-terracottaLight hover:border-terracotta/40 transition disabled:opacity-50"
              >
                + {name}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          add(String(new FormData(form).get("name") ?? ""), () => form.reset());
        }}
      >
        <label className="flex-1">
          <span className="sr-only">New blocker</span>
          <TextInput name="name" required maxLength={80} placeholder="Something else, e.g. Skipped lunch" className="py-2! text-xs" />
        </label>
        <Button type="submit" variant="dark" size="sm" disabled={isPending} className="shrink-0">
          <PlusIcon size={14} weight="bold" />
          {logNow ? "Add & log" : "Add"}
        </Button>
      </form>
    </div>
  );
}
