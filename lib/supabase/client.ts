import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_SUPABASE_NEXT_PUBLIC_SUPABASE_URL;

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Faltan variables de entorno para Supabase");
}

export function createClient() {
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  );
}
