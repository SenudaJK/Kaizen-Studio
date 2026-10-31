import type { ReactNode } from "react";

/** What a brand-new user sees before they've added anything: says what this is, offers the next step. */
export function EmptyState({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center py-8 px-4 rounded-xl border border-dashed border-stoneDark bg-paper/60">
      <div className="w-11 h-11 rounded-xl bg-stone text-slateWarm flex items-center justify-center mb-3">{icon}</div>
      <h3 className="font-serif text-xl text-espresso">{title}</h3>
      <p className="text-xs text-slateWarm mt-1 max-w-xs">{description}</p>
      {children && <div className="mt-4 flex flex-wrap items-center justify-center gap-2">{children}</div>}
    </div>
  );
}
