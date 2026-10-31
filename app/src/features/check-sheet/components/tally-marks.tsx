import { tallyGroups } from "../domain/tally";

/** Hand-drawn style tally: |||| bundles with a strike-through for every five. */
export function TallyMarks({ count }: { count: number }) {
  const { fullGroups, remainder } = tallyGroups(count);
  if (count === 0) return <span className="font-mono text-xs text-slateWarm/50">none yet</span>;

  return (
    <span aria-label={`${count} tallies`} className="inline-flex flex-wrap items-center">
      {Array.from({ length: fullGroups }, (_, i) => (
        <span key={i} aria-hidden="true" className="tally-group struck">
          ||||
        </span>
      ))}
      {remainder > 0 && (
        <span aria-hidden="true" className="tally-group">
          {"|".repeat(remainder)}
        </span>
      )}
    </span>
  );
}
