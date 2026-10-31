"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { GitForkIcon } from "@phosphor-icons/react/dist/ssr/GitFork";
import { Button } from "@/components/ui/button";
import { useAction } from "@/hooks/use-action";
import { diagnoseBlocker } from "../actions";
import { problemKeyForTrigger } from "../domain/fishbone";

const FISHBONE_ANCHOR = "fishbone";

/** Opens the fishbone for a blocker, creating it the first time. */
export function DiagnoseButton({
  triggerId,
  problemKey,
  basePath,
  rangeQuery,
}: {
  triggerId: string;
  /** Existing fishbone for this blocker, if there is one. */
  problemKey: string | null;
  basePath: string;
  /** Carries the Pareto window along so switching fishbones doesn't reset it, e.g. "&range=month". */
  rangeQuery: string;
}) {
  const router = useRouter();
  const { run, isPending } = useAction();
  const hrefFor = (key: string) => `${basePath}?problem=${encodeURIComponent(key)}${rangeQuery}#${FISHBONE_ANCHOR}`;

  if (problemKey) {
    return (
      <Link
        href={hrefFor(problemKey)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-ivory hover:bg-stone border border-stoneDark text-espresso transition"
      >
        <GitForkIcon size={14} /> Open diagnosis
      </Link>
    );
  }

  return (
    <Button
      variant="dark"
      size="sm"
      disabled={isPending}
      onClick={() =>
        run(() => diagnoseBlocker({ triggerId }), {
          onSuccess: () => router.push(hrefFor(problemKeyForTrigger(triggerId))),
        })
      }
    >
      <GitForkIcon size={14} /> Diagnose
    </Button>
  );
}
