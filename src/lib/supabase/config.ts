const URL_KEY = "NEXT_PUBLIC_SUPABASE_URL";
const PUBLISHABLE_KEY = "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";
const SECRET_KEY = "SUPABASE_SECRET_KEY";

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(`Missing ${!url ? URL_KEY : PUBLISHABLE_KEY}. Copy .env.example to .env.local and configure the Supabase project.`);
  }

  return { url, publishableKey };
}

export function getSupabaseAdminConfig() {
  const { url } = getSupabaseConfig();
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(`Missing ${SECRET_KEY}. Configure it only in the server runtime.`);
  }

  return { url, secretKey };
}
