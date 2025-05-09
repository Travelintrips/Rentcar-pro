import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";


const hasValidCredentials =
  supabaseUrl &&
  supabaseAnonKey &&
  isValidUrl(supabaseUrl) &&
  supabaseUrl !== "https://placeholder-project.supabase.co" &&
  supabaseAnonKey !== "placeholder-key";

let supabase: any;

if (hasValidCredentials) {
  console.log("Using Supabase URL:", supabaseUrl);
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
} else {
  console.warn(
    "Using mock Supabase client. Database operations will not work.",
  );

  supabase = {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () =>
        Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
        error: null,
      }),
      signOut: () => Promise.resolve({ error: null }),
      signUp: (params) => {
        const mockUser = {
          id: "mock-user-id-" + Date.now(),
          email: params.email,
          user_metadata: params.options?.data || {},
        };
        return Promise.resolve({
          data: { user: mockUser, session: { user: mockUser } },
          error: null,
        });
      },
      signInWithPassword: (params) => {
        const mockUser = {
          id: "mock-user-id-" + Date.now(),
          email: params.email,
          user_metadata: { role: "User" },
        };
        return Promise.resolve({
          data: { user: mockUser, session: { user: mockUser } },
          error: null,
        });
      },
    },
    from: () => ({
      select: () => ({
        data: [],
        error: null,
        order() {
          return this;
        },
        eq() {
          return this;
        },
        neq() {
          return this;
        },
        gt() {
          return this;
        },
        lt() {
          return this;
        },
        gte() {
          return this;
        },
        lte() {
          return this;
        },
        like() {
          return this;
        },
        ilike() {
          return this;
        },
        is() {
          return this;
        },
        in() {
          return this;
        },
        contains() {
          return this;
        },
        containedBy() {
          return this;
        },
        rangeLt() {
          return this;
        },
        rangeGt() {
          return this;
        },
        rangeGte() {
          return this;
        },
        rangeLte() {
          return this;
        },
        rangeAdjacent() {
          return this;
        },
        overlaps() {
          return this;
        },
        textSearch() {
          return this;
        },
        filter() {
          return this;
        },
        match() {
          return this;
        },
        limit() {
          return this;
        },
        single() {
          return { data: null, error: null };
        },
        maybeSingle() {
          return { data: null, error: null };
        },
      }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
      upsert: () => ({ data: null, error: null }),
    }),
    storage: {
      from: () => ({
        upload: () =>
          Promise.resolve({ data: { path: "mock-path" }, error: null }),
        getPublicUrl: () => ({
          data: { publicUrl: "https://example.com/mock-image.jpg" },
          error: null,
        }),
      }),
    },
    functions: {
      invoke: (functionName, options) => {
        console.log(`Mock function invoke: ${functionName}`, options);
        return Promise.resolve({ data: { success: true }, error: null });
      },
    },
  };
}

export { supabase };
