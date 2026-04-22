import { DashboardShell } from "@/components/layout/dashboard-shell";
import { valorantService } from "@/lib/services";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await valorantService.getCurrentUser();

  if (!user) {
    return <div className="p-6 text-sm text-muted-foreground">No user session found.</div>;
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
