import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getValorantService } from "@/lib/services";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const service = await getValorantService();
  const user = await service.getCurrentUser();

  if (!user) {
    redirect("/sign-in?redirectTo=/dashboard");
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
