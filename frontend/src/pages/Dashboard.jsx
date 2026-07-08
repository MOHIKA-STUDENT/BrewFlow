import { useEffect, useState } from "react";
import { Users, Heart, Trophy, AlertCircle, Clock } from "lucide-react";
import StatCard from "../components/StatCard";
import StatusPill from "../components/StatusPill";
import { getLeads } from "../lib/leadsApi";
import { useAuth } from "../lib/AuthContext";

export default function Dashboard() {
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalLeads = leads.length;
  const contactedLeads = leads.filter((l) => l.status === "Contacted").length;
  const interestedLeads = leads.filter((l) => l.status === "Interested").length;
  const customers = leads.filter((l) => l.status === "Customer").length;

  const withFollowUp = leads.filter((l) => l.next_follow_up_date);
  const overdue = withFollowUp.filter((l) => new Date(l.next_follow_up_date) < today);
  const upcoming = withFollowUp
    .filter((l) => new Date(l.next_follow_up_date) >= today)
    .sort((a, b) => new Date(a.next_follow_up_date) - new Date(b.next_follow_up_date))
    .slice(0, 5);

  if (loading) {
    return <p className="text-sm text-ink-500 dark:text-ink-300">Loading dashboard…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Leads" value={totalLeads} icon={Users} />
        <StatCard label="Contacted" value={contactedLeads} icon={Heart} />
        <StatCard label="Interested" value={interestedLeads} icon={Heart} />
        <StatCard label="Customers" value={customers} icon={Trophy} deltaTone="moss" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={16} className="text-coral-500" />
            <h2 className="font-display font-semibold text-ink-900 dark:text-paper-100">
              Overdue Follow-ups
            </h2>
            <span className="text-xs text-ink-500 dark:text-ink-300 ml-auto">{overdue.length}</span>
          </div>
          {overdue.length === 0 ? (
            <p className="text-sm text-ink-500 dark:text-ink-300">Nothing overdue — you're caught up.</p>
          ) : (
            <ul className="space-y-3">
              {overdue.map((lead) => (
                <li key={lead.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink-900 dark:text-paper-100">{lead.business_name}</span>
                  <span className="font-mono text-xs text-coral-500">{lead.next_follow_up_date}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-gold-600 dark:text-gold-400" />
            <h2 className="font-display font-semibold text-ink-900 dark:text-paper-100">
              Upcoming Follow-ups
            </h2>
            <span className="text-xs text-ink-500 dark:text-ink-300 ml-auto">{upcoming.length}</span>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-ink-500 dark:text-ink-300">No upcoming follow-ups scheduled.</p>
          ) : (
            <ul className="space-y-4">
              {upcoming.map((lead) => (
                <li key={lead.id} className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-ink-900 dark:text-paper-100">{lead.business_name}</p>
                    <p className="text-xs text-ink-500 dark:text-ink-300">{lead.next_follow_up_date}</p>
                  </div>
                  <StatusPill status={lead.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {totalLeads === 0 && (
        <div className="rounded-xl border border-dashed border-ink-100 dark:border-ink-800 p-8 text-center">
          <p className="text-sm text-ink-500 dark:text-ink-300">
            No leads yet. Head to the Leads page and add your first one — your dashboard
            fills in automatically from real data.
          </p>
        </div>
      )}
    </div>
  );
}
