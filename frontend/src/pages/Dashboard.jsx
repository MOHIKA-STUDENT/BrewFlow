import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Trophy,
  AlertCircle,
  Clock,
  Sparkles,
  BarChart3,
  DollarSign,
  Droplet,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import StatCard from "../components/StatCard";
import StatusPill from "../components/StatusPill";
import { getLeads } from "../lib/leadsApi";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabaseClient";

export default function Dashboard() {
  const { organization, authError } = useAuth();
  const [leads, setLeads] = useState([]);
  const [recentAi, setRecentAi] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load leads
  useEffect(() => {
    if (!organization) return;
    getLeads()
      .then(setLeads)
      .finally(() => setLoading(false));
  }, [organization]);

  // Load recent AI outreach audit logs
  useEffect(() => {
    if (!organization) return;
    supabase
      .from("ai_generations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data) setRecentAi(data);
      })
      .catch((err) => console.error("Failed to load dashboard AI telemetry:", err));
  }, [organization]);

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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalLeads = leads.length;
  const contactedLeads = leads.filter((l) => l.status === "Contacted").length;
  const sampleSentLeads = leads.filter((l) => l.status === "Sample Sent").length;
  const customers = leads.filter((l) => l.status === "Customer").length;

  // Calculate Pipeline projected revenue
  const totalPipelineVal = leads.reduce((sum, lead) => sum + (Number(lead.potential_monthly_revenue) || 0), 0);

  const withFollowUp = leads.filter((l) => l.next_follow_up_date);
  const overdue = withFollowUp.filter((l) => new Date(l.next_follow_up_date) < today);
  const upcoming = withFollowUp
    .filter((l) => new Date(l.next_follow_up_date) >= today)
    .sort((a, b) => new Date(a.next_follow_up_date) - new Date(b.next_follow_up_date))
    .slice(0, 4);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-[#14213d]/60 dark:text-[#beb7a7]/60 p-8">
        <div className="w-4 h-4 rounded-full border-2 border-t-[#d8a64c] border-[#14213d]/10 dark:border-white/10 animate-spin"></div>
        <span>Syncing workspace dashboard metrics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-body selection:bg-[#d8a64c] selection:text-white">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total B2B Leads" value={totalLeads} icon={Users} />
        <StatCard label="Samples Sent" value={sampleSentLeads} icon={Droplet} />
        <StatCard label="Closed Won" value={customers} icon={Trophy} deltaTone="moss" />
        <StatCard 
          label="Projected Revenue" 
          value={`$${totalPipelineVal.toLocaleString()}`} 
          icon={DollarSign} 
          delta="Outbound" 
          deltaTone="moss" 
        />
      </div>

      {/* Main Grid: Workfeeds & Pipelines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Overdue & Upcoming feeds (Due calendar) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Overdue Follow-ups widget */}
          <div className="rounded-2xl border border-[#14213d]/5 dark:border-white/5 bg-white/70 dark:bg-[#111827]/70 p-5 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2 pb-3 border-b border-[#14213d]/5 dark:border-white/5 mb-4">
              <AlertCircle size={16} className="text-[#e06656]" />
              <h2 className="font-display font-bold text-sm text-[#14213d] dark:text-[#f9fafb] uppercase tracking-wider">
                Overdue Tasks
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#e06656]/15 text-[#e06656] border border-[#e06656]/20 ml-auto">
                {overdue.length} Action Needed
              </span>
            </div>
            {overdue.length === 0 ? (
              <p className="text-xs text-[#14213d]/50 dark:text-[#beb7a7]/50 py-4 text-center">Nothing overdue — you are caught up.</p>
            ) : (
              <ul className="space-y-2.5">
                {overdue.map((lead) => (
                  <li key={lead.id} className="flex items-center justify-between p-3.5 rounded-xl border border-[#14213d]/5 dark:border-white/5 bg-[#f7f5ef]/40 dark:bg-black/10 hover:border-[#d8a64c]/20 transition-all">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#14213d] dark:text-[#f9fafb]">{lead.business_name}</span>
                      <span className="text-[10px] text-[#14213d]/50 dark:text-[#beb7a7]/50 mt-0.5">
                        {lead.contact_person || "Procurement Manager"} · {lead.city}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-[#e06656] bg-[#e06656]/10 px-2.5 py-1 rounded-lg border border-[#e06656]/25">
                      {lead.next_follow_up_date}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Upcoming Follow-ups timeline */}
          <div className="rounded-2xl border border-[#14213d]/5 dark:border-white/5 bg-white/70 dark:bg-[#111827]/70 p-5 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2 pb-3 border-b border-[#14213d]/5 dark:border-white/5 mb-4">
              <Clock size={16} className="text-[#d8a64c]" />
              <h2 className="font-display font-bold text-sm text-[#14213d] dark:text-[#f9fafb] uppercase tracking-wider">
                Upcoming Timeline Schedule
              </h2>
              <span className="text-xs text-[#14213d]/40 dark:text-[#beb7a7]/40 font-mono ml-auto">{upcoming.length} Scheduled</span>
            </div>
            {upcoming.length === 0 ? (
              <p className="text-xs text-[#14213d]/50 dark:text-[#beb7a7]/50 py-4 text-center">No upcoming follow-ups scheduled.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-3.5 rounded-xl border border-[#14213d]/5 dark:border-white/5 bg-[#f7f5ef]/40 dark:bg-black/10 hover:border-[#d8a64c]/20 transition-all">
                    <div>
                      <p className="text-xs font-bold text-[#14213d] dark:text-[#f9fafb]">{lead.business_name}</p>
                      <p className="text-[10px] text-[#14213d]/50 dark:text-[#beb7a7]/50 mt-0.5">Due: {lead.next_follow_up_date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#14213d]/50 mr-2">{lead.interested_products || "No custom products"}</span>
                      <StatusPill status={lead.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Pipeline distribution & Recent AI logs */}
        <div className="space-y-6">
          
          {/* Pipeline Snapshot (Visual Meters) */}
          <div className="rounded-2xl border border-[#14213d]/5 dark:border-white/5 bg-white/70 dark:bg-[#111827]/70 p-5 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2 pb-3 border-b border-[#14213d]/5 dark:border-white/5 mb-4">
              <BarChart3 size={16} className="text-[#d8a64c]" />
              <h2 className="font-display font-bold text-sm text-[#14213d] dark:text-[#f9fafb] uppercase tracking-wider">
                Pipeline Snapshot
              </h2>
            </div>
            
            <div className="space-y-4">
              {/* Calculate dynamic percentages */}
              {[
                { label: "New Leads", count: leads.filter((l) => l.status === "New Lead").length },
                { label: "Contacted", count: contactedLeads },
                { label: "Interested", count: leads.filter((l) => l.status === "Interested").length },
                { label: "Sample Sent", count: sampleSentLeads },
                { label: "Closed Won", count: customers }
              ].map((stage) => {
                const percentage = totalLeads ? ((stage.count / totalLeads) * 100) : 0;
                return (
                  <div key={stage.label} className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#14213d] dark:text-[#beb7a7]">
                      <span>{stage.label}</span>
                      <span className="font-mono text-[#d8a64c]">{stage.count} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 w-full bg-[#14213d]/5 dark:bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full ${
                          stage.label === "Closed Won" 
                            ? "bg-[#5b7553]" 
                            : stage.label === "Sample Sent" 
                            ? "bg-[#d8a64c]" 
                            : "bg-[#14213d]/60 dark:bg-white/40"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent AI generations database feed */}
          <div className="rounded-2xl border border-[#14213d]/5 dark:border-white/5 bg-white/70 dark:bg-[#111827]/70 p-5 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2 pb-3 border-b border-[#14213d]/5 dark:border-white/5 mb-4">
              <Sparkles size={16} className="text-[#d8a64c]" />
              <h2 className="font-display font-bold text-sm text-[#14213d] dark:text-[#f9fafb] uppercase tracking-wider">
                Recent AI Generations
              </h2>
            </div>
            {recentAi.length === 0 ? (
              <p className="text-xs text-[#14213d]/50 dark:text-[#beb7a7]/50 py-4 text-center">No AI logs generated yet in this workspace.</p>
            ) : (
              <ul className="space-y-3.5">
                {recentAi.map((gen) => (
                  <li key={gen.id} className="text-xs space-y-1 p-2 rounded-lg bg-[#f7f5ef]/40 dark:bg-ink-950/20 border border-[#14213d]/5">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-[#d8a64c] uppercase tracking-wider">{gen.prompt_type.replace("_", " ")}</span>
                      <span className="font-mono text-[#14213d]/40 dark:text-[#beb7a7]/40">
                        {new Date(gen.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[#14213d]/70 dark:text-[#beb7a7]/80 truncate pr-2 font-mono text-[10px]">
                      {gen.response}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>

      </div>

      {/* Empty Slate Handler */}
      {totalLeads === 0 && (
        <div className="rounded-2xl border border-dashed border-[#14213d]/10 dark:border-white/10 p-10 text-center bg-white/30 dark:bg-black/10">
          <p className="text-xs sm:text-sm text-[#14213d]/50 dark:text-[#beb7a7]/50">
            No leads yet. Head to the Leads page and add your first one — your dashboard
            fills in automatically from real data.
          </p>
        </div>
      )}
    </div>
  );
}
