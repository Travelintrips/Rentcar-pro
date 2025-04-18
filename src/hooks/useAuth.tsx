import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

// Only use named export for consistent Fast Refresh compatibility
function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          setIsAuthenticated(true);
          const storedRole = localStorage.getItem("userRole");
          setUserRole(storedRole);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    let authListener: { subscription: { unsubscribe: () => void } | null } = {
      subscription: null,
    };

    try {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" && session) {
          setIsAuthenticated(true);
          const storedRole = localStorage.getItem("userRole");
          setUserRole(storedRole);
        } else if (event === "SIGNED_OUT") {
          setIsAuthenticated(false);
          setUserRole(null);
        }
      });

      authListener = data || { subscription: null };
    } catch (error) {
      console.error("Error setting up auth listener:", error);
    }

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  return { isAuthenticated, userRole, isLoading };
}

// Only use named export for consistent Fast Refresh compatibility
export { useAuth };
