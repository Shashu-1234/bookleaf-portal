import { OverviewDashboard } from "@/features/admin/components/overview-dashboard";
import { getAdminOverviewData, getCurrentStaffProfile } from "@/lib/database/admin-repository";

export default async function AdminOverviewPage() {
  const [tickets, staff] = await Promise.all([getAdminOverviewData(), getCurrentStaffProfile()]);
  return <OverviewDashboard tickets={tickets} adminName={staff?.display_name ?? "Support"} />;
}
