import { SignOutIcon } from "@phosphor-icons/react/dist/ssr/SignOut";
import { signOut } from "@/auth";
import { getCurrentUser } from "@/lib/session";

export async function UserMenu() {
  const user = await getCurrentUser();

  return (
    <div className="px-5 pb-4 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-xs font-semibold text-espresso truncate">{user.name ?? user.email}</div>
        {user.name && <div className="text-[11px] text-slateWarm truncate">{user.email}</div>}
      </div>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <button
          type="submit"
          title="Log out"
          aria-label="Log out"
          className="p-2 rounded-lg text-slateWarm hover:text-espresso hover:bg-stone transition"
        >
          <SignOutIcon size={18} />
        </button>
      </form>
    </div>
  );
}

export function UserMenuSkeleton() {
  return <div aria-hidden="true" className="animate-shimmer mx-5 mb-4 h-9 rounded-lg bg-stone" />;
}
