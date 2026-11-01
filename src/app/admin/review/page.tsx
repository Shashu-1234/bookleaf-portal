import { FocusedQueue } from "@/features/admin/components/focused-queue";
export const metadata = { title: "Needs review" };
export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <FocusedQueue mode="review" searchParams={searchParams} />;
}
