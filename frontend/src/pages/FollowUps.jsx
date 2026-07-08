import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { mockLeads } from "../lib/mockData";

// Sprint 6 spec: automatic reminders, calendar, notifications, overdue tasks.
// Sprint 1 renders the shape of this with mock dates so the layout is
// proven out before any reminder/notification logic exists.
export default function FollowUps() {
  const today = new Date("2026-07-08");

  const withFollowUp = mockLeads.filter((l) => l.nextFollowUp);
  const overdue = withFollowUp.filter((l) => new Date(l.nextFollowUp) < today);
  const dueToday = withFollowUp.filter(
    (l) => new Date(l.nextFollowUp).toDateString() === today.toDateString()
  );
  const upcoming = withFollowUp.filter((l) => new Date(l.nextFollowUp) > today);

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
                <p className="font-medium text-ink-900 dark:text-paper-100">{lead.businessName}</p>
                <p className="text-xs text-ink-500 dark:text-ink-300">{lead.contactPerson}</p>
              </div>
              <span className="font-mono text-xs text-ink-500 dark:text-ink-300">
                {lead.nextFollowUp}
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
