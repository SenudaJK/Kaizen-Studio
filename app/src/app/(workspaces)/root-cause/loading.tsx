/** Shown instantly while the page's data loads, shaped like the real layout to avoid a jump. */
export default function RootCauseLoading() {
  const block = "animate-shimmer rounded-2xl bg-stone";
  return (
    <div aria-busy="true" aria-label="Loading the Root-Cause Studio" className="space-y-8">
      <div className="space-y-3 border-b border-stoneDark pb-6">
        <div className="animate-shimmer h-3 w-40 rounded bg-stone" />
        <div className="animate-shimmer h-10 w-72 max-w-full rounded bg-stone" />
      </div>
      <div className={`${block} h-[28rem]`} />
      <div className={`${block} h-[36rem]`} />
    </div>
  );
}
