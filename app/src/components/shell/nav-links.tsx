"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { WORKSPACE_GROUPS, WORKSPACES, workspaceForPath, type Workspace } from "./workspaces";

/** The sidebar's grouped workspace list. Unreleased workspaces are shown but not clickable. */
export function SidebarNav() {
  const active = workspaceForPath(usePathname());
  const groups = Object.keys(WORKSPACE_GROUPS) as Array<Workspace["group"]>;

  return (
    <nav className="p-3 space-y-1" aria-label="Workspaces">
      {groups.map((group, index) => (
        <div key={group} className="space-y-1">
          <div className={cn("px-3 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-slateWarm", index === 0 ? "pt-1.5" : "pt-4")}>
            {WORKSPACE_GROUPS[group]}
          </div>
          {WORKSPACES.filter((w) => w.group === group).map((workspace) => (
            <SidebarItem key={workspace.key} workspace={workspace} isActive={active?.key === workspace.key} />
          ))}
        </div>
      ))}
    </nav>
  );
}

function SidebarItem({ workspace, isActive }: { workspace: Workspace; isActive: boolean }) {
  const Icon = workspace.icon;
  const body = (
    <>
      <Icon size={20} className={cn("mt-0.5 shrink-0", isActive ? "text-terracotta" : "text-slateWarm")} />
      <div className="min-w-0 flex-1">
        <div className="text-sm leading-tight">{workspace.label}</div>
        <div className="text-[11px] text-slateWarm font-normal mt-0.5">{workspace.tagline}</div>
      </div>
      {!workspace.available && (
        <span className="mt-0.5 shrink-0 font-mono text-[9px] uppercase tracking-wider text-slateWarm bg-stone px-1.5 py-0.5 rounded">
          Soon
        </span>
      )}
    </>
  );

  const base = "w-full text-left px-3.5 py-3 rounded-xl flex items-start gap-3 transition-all";

  if (!workspace.available) {
    return (
      <div aria-disabled="true" className={cn(base, "text-slateWarm opacity-70 cursor-not-allowed")}>
        {body}
      </div>
    );
  }

  return (
    <Link
      href={workspace.href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        base,
        isActive ? "bg-stone text-espresso font-semibold shadow-sm" : "text-slateWarm hover:bg-stone/60 hover:text-espresso",
      )}
    >
      {body}
    </Link>
  );
}

/** Bottom tab bar for small screens. */
export function MobileNav() {
  const active = workspaceForPath(usePathname());

  return (
    <nav
      aria-label="Workspaces"
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-ivory/95 backdrop-blur-md border-t border-stoneDark px-2 py-2 flex justify-around items-center z-40"
    >
      {WORKSPACES.map((workspace) => {
        const Icon = workspace.icon;
        const isActive = active?.key === workspace.key;
        const classes = cn(
          "flex flex-col items-center py-1 px-3 rounded-lg",
          isActive ? "text-terracotta font-semibold" : "text-slateWarm",
          !workspace.available && "opacity-50",
        );
        const content = (
          <>
            <Icon size={22} weight={isActive ? "fill" : "regular"} />
            <span className="text-[10px] mt-0.5">{workspace.mobileLabel}</span>
          </>
        );
        return workspace.available ? (
          <Link key={workspace.key} href={workspace.href} aria-current={isActive ? "page" : undefined} className={classes}>
            {content}
          </Link>
        ) : (
          <div key={workspace.key} aria-disabled="true" className={classes}>
            {content}
          </div>
        );
      })}
    </nav>
  );
}
