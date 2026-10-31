/** Shown instantly while the page's data loads, shaped like the real layout to avoid a jump. */
export default function StabilityLoading() {
  const block = "animate-shimmer rounded-2xl bg-stone";
  return (
    <div aria-busy="true" aria-label="Loading Stability & Correlations" className="space-y-8">
      <div className="space-y-3 border-b border-stoneDark pb-6">
        <div className="animate-shimmer h-3 w-44 rounded bg-stone" />
        <div className="animate-shimmer h-10 w-80 max-w-full rounded bg-stone" />
      </div>
      <div className={`${block} h-[40rem]`} />
      <div className={`${block} h-[28rem]`} />
    </div>
  );
}
