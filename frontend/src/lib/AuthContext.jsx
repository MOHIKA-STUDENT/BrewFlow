import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

// WHY THIS FILE EXISTS:
// Every page in the app needs to know "is someone logged in, and who?"
// Instead of every page asking Supabase directly, we ask once here and
// share the answer everywhere via React Context. This is the standard
// pattern for auth in a React app — one source of truth, read anywhere.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  // WHY THIS FUNCTION EXISTS:
  // Signup only creates an auth user (email + password) — Supabase's
  // auth system has no concept of "organization." So the first time we
  // see a logged-in session, we check: does this user already have an
  // organization row? If not (their very first login after confirming
  // email), create one using the organization_name / business_category
  // they typed during signup, which we stashed in user_metadata.
  async function ensureOrganization(user) {
    if (!user) return null;

    const { data: existing, error: fetchError } = await supabase
      .from("organizations")
      .select("*")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (fetchError) {
      console.error("Failed to check for existing organization:", fetchError);
      setAuthError(`Database error checking organization: ${fetchError.message} (Postgres Code: ${fetchError.code}). ${fetchError.hint || "Please run SQL grants in Supabase SQL editor."}`);
      return null;
    }
    if (existing) {
      setAuthError(""); // Clear on success
      return existing;
    }

    const { data: created, error: insertError } = await supabase
      .from("organizations")
      .insert({
        owner_id: user.id,
        name: user.user_metadata?.organization_name || "My Organization",
        business_category: user.user_metadata?.business_category || "",
        contact_email: user.email,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to create organization:", insertError);
      setAuthError(`Database error creating organization: ${insertError.message} (Postgres Code: ${insertError.code}). ${insertError.hint || "Please run SQL grants in Supabase SQL editor."}`);
      return null;
    }
    setAuthError(""); // Clear on success
    return created;
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const org = await ensureOrganization(session.user);
        setOrganization(org);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const org = await ensureOrganization(session.user);
        setOrganization(org);
      } else {
        setOrganization(null);
        setAuthError("");
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signUp({ email, password, organizationName, businessCategory }) {
    setAuthError("");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      // This metadata rides along with the signup and is what we'll use
      // in Part 2 to auto-create the user's Organization row.
      options: {
        data: { organization_name: organizationName, business_category: businessCategory },
      },
    });
    return { data, error };
  }

  async function signIn({ email, password }) {
    setAuthError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  }

  async function signOut() {
    setAuthError("");
    await supabase.auth.signOut();
  }

  const value = {
    session,
    user: session?.user ?? null,
    organization,
    loading,
    authError,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
