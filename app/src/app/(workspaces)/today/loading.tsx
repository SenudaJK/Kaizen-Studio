/** Shown instantly while the page's data loads, shaped like the real layout to avoid a jump. */
export default function TodayLoading() {
  const block = "animate-shimmer rounded-2xl bg-stone";
  return (
    <div aria-busy="true" aria-label="Loading your day" className="space-y-8">
      <div className="flex items-center gap-5 border-b border-stoneDark pb-6">
        <div className="animate-shimmer w-[72px] h-[72px] rounded-full bg-stone" />
        <div className="space-y-3 flex-1">
          <div className="animate-shimmer h-3 w-40 rounded bg-stone" />
          <div className="animate-shimmer h-10 w-72 max-w-full rounded bg-stone" />
        </div>
      </div>
      <div className={`${block} h-64`} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={`${block} h-80 lg:col-span-7`} />
        <div className={`${block} h-80 lg:col-span-5`} />
      </div>
    </div>
  );
}
