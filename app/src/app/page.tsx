import { Suspense } from "react";
import { auth, signOut } from "@/auth";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-neutral-900">Kaizen Studio</h1>
        <Suspense fallback={<p className="text-sm text-neutral-500">Loading session...</p>}>
          <AccountSummary />
        </Suspense>
        <p className="text-xs text-neutral-400">
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
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
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
    <p className="text-sm text-neutral-500">
      Logged in as <span className="font-medium text-neutral-900">{session?.user?.email}</span>
    </p>
  );
}
