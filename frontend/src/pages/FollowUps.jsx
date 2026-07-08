import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Clock, Calendar, User, ArrowRight } from "lucide-react";
import { getLeads } from "../lib/leadsApi";
import { useAuth } from "../lib/AuthContext";
import { Link } from "react-router-dom";

export default function FollowUps() {
  const { organization, authError } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organization) return;
    getLeads()
      .then(setLeads)
      .finally(() => setLoading(false));
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

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-[#14213d]/60 dark:text-[#beb7a7]/60 p-8">
        <div className="w-4 h-4 rounded-full border-2 border-t-[#d8a64c] border-[#14213d]/10 dark:border-white/10 animate-spin"></div>
        <span>Querying upcoming follow-up schedules...</span>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const withFollowUp = leads.filter((l) => l.next_follow_up_date);

  const overdue = withFollowUp.filter((l) => new Date(l.next_follow_up_date) < today);
  const dueToday = withFollowUp.filter((l) => {
    const d = new Date(l.next_follow_up_date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });
  const upcoming = withFollowUp.filter((l) => new Date(l.next_follow_up_date) > today);

  const Section = ({ title, icon: Icon, tone, borderTone, badgeColor, items }) => (
    <div className="rounded-2xl border border-[#14213d]/5 dark:border-white/5 bg-white/70 dark:bg-[#111827]/70 p-5 shadow-sm backdrop-blur-md flex flex-col h-full relative">
      <div className="flex items-center gap-2 pb-3.5 border-b border-[#14213d]/5 dark:border-white/5 mb-4">
        <Icon size={16} className={tone} />
        <h2 className="font-display font-bold text-xs text-[#14213d] dark:text-[#f9fafb] uppercase tracking-wider">{title}</h2>
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ml-auto font-mono ${badgeColor}`}>
          {items.length}
        </span>
      </div>
      
      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10">
          <CheckCircle2 size={24} className="text-slate-300 dark:text-slate-700 mb-2" />
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">All caught up</p>
        </div>
      ) : (
        <ul className="space-y-2.5 flex-1 overflow-y-auto pr-1">
          {items.map((lead) => {
            const initials = lead.business_name 
              ? lead.business_name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
              : "LD";
            return (
              <motion.li 
                whileHover={{ x: 2 }}
                key={lead.id} 
                className={`p-3.5 rounded-xl border border-transparent bg-[#f8f7f4]/60 dark:bg-black/10 hover:border-slate-200/80 dark:hover:border-white/5 flex items-center justify-between gap-3 transition-all`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-7.5 h-7.5 rounded-lg bg-[#d8a64c]/10 text-[#d8a64c] flex items-center justify-center font-display font-bold text-[10px] shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <Link
                      to={`/leads/${lead.id}`}
                      className="text-xs font-bold text-[#14213d] dark:text-[#f9fafb] hover:text-[#d8a64c] hover:underline transition-colors block truncate"
                    >
                      {lead.business_name}
                    </Link>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mt-0.5">
                      <User size={9} /> {lead.contact_person || "No Contact"}
                    </p>
                  </div>
                </div>
                
                <span className={`font-mono text-[9px] font-bold px-2 py-1 rounded-lg border shrink-0 ${borderTone}`}>
                  {lead.next_follow_up_date}
                </span>
              </motion.li>
            );
          })}
        </ul>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 font-body selection:bg-[#d8a64c] selection:text-white">
      <Section 
        title="Overdue Schedule" 
        icon={AlertCircle} 
        tone="text-[#e06656]" 
        borderTone="bg-[#e06656]/10 border-[#e06656]/20 text-[#e06656]"
        badgeColor="bg-[#e06656]/10 text-[#e06656] border-[#e06656]/20"
        items={overdue} 
      />
      <Section 
        title="Due Today" 
        icon={Clock} 
        tone="text-[#d8a64c]" 
        borderTone="bg-[#d8a64c]/10 border-[#d8a64c]/20 text-[#d8a64c]"
        badgeColor="bg-[#d8a64c]/10 text-[#d8a64c] border-[#d8a64c]/20"
        items={dueToday} 
      />
      <Section 
        title="Upcoming Outbound" 
        icon={Calendar} 
        tone="text-[#5b7553]" 
        borderTone="bg-slate-100 border-slate-200/50 text-slate-500 dark:bg-white/5 dark:border-white/10 dark:text-[#beb7a7]"
        badgeColor="bg-slate-100 text-slate-500 border-slate-200 dark:bg-white/5 dark:text-[#beb7a7] dark:border-white/10"
        items={upcoming} 
      />
    </div>
  );
}
