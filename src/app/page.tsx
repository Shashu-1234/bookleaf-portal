import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  await connection();
  const client = await createClient();
  const { data } = await client.auth.getClaims();
  const role = (data?.claims?.app_metadata as { role?: string } | undefined)?.role;
  if (role === "admin" || role === "ops") redirect("/admin/tickets");
  if (role === "author") redirect("/author");
  redirect("/login");
}
