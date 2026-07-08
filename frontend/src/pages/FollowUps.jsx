import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
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

  if (loading) {
    return <p className="text-sm text-ink-500 dark:text-ink-300">Loading follow-ups…</p>;
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

  const Section = ({ title, icon: Icon, tone, items }) => (
    <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={16} className={tone} />
        <h2 className="font-display font-semibold text-ink-900 dark:text-paper-100">{title}</h2>
        <span className="text-xs text-ink-500 dark:text-ink-300 ml-auto">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-ink-500 dark:text-ink-300">Nothing here — you're caught up.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((lead) => (
            <li key={lead.id} className="flex items-center justify-between text-sm">
              <div>
                <Link
                  to={`/leads/${lead.id}`}
                  className="font-medium text-ink-900 dark:text-paper-100 hover:text-gold-500 dark:hover:text-gold-400 hover:underline transition-colors"
                >
                  {lead.business_name}
                </Link>
                <p className="text-xs text-ink-500 dark:text-ink-300">{lead.contact_person || "No Contact"}</p>
              </div>
              <span className="font-mono text-xs text-ink-500 dark:text-ink-300">
                {lead.next_follow_up_date}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <Section title="Overdue" icon={AlertCircle} tone="text-coral-500" items={overdue} />
      <Section title="Due Today" icon={Clock} tone="text-gold-600 dark:text-gold-400" items={dueToday} />
      <Section title="Upcoming" icon={CheckCircle2} tone="text-moss-500" items={upcoming} />
    </div>
  );
}
