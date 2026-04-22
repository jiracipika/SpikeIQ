import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import type { AppUser } from "@/types/domain";

interface DashboardShellProps {
  user: AppUser;
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  return (
    <div className="relative min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <DashboardSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardTopbar user={user} />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="animate-fade-up">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
