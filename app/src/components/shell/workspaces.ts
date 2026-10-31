import type { Icon } from "@phosphor-icons/react";
import { CheckSquareOffsetIcon } from "@phosphor-icons/react/dist/ssr/CheckSquareOffset";
import { GitForkIcon } from "@phosphor-icons/react/dist/ssr/GitFork";
import { ChartLineUpIcon } from "@phosphor-icons/react/dist/ssr/ChartLineUp";
import { TreeStructureIcon } from "@phosphor-icons/react/dist/ssr/TreeStructure";

/**
 * The four workspaces. Navigation (sidebar, mobile bar, header hint) is generated from this
 * one list, so shipping a new phase means flipping `available` to true, nothing else.
 */
export interface Workspace {
  key: "today" | "root-cause" | "stability" | "life-design";
  href: string;
  label: string;
  /** Short label for the cramped mobile tab bar. */
  mobileLabel: string;
  tagline: string;
  /** One-line orientation shown in the top bar. */
  context: string;
  group: "basic7" | "new7";
  icon: Icon;
  available: boolean;
}

export const WORKSPACES: readonly Workspace[] = [
  {
    key: "today",
    href: "/today",
    label: "Today",
    mobileLabel: "Today",
    tagline: "Check sheet, routines & blockers",
    context: "Standardize your day, then count what gets in the way",
    group: "basic7",
    icon: CheckSquareOffsetIcon,
    available: true,
  },
  {
    key: "root-cause",
    href: "/root-cause",
    label: "Find the cause",
    mobileLabel: "Causes",
    tagline: "Root-Cause Studio · what's in the way",
    context: "Fix the few causes behind most of your slips",
    group: "basic7",
    icon: GitForkIcon,
    available: true,
  },
  {
    key: "stability",
    href: "/stability",
    label: "Spot trends",
    mobileLabel: "Trends",
    tagline: "Stability & Correlations",
    context: "Tell normal ups and downs from real change",
    group: "basic7",
    icon: ChartLineUpIcon,
    available: true,
  },
  {
    key: "life-design",
    href: "/life-design",
    label: "Plan ahead",
    mobileLabel: "Plan",
    tagline: "Life Design & Pre-Mortem",
    context: "Prepare backup plans before obstacles appear",
    group: "new7",
    icon: TreeStructureIcon,
    available: true,
  },
];

export const WORKSPACE_GROUPS: Record<Workspace["group"], string> = {
  basic7: "Track & diagnose",
  new7: "Prepare before you start",
};

export function workspaceForPath(pathname: string): Workspace | undefined {
  return WORKSPACES.find((w) => pathname === w.href || pathname.startsWith(`${w.href}/`));
}
