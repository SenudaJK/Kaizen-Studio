import { Suspense } from "react";
import { auth, signOut } from "@/auth";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-4 rounded-2xl bg-ivory editorial-border shadow-floating p-8 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-terracotta inline-block" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-slateWarm font-medium">
            DMAIC Life OS v2.4
          </span>
        </div>
        <h1 className="font-serif text-4xl text-espresso tracking-tight">Kaizen Studio</h1>
        <Suspense fallback={<p className="text-sm text-slateWarm">Loading session...</p>}>
          <AccountSummary />
        </Suspense>
        <p className="text-xs text-slateWarm">
          Workspaces (Check Sheet, Root-Cause Studio, SPC, PDPC) are ported next.
        </p>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="bg-ivory hover:bg-stone border border-stoneDark text-espresso px-4 py-2 rounded-xl text-xs font-medium transition"
          >
            Log out
          </button>
        </form>
      </div>
    </main>
  );
}

async function AccountSummary() {
  const session = await auth();
  return (
    <p className="text-sm text-slateWarm">
      Logged in as <span className="font-medium text-espresso">{session?.user?.email}</span>
    </p>
  );
}
