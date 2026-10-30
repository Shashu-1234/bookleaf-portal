import { OverviewDashboard } from "@/features/admin/components/overview-dashboard";
import { getAdminPortalData } from "@/lib/database/admin-repository";
import { requireRole } from "@/lib/database/auth";

export default async function AdminOverviewPage() {
  const [{ tickets }, { supabase, claims }] = await Promise.all([getAdminPortalData(), requireRole(["admin", "ops"])]);
  const { data: staff } = await supabase.from("staff_profiles").select("display_name").eq("user_id", claims.sub).single();
  return <OverviewDashboard tickets={tickets} adminName={staff?.display_name ?? "Support"} />;
}
