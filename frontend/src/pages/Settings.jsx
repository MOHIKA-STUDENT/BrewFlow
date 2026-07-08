import { useState, useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { Building, User, Check, AlertCircle, AlertTriangle } from "lucide-react";

export default function Settings() {
  const { user, organization, authError } = useAuth();
  
  const [orgName, setOrgName] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [orgCategory, setOrgCategory] = useState("");
  
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Deletion modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmOrgName, setConfirmOrgName] = useState("");
  const [deleting, setDeleting] = useState(false);

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

  async function handleDeleteWorkspace() {
    if (!organization) return;
    if (confirmOrgName !== organization.name) {
      setError("Verification name does not match the workspace name.");
      return;
    }
    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      // 1. Delete generations
      await supabase.from("ai_generations").delete().eq("organization_id", organization.id);
      // 2. Delete activity timeline logs
      await supabase.from("lead_activity").delete().eq("organization_id", organization.id);
      // 3. Delete leads
      await supabase.from("leads").delete().eq("organization_id", organization.id);
      // 4. Delete the organization itself
      const { error: deleteOrgError } = await supabase.from("organizations").delete().eq("id", organization.id);
      
      if (deleteOrgError) throw deleteOrgError;
      
      // Logout and redirect user to sign up
      await supabase.auth.signOut();
      window.location.href = "/signup";
    } catch (err) {
      console.error("Workspace deletion error:", err);
      setError("Failed to delete workspace: " + err.message);
      setDeleting(false);
      setShowDeleteModal(false);
    }
  }

  if (!organization) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6 rounded-2xl border border-[#14213d]/10 dark:border-white/10 bg-white/70 dark:bg-[#111827]/70 space-y-4 backdrop-blur-md">
        <h2 className="font-display font-bold text-lg text-[#14213d] dark:text-[#f9fafb]">
          Setting up your workspace…
        </h2>
        <p className="text-xs text-[#14213d]/60 dark:text-[#beb7a7]/60">
          We are checking for your organization details or creating your workspace. This usually takes just a few seconds.
        </p>
        
        {authError ? (
          <div className="p-4.5 rounded-xl bg-coral-100/50 dark:bg-coral-500/10 border border-coral-500/20 text-xs sm:text-sm space-y-3">
            <p className="font-bold text-coral-500">Database Diagnostic Alert:</p>
            <p className="text-[#14213d]/80 dark:text-ink-300 font-mono leading-relaxed bg-paper-100/50 dark:bg-ink-950/50 p-2.5 rounded text-xs">
              {authError}
            </p>
            <p className="text-xs text-ink-500 dark:text-ink-300">
              This error indicates that the Postgres database tables do not have standard access privileges granted to authenticated roles.
            </p>
            <div className="space-y-1.5">
              <p className="font-bold text-ink-700 dark:text-ink-200">How to fix this:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs text-ink-500 dark:text-ink-300">
                <li>Go to your **Supabase Dashboard**.</li>
                <li>In the left sidebar, click on **SQL Editor**.</li>
                <li>Click **New query**.</li>
                <li>Paste the following SQL commands and click **Run**:</li>
              </ol>
            </div>
            <pre className="p-3 rounded-lg bg-ink-950 text-[#f9fafb] text-[10px] sm:text-xs overflow-x-auto font-mono">
{`GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON public.organizations TO anon, authenticated, service_role;
GRANT ALL ON public.leads TO anon, authenticated, service_role;
GRANT ALL ON public.lead_activity TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;`}
            </pre>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-[#14213d]/60 dark:text-[#beb7a7]/60">
            <div className="w-4 h-4 rounded-full border-2 border-t-[#d8a64c] border-[#14213d]/10 dark:border-white/10 animate-spin"></div>
            <span>Connecting to Supabase and checking active session...</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6 font-body selection:bg-[#d8a64c] selection:text-white">
      
      {/* Business Profile Card Form */}
      <form
        onSubmit={handleUpdateProfile}
        className="rounded-2xl border border-[#14213d]/5 dark:border-white/5 bg-white/70 dark:bg-[#111827]/70 p-6 space-y-5 shadow-sm backdrop-blur-md"
      >
        <div className="flex items-center gap-2.5 pb-3.5 border-b border-[#14213d]/5 dark:border-white/5">
          <Building size={16} className="text-[#d8a64c]" />
          <h2 className="font-display font-bold text-sm text-[#14213d] dark:text-[#f9fafb] uppercase tracking-wider">
            Workspace Configuration
          </h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Workspace Name</label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#14213d]/5 dark:border-white/5 bg-[#f8f7f4] dark:bg-ink-950/40 text-xs sm:text-sm outline-none focus:border-[#d8a64c] text-[#14213d] dark:text-[#f9fafb] transition-all font-sans"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Contact Email</label>
            <input
              type="email"
              value={orgEmail}
              onChange={(e) => setOrgEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#14213d]/5 dark:border-white/5 bg-[#f8f7f4] dark:bg-ink-950/40 text-xs sm:text-sm outline-none focus:border-[#d8a64c] text-[#14213d] dark:text-[#f9fafb] transition-all font-sans"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Product Category</label>
            <input
              type="text"
              value={orgCategory}
              onChange={(e) => setOrgCategory(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#14213d]/5 dark:border-white/5 bg-[#f8f7f4] dark:bg-ink-950/40 text-xs sm:text-sm outline-none focus:border-[#d8a64c] text-[#14213d] dark:text-[#f9fafb] transition-all font-sans"
            />
          </div>
        </div>

        {success && (
          <p className="text-xs text-[#5b7553] bg-[#5b7553]/10 rounded-xl px-3 py-2 border border-[#5b7553]/15 font-bold flex items-center gap-1.5 animate-in fade-in duration-200">
            <Check size={12} />
            <span>{success}</span>
          </p>
        )}

        {error && (
          <p className="text-xs text-[#e06656] bg-[#e06656]/10 rounded-xl px-3 py-2 border border-[#e06656]/15 font-bold flex items-center gap-1.5 animate-in fade-in duration-200">
            <AlertCircle size={12} />
            <span>{error}</span>
          </p>
        )}

        <button
          type="submit"
          disabled={updating}
          className="px-5 py-2.5 rounded-xl bg-[#14213d] dark:bg-[#d8a64c] text-white dark:text-[#14213d] text-xs font-bold uppercase tracking-wider shadow transition-all cursor-pointer disabled:opacity-60 border-none hover:scale-[1.02]"
        >
          {updating ? "Saving..." : "Save Workspace Changes"}
        </button>
      </form>

      {/* Account Settings */}
      <div className="rounded-2xl border border-[#14213d]/5 dark:border-white/5 bg-white/70 dark:bg-[#111827]/70 p-6 space-y-4 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2.5 pb-3.5 border-b border-[#14213d]/5 dark:border-white/5">
          <User size={16} className="text-[#d8a64c]" />
          <h2 className="font-display font-bold text-sm text-[#14213d] dark:text-[#f9fafb] uppercase tracking-wider">
            Account Profile
          </h2>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sign-in Email Address</p>
          <p className="text-xs font-mono font-bold text-[#14213d] dark:text-white">
            {user?.email || "loading..."}
          </p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-[#e06656]/20 bg-[#e06656]/5 p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2.5 pb-3.5 border-b border-[#e06656]/15">
          <AlertTriangle size={16} className="text-[#e06656]" />
          <h2 className="font-display font-bold text-sm text-[#e06656] uppercase tracking-wider">
            Danger Zone
          </h2>
        </div>
        <p className="text-xs text-[#e06656]/85 font-light leading-relaxed">
          Deleting your organization workspace is permanent and cannot be undone. All active B2B leads, interaction logs, and AI history entries will be completely removed.
        </p>
        <button
          type="button"
          onClick={() => {
            setConfirmOrgName("");
            setShowDeleteModal(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-[#e06656] text-white text-xs font-bold uppercase tracking-wider shadow hover:bg-red-700 transition-all cursor-pointer border-none"
        >
          Delete Workspace
        </button>
      </div>

      {/* Delete Workspace Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111827] border border-[#e06656]/20 rounded-2xl p-6 max-w-md w-full space-y-4.5 shadow-2xl">
            <div className="flex items-center gap-2 text-[#e06656] pb-2 border-b border-[#e06656]/10">
              <AlertTriangle size={18} />
              <h3 className="font-display font-bold text-xs uppercase tracking-wider">
                Confirm Workspace Deletion
              </h3>
            </div>
            
            <p className="text-xs text-[#14213d]/70 dark:text-[#beb7a7]/80 leading-relaxed font-light">
              This action is <strong className="text-[#e06656] font-bold">permanent</strong> and will delete all B2B leads, customer metrics, outreach templates, and timelines scoped to the organization <strong className="font-bold text-[#14213d] dark:text-white">"{organization.name}"</strong>.
            </p>

            <div className="space-y-2">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                Type <span className="font-mono text-[#14213d] dark:text-white select-all">"{organization.name}"</span> to verify:
              </p>
              <input
                type="text"
                value={confirmOrgName}
                onChange={(e) => setConfirmOrgName(e.target.value)}
                placeholder="Workspace name..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-xs sm:text-sm outline-none focus:border-[#e06656] text-[#14213d] dark:text-[#f9fafb] font-sans"
              />
            </div>

            <div className="flex gap-2.5 justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmOrgName("");
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-[#14213d]/10 dark:border-white/10 hover:bg-[#14213d]/5 dark:hover:bg-white/5 text-slate-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteWorkspace}
                disabled={deleting || confirmOrgName !== organization.name}
                className="px-4.5 py-2.5 rounded-xl bg-[#e06656] text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-all disabled:opacity-50 border-none cursor-pointer"
              >
                {deleting ? "Deleting Workspace..." : "Confirm Secure Deletion"}
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
