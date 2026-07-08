// Maps every pipeline stage (Sprint 5 spec) to a consistent color so the
// same status reads identically on the Leads table, the Pipeline board,
// and the Dashboard — one source of truth instead of styling it per-page.
const STYLES = {
  "New Lead": "bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-300",
  "Contacted": "bg-gold-500/15 text-gold-600 dark:text-gold-400",
  "Interested": "bg-gold-500/25 text-gold-600 dark:text-gold-400",
  "Sample Sent": "bg-ink-700/10 text-ink-700 dark:text-ink-300",
  "Negotiation": "bg-coral-100 text-coral-500 dark:bg-coral-500/15",
  "Customer": "bg-moss-100 text-moss-500 dark:bg-moss-500/15",
  "Lost": "bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-500 line-through",
};

export default function StatusPill({ status }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
        STYLES[status] || STYLES["New Lead"]
      }`}
    >
      {status}
    </span>
  );
}
