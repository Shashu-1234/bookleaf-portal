import { OverviewDashboard } from "@/features/admin/components/overview-dashboard";
import { getAdminPortalData, getCurrentStaffProfile } from "@/lib/database/admin-repository";

export default async function AdminOverviewPage() {
  const [{ tickets }, staff] = await Promise.all([getAdminPortalData(), getCurrentStaffProfile()]);
  return <OverviewDashboard tickets={tickets} adminName={staff?.display_name ?? "Support"} />;
}
