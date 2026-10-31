/** Shown instantly while the page's data loads, shaped like the real layout to avoid a jump. */
export default function SettingsLoading() {
  const block = "animate-shimmer rounded-2xl bg-stone";
  return (
    <div aria-busy="true" aria-label="Loading settings" className="space-y-8 max-w-3xl">
      <div className="space-y-3 border-b border-stoneDark pb-6">
        <div className="animate-shimmer h-3 w-24 rounded bg-stone" />
        <div className="animate-shimmer h-10 w-72 max-w-full rounded bg-stone" />
      </div>
      <div className={`${block} h-64`} />
      <div className={`${block} h-60`} />
      <div className={`${block} h-32`} />
    </div>
  );
}
