// A single reusable "metric card." Sprint 1 uses hardcoded numbers;
// in Sprint 3 this exact component gets real props from the /api/stats
// endpoint — the visual design won't need to change at all.
export default function StatCard({ label, value, delta, deltaTone = "moss", icon: Icon }) {
  const toneClasses = {
    moss: "text-moss-500 bg-moss-100 dark:bg-moss-500/15",
    coral: "text-coral-500 bg-coral-100 dark:bg-coral-500/15",
  };

  return (
    <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 p-5">
      <div className="flex items-start justify-between">
        <span className="text-sm text-ink-500 dark:text-ink-300">{label}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-gold-500/15 flex items-center justify-center">
            <Icon size={16} className="text-gold-600 dark:text-gold-400" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-end gap-2">
        <span className="font-mono text-3xl font-semibold text-ink-900 dark:text-paper-100">
          {value}
        </span>
        {delta && (
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${toneClasses[deltaTone]}`}>
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}
