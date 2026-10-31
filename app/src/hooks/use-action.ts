"use client";

import { useCallback, useTransition } from "react";
import type { ActionResult } from "@/lib/action-result";
import { useToast } from "@/components/ui/toast";

/**
 * Runs a server action inside a React transition and reports failures as a toast.
 *
 * Anything called synchronously at the start of `task` (like an optimistic update) happens
 * inside the transition, so React reverts it automatically if the action fails.
 *
 *   run(async () => { applyOptimistic(change); return saveChange(change); }, { onSuccess: close });
 */
export function useAction() {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  const run = useCallback(
    (task: () => Promise<ActionResult>, options: { onSuccess?: () => void; successMessage?: string } = {}) => {
      startTransition(async () => {
        const result = await task();
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        if (options.successMessage) toast.success(options.successMessage);
        options.onSuccess?.();
      });
    },
    [toast],
  );

  return { run, isPending };
}
