import type { ReactNode } from "react";
import { DesktopSidebar } from "@/components/desktop-sidebar";
import { BottomNav } from "@/components/bottom-nav";

export function AppShell({ active, children }: { active: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar active={active} />
      <main className="flex min-h-screen flex-col md:ml-[260px]">
        <div className="flex-1 overflow-y-auto">{children}</div>
        <BottomNav active={active} />
      </main>
    </div>
  );
}