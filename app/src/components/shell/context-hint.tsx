"use client";

import { usePathname } from "next/navigation";
import { workspaceForPath } from "./workspaces";

/** One line under the header explaining what the current workspace is for. */
export function ContextHint() {
  const workspace = workspaceForPath(usePathname());
  if (!workspace) return null;
  return (
    <span className="hidden lg:inline text-xs text-slateWarm truncate">
      <span aria-hidden="true">• </span>
      {workspace.context}
    </span>
  );
}
