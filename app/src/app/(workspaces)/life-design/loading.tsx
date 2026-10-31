/** Shown instantly while the page's data loads, shaped like the real layout to avoid a jump. */
export default function LifeDesignLoading() {
  const block = "animate-shimmer rounded-2xl bg-stone";
  return (
    <div aria-busy="true" aria-label="Loading Life Design" className="space-y-8">
      <div className="space-y-3 border-b border-stoneDark pb-6">
        <div className="animate-shimmer h-3 w-48 rounded bg-stone" />
        <div className="animate-shimmer h-10 w-80 max-w-full rounded bg-stone" />
      </div>
      <div className={`${block} h-[34rem]`} />
      <div className={`${block} h-80`} />
    </div>
  );
}
