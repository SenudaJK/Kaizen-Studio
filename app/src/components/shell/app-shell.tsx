import type { ReactNode } from "react";
import { TimezoneSync } from "@/components/timezone-sync";
import { ToastProvider } from "@/components/ui/toast";
import { MobileNav } from "./nav-links";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

/**
 * The authenticated frame around every workspace: sidebar (desktop), top bar, bottom tabs
 * (mobile). It is deliberately synchronous: everything that needs the session streams in
 * behind its own <Suspense> boundary, so the frame paints instantly.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <TimezoneSync />
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 min-w-0 pb-24 lg:pb-12">
          <TopBar />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-6 lg:pt-8">{children}</main>
        </div>
      </div>
      <MobileNav />
    </ToastProvider>
  );
}
