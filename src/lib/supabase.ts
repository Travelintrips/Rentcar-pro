import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// Use hardcoded values since environment variables are causing issues
const supabaseUrl = "https://wvqlwgmlijtcutvseyey.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2cWx3Z21saWp0Y3V0dnNleWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NzI2OTUsImV4cCI6MjA1OTU0ODY5NX0.Qm4CaTrRuTAUuYLqHV1d6NAzmTFkfyOxOIJYYkuB0O0";

if (!supabaseUrl) {
  console.error("Missing Supabase URL");
  throw new Error("Supabase URL is required.");
}

if (!supabaseAnonKey) {
  console.error("Missing Supabase Anon Key");
  throw new Error("Supabase Anon Key is required.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
