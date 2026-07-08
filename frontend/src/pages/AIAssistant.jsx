import { useState, useEffect } from "react";
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
  Building,
  AlertTriangle,
  History,
  MessageSquare
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { getLeads, getLead } from "../lib/leadsApi";
import { AIService, PROMPT_TYPES } from "../lib/aiService";
import { supabase } from "../lib/supabaseClient";
import CustomSelect from "../components/CustomSelect";

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

  // ChatGPT History logs
  const [historyLogs, setHistoryLogs] = useState([]);

  // Load leads
  useEffect(() => {
    if (!organization) return;
    getLeads()
      .then(setLeads)
      .catch((err) => console.error("Failed to load leads for AI Selector:", err));
  }, [organization]);

  // Load history logs from ai_generations table
  const loadHistory = useEffect(() => {
    if (!organization) return;
    supabase
      .from("ai_generations")
      .select("*, leads(business_name)")
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (data) setHistoryLogs(data);
      })
      .catch((err) => console.error("Failed to load history logs:", err));
  }, [organization, generating]); // Reload history when a new copy is generated!

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

  const handleSelectHistoryItem = (item) => {
    setOutput(item.response);
    setSelectedLeadId(item.lead_id);
    setActivePromptId(item.prompt_type);
    setProviderInfo({
      provider: item.provider,
      model: item.model,
      fallback: item.status === "failed"
    });
    setCopied(false);
    setSavedNotes(false);
    setSavedTimeline(false);
  };

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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 font-body selection:bg-[#d8a64c] selection:text-white">
      
      {/* Left Column: ChatGPT Style Generation Logs Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        
        {/* Prompt Category Selectors */}
        <div className="rounded-2xl border border-[#14213d]/5 dark:border-white/5 bg-white/70 dark:bg-[#111827]/70 p-4 space-y-2.5 shadow-sm backdrop-blur-md">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Outreach Prompt</p>
          <div className="space-y-1.5">
            {PROMPT_TYPES.map((p) => {
              const Icon = ICON_MAP[p.icon] || Sparkles;
              const isActive = activePromptId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setActivePromptId(p.id)}
                  className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${
                    isActive
                      ? "bg-[#d8a64c] text-white shadow-sm"
                      : "text-[#14213d]/60 dark:text-[#beb7a7]/65 hover:bg-[#14213d]/5 dark:hover:bg-white/5 bg-transparent"
                  }`}
                >
                  <Icon size={13} className={isActive ? "text-white" : "text-[#d8a64c]"} />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Audit Trails History Panel */}
        <div className="rounded-2xl border border-[#14213d]/5 dark:border-white/5 bg-white/70 dark:bg-[#111827]/70 p-4 space-y-3.5 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-xs text-[#14213d]/60 dark:text-[#beb7a7]/60">
            <History size={13} className="text-[#d8a64c]" />
            <span className="font-bold uppercase tracking-wider text-[10px]">Recent Outbox History</span>
          </div>

          <div className="space-y-2">
            {historyLogs.length === 0 ? (
              <p className="text-[10px] text-slate-400 font-light italic text-center py-4">No outreach logs recorded.</p>
            ) : (
              historyLogs.map((log) => (
                <button
                  key={log.id}
                  onClick={() => handleSelectHistoryItem(log)}
                  className="w-full text-left p-2.5 rounded-xl bg-[#f8f7f4]/60 dark:bg-black/10 border border-[#14213d]/5 hover:border-[#d8a64c]/20 hover:bg-white dark:hover:bg-[#1f2937] transition-all text-[11px] block space-y-1 cursor-pointer"
                >
                  <div className="flex items-center justify-between text-[9px] font-bold text-slate-400">
                    <span className="uppercase">{log.prompt_type.replace("_", " ")}</span>
                    <span>{new Date(log.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                  </div>
                  <p className="font-bold text-[#14213d] dark:text-[#f9fafb] truncate">
                    {log.leads?.business_name || "Active lead"}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{log.response}</p>
                </button>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Right 3-columns: Main Chat Generation Hub */}
      <div className="lg:col-span-3 rounded-2xl border border-[#14213d]/5 dark:border-white/5 bg-white/70 dark:bg-[#111827]/70 p-6 flex flex-col space-y-5 shadow-sm backdrop-blur-md">
        
        {/* Select Target Lead */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[10px] font-bold text-[#14213d]/50 dark:text-slate-400 uppercase tracking-widest block">
              Lead Target Sourcing Selection
            </label>
            <CustomSelect
              value={leads.find((l) => l.id === selectedLeadId)?.business_name || ""}
              onChange={(val) => setSelectedLeadId(val)}
              options={leads.map((lead) => ({
                value: lead.id,
                label: `${lead.business_name} (${lead.contact_person || "No Contact"})`,
              }))}
              buttonClassName="py-3 px-4 shadow-inner"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating || !selectedLeadId}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#14213d] dark:bg-[#d8a64c] text-white dark:text-[#14213d] text-xs font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition-all shadow border-none cursor-pointer"
          >
            {generating ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-t-white dark:border-t-[#14213d] border-transparent animate-spin"></div>
                <span>Drafting copy...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Generate Outreach</span>
                <ArrowRight size={13} />
              </>
            )}
          </button>
        </div>

        {/* Lead Profile Metadata Info Card */}
        {selectedLead && (
          <div className="p-4 rounded-xl border border-[#14213d]/5 dark:border-white/5 bg-[#f8f7f4]/60 dark:bg-black/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="space-y-0.5">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Category / City</p>
              <p className="font-bold text-[#14213d] dark:text-white truncate">
                {selectedLead.business_type || "B2B client"} · {selectedLead.city || "unknown"}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Interested Products</p>
              <p className="font-bold text-[#14213d] dark:text-white truncate">
                {selectedLead.interested_products || "No product specified"}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Competitor Supplier</p>
              <p className="font-bold text-[#14213d] dark:text-white truncate">
                {selectedLead.current_supplier || "Unknown"}
              </p>
            </div>
            <div className="space-y-0.5 text-right">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Monthly Consumption</p>
              <p className="font-bold text-[#14213d] dark:text-white">
                {selectedLead.estimated_monthly_consumption || "—"}
              </p>
            </div>
          </div>
        )}

        {/* Interactive ChatGPT Suggestion Chips (Rendered when lead is selected but output is blank) */}
        {!output && selectedLead && (
          <div className="space-y-2">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Quick suggestions</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Introductory B2B mail", id: "cold_email" },
                { label: "WhatsApp follow-up ping", id: "whatsapp_followup" },
                { label: "30s Cold call script", id: "call_script" }
              ].map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => {
                    setActivePromptId(chip.id);
                    setError("");
                  }}
                  className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                    activePromptId === chip.id
                      ? "bg-[#d8a64c]/10 text-[#d8a64c] border-[#d8a64c]/30"
                      : "border-[#14213d]/5 dark:border-white/5 hover:border-[#d8a64c]/20 bg-white/40 dark:bg-black/10 text-[#14213d]/60 dark:text-[#beb7a7]/65"
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Alert Error */}
        {error && (
          <p className="text-xs text-[#e06656] bg-[#e06656]/10 rounded-xl px-3.5 py-2.5 border border-[#e06656]/20 font-bold flex items-center gap-1.5">
            <AlertTriangle size={13} />
            <span>{error}</span>
          </p>
        )}

        {/* Large Chat text editor output box */}
        <div className="flex-1 flex flex-col space-y-2 min-h-[350px]">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-[#14213d]/50 dark:text-slate-400 uppercase tracking-widest block">
              Outreach Script Output Editor
            </label>
            
            {providerInfo && (
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1.5 ${
                providerInfo.fallback 
                  ? "bg-[#e06656]/10 border-[#e06656]/20 text-[#e06656]" 
                  : "bg-[#5b7553]/10 border-[#5b7553]/20 text-[#5b7553]"
              }`}>
                <Sparkles size={10} />
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
            placeholder="Select a lead and outreach style above, then generate. Your AI copy will compile here for review and live edit."
            className="flex-1 w-full p-4.5 rounded-2xl border border-[#14213d]/5 dark:border-white/5 bg-[#f8f7f4] dark:bg-ink-950/40 text-xs sm:text-sm outline-none focus:border-[#d8a64c] text-[#14213d] dark:text-[#f9fafb] transition-all font-sans leading-relaxed resize-none shadow-inner"
          />
        </div>

        {/* Post-Generation Action Panel */}
        {output && (
          <div className="flex flex-wrap gap-2.5 pt-4.5 border-t border-[#14213d]/5 dark:border-white/5 justify-end">
            
            {/* Copy to Clipboard */}
            <button
              onClick={handleCopyToClipboard}
              className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-[#14213d]/10 dark:border-white/10 text-slate-500 hover:bg-[#14213d]/5 dark:hover:bg-white/5 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-[#5b7553]" />
                  <span className="text-[#5b7553]">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy text</span>
                </>
              )}
            </button>

            {/* Save to Notes */}
            <button
              onClick={handleSaveToNotes}
              disabled={savedNotes}
              className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-[#14213d]/10 dark:border-white/10 text-slate-500 hover:bg-[#14213d]/5 dark:hover:bg-white/5 transition-all cursor-pointer disabled:opacity-60"
            >
              {savedNotes ? (
                <>
                  <Check size={13} className="text-[#5b7553]" />
                  <span className="text-[#5b7553]">Notes Updated!</span>
                </>
              ) : (
                <>
                  <Save size={13} />
                  <span>Save to Notes</span>
                </>
              )}
            </button>

            {/* Save to Timeline */}
            <button
              onClick={handleLogTimeline}
              disabled={savedTimeline}
              className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-[#14213d]/10 dark:border-white/10 text-slate-500 hover:bg-[#14213d]/5 dark:hover:bg-white/5 transition-all cursor-pointer disabled:opacity-60"
            >
              {savedTimeline ? (
                <>
                  <Check size={13} className="text-[#5b7553]" />
                  <span className="text-[#5b7553]">Activity Logged!</span>
                </>
              ) : (
                <>
                  <FileClock size={13} />
                  <span>Log Timeline</span>
                </>
              )}
            </button>

          </div>
        )}

      </div>

    </div>
  );
}
