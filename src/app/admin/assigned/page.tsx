import { FocusedQueue } from "@/features/admin/components/focused-queue";
export const metadata = { title: "My assigned tickets" };
export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <FocusedQueue mode="assigned" searchParams={searchParams} />;
}
