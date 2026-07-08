import { useState, useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { Building, User, Sparkles, Check, AlertCircle } from "lucide-react";

export default function Settings() {
  const { user, organization, authError } = useAuth();
  
  const [orgName, setOrgName] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [orgCategory, setOrgCategory] = useState("");
  
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Sync state with organization credentials
  useEffect(() => {
    if (organization) {
      setOrgName(organization.name || "");
      setOrgEmail(organization.contact_email || "");
      setOrgCategory(organization.business_category || "");
    }
  }, [organization]);

  async function handleUpdateProfile(e) {
    e.preventDefault();
    if (!organization) return;
    setUpdating(true);
    setSuccess("");
    setError("");

    try {
      const { error } = await supabase
        .from("organizations")
        .update({
          name: orgName,
          business_category: orgCategory,
          contact_email: orgEmail,
        })
        .eq("id", organization.id);

      if (error) throw error;
      setSuccess("Business profile updated successfully! Refresh your page to sync headers.");
    } catch (err) {
      console.error(err);
      setError("Failed to update profile: " + err.message);
    } finally {
      setUpdating(false);
    }
  }

  if (!organization) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6 rounded-xl border border-ink-100 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 space-y-4">
        <h2 className="font-display font-semibold text-lg text-ink-900 dark:text-paper-100">
          Setting up your workspace…
        </h2>
        <p className="text-sm text-ink-500 dark:text-ink-300">
          We are checking for your organization details or creating your workspace. This usually takes just a few seconds.
        </p>
        
        {authError ? (
          <div className="p-4 rounded-lg bg-coral-100 dark:bg-coral-500/15 border border-coral-500/20 text-xs sm:text-sm space-y-3">
            <p className="font-semibold text-coral-500">Database Diagnostic Alert:</p>
            <p className="text-ink-600 dark:text-ink-300 font-mono leading-relaxed bg-paper-100/50 dark:bg-ink-950/50 p-2.5 rounded">
              {authError}
            </p>
            <p className="text-ink-500 dark:text-ink-300">
              This error indicates that the Postgres database tables do not have standard access privileges granted to authenticated roles.
            </p>
            <div className="space-y-1.5">
              <p className="font-semibold text-ink-700 dark:text-ink-200">How to fix this:</p>
              <ol className="list-decimal list-inside space-y-1 text-ink-500 dark:text-ink-300">
                <li>Go to your **Supabase Dashboard**.</li>
                <li>In the left sidebar, click on **SQL Editor**.</li>
                <li>Click **New query**.</li>
                <li>Paste the following SQL commands and click **Run**:</li>
              </ol>
            </div>
            <pre className="p-3 rounded-lg bg-ink-950 text-paper-100 text-[10px] sm:text-xs overflow-x-auto font-mono">
{`GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON public.organizations TO anon, authenticated, service_role;
GRANT ALL ON public.leads TO anon, authenticated, service_role;
GRANT ALL ON public.lead_activity TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;`}
            </pre>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-ink-500 dark:text-ink-300">
            <div className="w-4 h-4 rounded-full border-2 border-t-gold-500 border-ink-100 dark:border-ink-800 animate-spin"></div>
            <span>Connecting to Supabase and checking active session...</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6 font-body selection:bg-gold-500 selection:text-white">
      
      {/* Business Profile Updates */}
      <form
        onSubmit={handleUpdateProfile}
        className="rounded-2xl border border-ink-100 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 p-6 space-y-5"
      >
        <div className="flex items-center gap-2.5 pb-3 border-b border-ink-100 dark:border-ink-800">
          <Building size={18} className="text-gold-500" />
          <h2 className="font-display font-bold text-base text-ink-900 dark:text-paper-100">
            Business Profile
          </h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-900 dark:text-paper-200 block">Workspace Name</label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink-100 dark:border-ink-800 bg-[#f8f7f4] dark:bg-ink-950/40 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-ink-900 dark:text-paper-100 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-900 dark:text-paper-200 block">Contact Email</label>
            <input
              type="email"
              value={orgEmail}
              onChange={(e) => setOrgEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink-100 dark:border-ink-800 bg-[#f8f7f4] dark:bg-ink-950/40 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-ink-900 dark:text-paper-100 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-900 dark:text-paper-200 block">Product Category</label>
            <input
              type="text"
              value={orgCategory}
              onChange={(e) => setOrgCategory(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink-100 dark:border-ink-800 bg-[#f8f7f4] dark:bg-ink-950/40 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-ink-900 dark:text-paper-100 transition-all"
            />
          </div>
        </div>

        {success && (
          <p className="text-xs text-moss-500 bg-moss-100 dark:bg-moss-500/10 rounded-lg px-3 py-2 border border-moss-500/10 font-semibold flex items-center gap-1.5">
            <Check size={12} />
            <span>{success}</span>
          </p>
        )}

        {error && (
          <p className="text-xs text-coral-500 bg-coral-100 dark:bg-coral-500/10 rounded-lg px-3 py-2 border border-coral-500/10 font-semibold flex items-center gap-1.5">
            <AlertCircle size={12} />
            <span>{error}</span>
          </p>
        )}

        <button
          type="submit"
          disabled={updating}
          className="px-5 py-2.5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-bold shadow transition-all cursor-pointer disabled:opacity-60 border-none"
        >
          {updating ? "Saving..." : "Save Workspace Changes"}
        </button>
      </form>

      {/* Account Settings */}
      <div className="rounded-2xl border border-ink-100 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-ink-100 dark:border-ink-800">
          <User size={18} className="text-gold-500" />
          <h2 className="font-display font-bold text-base text-ink-900 dark:text-paper-100">
            Account Profile
          </h2>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-ink-500">Sign-in Email</p>
          <p className="text-sm font-mono text-ink-900 dark:text-paper-100">
            {user?.email || "loading..."}
          </p>
        </div>
      </div>

      {/* Secure AI Config Setup */}
      <div className="rounded-2xl border border-ink-100 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-ink-100 dark:border-ink-800">
          <Sparkles size={18} className="text-gold-500" />
          <h2 className="font-display font-bold text-base text-ink-900 dark:text-paper-100">
            Secure AI Key Configuration
          </h2>
        </div>
        <p className="text-xs text-ink-500 dark:text-ink-300 leading-relaxed">
          BrewFlow AI follows production-ready security standards. API Keys are kept hidden server-side inside Deno Edge environment variables. The client browser only calls abstract service layers.
        </p>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-ink-700 dark:text-ink-200">How to configure your API key:</p>
          <ol className="list-decimal list-inside space-y-1.5 text-xs text-ink-500 dark:text-ink-300">
            <li>Run this command in your project terminal using Supabase CLI:</li>
            <pre className="p-3.5 rounded-lg bg-ink-950 text-paper-100 text-[10px] sm:text-xs overflow-x-auto font-mono mt-1 border border-slate-800">
              supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here
            </pre>
            <li>Deploy the Edge Function to the Supabase cloud:</li>
            <pre className="p-3.5 rounded-lg bg-ink-950 text-paper-100 text-[10px] sm:text-xs overflow-x-auto font-mono mt-1 border border-slate-800">
              supabase functions deploy generate-sales-copy
            </pre>
          </ol>
        </div>
      </div>
      
    </div>
  );
}
