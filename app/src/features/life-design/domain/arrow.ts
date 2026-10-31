import type { ArrowPathType } from "../types";

interface NodeLike {
  durationDays: number;
  path: ArrowPathType;
  done: boolean;
}

export interface NetworkSummary {
  nodeCount: number;
  doneCount: number;
  /** Total days on the critical path: the shortest the goal can take, since a delay here delays the finish. */
  criticalDays: number;
  /** Critical-path days not yet done. */
  criticalDaysLeft: number;
  /** Days of parallel work that can slip without moving the finish. */
  slackDays: number;
  /** Whole percent of critical-path days completed. */
  percentDone: number;
}

export function summarizeNetwork(nodes: readonly NodeLike[]): NetworkSummary {
  const critical = nodes.filter((n) => n.path === "CRITICAL_PATH");
  const sum = (list: readonly NodeLike[]) => list.reduce((total, n) => total + n.durationDays, 0);

  const criticalDays = sum(critical);
  const criticalDaysLeft = sum(critical.filter((n) => !n.done));
  return {
    nodeCount: nodes.length,
    doneCount: nodes.filter((n) => n.done).length,
    criticalDays,
    criticalDaysLeft,
    slackDays: sum(nodes.filter((n) => n.path === "PARALLEL_SLACK")),
    percentDone: criticalDays === 0 ? 0 : Math.round(((criticalDays - criticalDaysLeft) / criticalDays) * 100),
  };
}

/** The milestone to work on now: the first unfinished critical-path node, in network order. */
export function nextMilestone<T extends NodeLike>(nodes: readonly T[]): T | null {
  return nodes.find((n) => n.path === "CRITICAL_PATH" && !n.done) ?? null;
}

export function formatDays(days: number): string {
  return `${days} ${days === 1 ? "day" : "days"}`;
}

/** Code for the next node: steps of 10 leave room to insert milestones between existing ones. */
export function nextNodeCode(lastOrder: number): { order: number; code: string } {
  const order = lastOrder + 1;
  return { order, code: String(order * 10) };
}
