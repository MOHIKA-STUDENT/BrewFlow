import { useState, useEffect, useCallback } from "react";
import {
  Mail,
  MessageCircle,
  Phone,
  FileText,
  User,
  CheckSquare,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Save,
  FileClock,
  Edit,
  Building,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { getLeads, getLead } from "../lib/leadsApi";
import { AIService, PROMPT_TYPES } from "../lib/aiService";

const ICON_MAP = {
  Mail,
  MessageCircle,
  Phone,
  FileText,
  User,
  CheckSquare
};

export default function AIAssistant() {
  const { user, organization, authError } = useAuth();
  const [leads, setLeads] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [selectedLead, setSelectedLead] = useState(null);
  
  const [activePromptId, setActivePromptId] = useState("cold_email");
  const [output, setOutput] = useState("");
  const [providerInfo, setProviderInfo] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedNotes, setSavedNotes] = useState(false);
  const [savedTimeline, setSavedTimeline] = useState(false);
  const [error, setError] = useState("");

  // Load leads
  useEffect(() => {
    if (!organization) return;
    getLeads()
      .then(setLeads)
      .catch((err) => console.error("Failed to load leads for AI Selector:", err));
  }, [organization]);

  // Load selected lead details
  useEffect(() => {
    if (!selectedLeadId) {
      setSelectedLead(null);
      return;
    }
    getLead(selectedLeadId)
      .then(setSelectedLead)
      .catch((err) => console.error("Failed to load lead details for AI prompt:", err));
  }, [selectedLeadId]);

  const activePrompt = PROMPT_TYPES.find((p) => p.id === activePromptId);

  async function handleGenerate() {
    if (!selectedLeadId) {
      setError("Please select a B2B lead to run the generator.");
      return;
    }
    setError("");
    setGenerating(true);
    setCopied(false);
    setSavedNotes(false);
    setSavedTimeline(false);
    setOutput("");

    try {
      const result = await AIService.generateSalesCopy({
        leadId: selectedLeadId,
        promptType: activePromptId,
        organizationId: organization.id,
        userId: user.id
      });

      setOutput(result.text);
      setProviderInfo({
        provider: result.provider,
        model: result.model,
        fallback: result.fallback
      });
    } catch (err) {
      setError("Failed to run copywriter: " + err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopyToClipboard() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy text: " + err.message);
    }
  }

  async function handleSaveToNotes() {
    if (!output || !selectedLead) return;
    try {
      const updatedNotes = await AIService.saveToNotes(selectedLead.id, selectedLead.general_notes, output);
      // Sync local lead states
      setSelectedLead((prev) => ({ ...prev, general_notes: updatedNotes }));
      setSavedNotes(true);
    } catch (err) {
      setError("Failed to append note: " + err.message);
    }
  }

  async function handleLogTimeline() {
    if (!selectedLead) return;
    try {
      await AIService.logToTimeline({
        leadId: selectedLead.id,
        organizationId: organization.id,
        userId: user.id,
        promptType: activePromptId
      });
      setSavedTimeline(true);
    } catch (err) {
      setError("Failed to write to timeline: " + err.message);
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-body selection:bg-gold-500 selection:text-white">
      
      {/* Left Column: Prompts List (Config-Driven) */}
      <div className="lg:col-span-1 space-y-3">
        <div className="p-2 border-b border-ink-100 dark:border-ink-800 mb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink-500">Outreach Prompt types</h2>
          <p className="text-[10px] text-ink-500 mt-0.5">Select pitch styles, emails, or actions.</p>
        </div>

        {PROMPT_TYPES.map((p) => {
          const Icon = ICON_MAP[p.icon] || Sparkles;
          const isActive = activePromptId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setActivePromptId(p.id)}
              className={`w-full text-left flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? "border-gold-500 bg-gold-500/10 dark:bg-gold-500/5 shadow-sm scale-[1.01]"
                  : "border-ink-100 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 hover:bg-ink-200/50 dark:hover:bg-ink-950"
              }`}
            >
              <Icon size={18} className="text-gold-500 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-ink-900 dark:text-paper-100">
                  {p.label}
                </p>
                <p className="text-xs text-ink-500 dark:text-ink-300 mt-0.5 leading-snug">
                  {p.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Right Column: Active Generation Panel */}
      <div className="lg:col-span-2 rounded-2xl border border-ink-100 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 p-6 flex flex-col space-y-5">
        
        {/* Select Target Lead */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink-900 dark:text-paper-200 uppercase tracking-wide block">
            Target Lead Selection
          </label>
          <select
            value={selectedLeadId}
            onChange={(e) => setSelectedLeadId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-ink-100 dark:border-ink-800 bg-[#f8f7f4] dark:bg-ink-950/40 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-ink-900 dark:text-paper-100 transition-all cursor-pointer"
          >
            <option value="">-- Choose a B2B Lead --</option>
            {leads.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.business_name} ({lead.contact_person || "No Contact"})
              </option>
            ))}
          </select>
        </div>

        {/* Lead Profile Metadata (Rendered when a lead is selected) */}
        {selectedLead && (
          <div className="p-4 rounded-xl border border-ink-100 dark:border-ink-800 bg-paper-100 dark:bg-ink-950/30 grid grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="flex items-start gap-2">
              <Building size={14} className="text-gold-500 mt-0.5" />
              <div>
                <p className="font-semibold text-ink-900 dark:text-paper-100">
                  {selectedLead.business_type || "B2B client"} in {selectedLead.city || "unknown"}
                </p>
                <p className="text-[10px] text-ink-500 mt-0.5">Region/Location</p>
              </div>
            </div>
            
            <div className="space-y-1 text-right">
              <span className="font-semibold text-ink-900 dark:text-paper-100">
                {selectedLead.interested_products || "No products spec"}
              </span>
              <p className="text-[10px] text-ink-500 mt-0.5">Interested Items</p>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={generating || !selectedLeadId}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500 text-ink-950 text-sm font-bold hover:bg-gold-400 disabled:opacity-60 transition-all shadow cursor-pointer border-none"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-t-gold-500 border-ink-950 animate-spin"></div>
                <span>Drafting copy...</span>
              </>
            ) : (
              <>
                <Sparkles size={15} />
                <span>Generate Outreach</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>

        {/* Alert Error */}
        {error && (
          <p className="text-xs text-coral-500 bg-coral-100 dark:bg-coral-500/10 rounded-lg px-3 py-2 border border-coral-500/10 font-semibold flex items-center gap-1.5">
            <AlertTriangle size={12} />
            <span>{error}</span>
          </p>
        )}

        {/* Output Textbox Editor */}
        <div className="flex-1 flex flex-col space-y-2.5 min-h-[300px]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-ink-900 dark:text-paper-200 uppercase tracking-wide block">
              Generated Sales Copy Draft (Editable)
            </label>
            
            {providerInfo && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1 ${
                providerInfo.fallback 
                  ? "bg-coral-100 border-coral-500/25 text-coral-500" 
                  : "bg-moss-100 border-moss-500/25 text-moss-500"
              }`}>
                <Sparkles size={9} />
                {providerInfo.fallback 
                  ? `${providerInfo.provider} (${providerInfo.model})` 
                  : `AI Powered: ${providerInfo.provider} (${providerInfo.model})`}
              </span>
            )}
          </div>

          <textarea
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            disabled={generating}
            placeholder="Choose outreach style and target lead, then click Generate. The copy output will appear here and you can edit it directly."
            className="flex-1 w-full p-4 rounded-xl border border-ink-100 dark:border-ink-800 bg-[#f8f7f4] dark:bg-ink-950/40 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-ink-900 dark:text-paper-100 transition-all font-sans leading-relaxed resize-none overflow-y-auto"
          />
        </div>

        {/* Post-Generation Action Panel */}
        {output && (
          <div className="flex flex-wrap gap-2.5 pt-4 border-t border-ink-100 dark:border-ink-800 justify-end">
            
            {/* Copy to Clipboard */}
            <button
              onClick={handleCopyToClipboard}
              className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-bold border border-ink-100 dark:border-ink-800 text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-950 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-moss-500" />
                  <span className="text-moss-500">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy to Clipboard</span>
                </>
              )}
            </button>

            {/* Save to Notes */}
            <button
              onClick={handleSaveToNotes}
              disabled={savedNotes}
              className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-bold border border-ink-100 dark:border-ink-800 text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-950 transition-colors cursor-pointer disabled:opacity-60"
            >
              {savedNotes ? (
                <>
                  <Check size={13} className="text-moss-500" />
                  <span className="text-moss-500">Saved to Notes!</span>
                </>
              ) : (
                <>
                  <Save size={13} />
                  <span>Save to Lead Notes</span>
                </>
              )}
            </button>

            {/* Save to Timeline */}
            <button
              onClick={handleLogTimeline}
              disabled={savedTimeline}
              className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-bold border border-ink-100 dark:border-ink-800 text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-950 transition-colors cursor-pointer disabled:opacity-60"
            >
              {savedTimeline ? (
                <>
                  <Check size={13} className="text-moss-500" />
                  <span className="text-moss-500">Logged to Activity!</span>
                </>
              ) : (
                <>
                  <FileClock size={13} />
                  <span>Log to Timeline</span>
                </>
              )}
            </button>

          </div>
        )}

      </div>

    </div>
  );
}
