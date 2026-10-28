export function AuthCard({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6 rounded-2xl bg-ivory editorial-border shadow-floating p-8">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-terracotta inline-block" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-slateWarm font-medium">
            DMAIC Life OS v2.4
          </span>
        </div>

        <div>
          <div className="font-mono text-[11px] uppercase tracking-widest text-terracotta mb-1">{eyebrow}</div>
          <h1 className="font-serif text-3xl text-espresso tracking-tight">{title}</h1>
          <p className="text-sm text-slateWarm mt-1">{subtitle}</p>
        </div>

        {children}

        <p className="text-center text-xs text-slateWarm">{footer}</p>
      </div>
    </div>
  );
}

export function AuthInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full bg-stone/70 border border-stoneDark rounded-xl px-3.5 py-2.5 text-sm text-espresso placeholder:text-slateWarm focus:outline-none focus:border-terracotta transition"
    />
  );
}

export function AuthPrimaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="w-full bg-terracotta text-ivory hover:bg-terracotta/90 disabled:opacity-50 px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition"
    >
      {children}
    </button>
  );
}

export function AuthSecondaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="w-full bg-ivory hover:bg-stone border border-stoneDark text-espresso px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 shadow-sm transition"
    >
      {children}
    </button>
  );
}

export function AuthDivider() {
  return (
    <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-wider text-slateWarm">
      <div className="h-px flex-1 bg-stoneDark" />
      or
      <div className="h-px flex-1 bg-stoneDark" />
    </div>
  );
}
