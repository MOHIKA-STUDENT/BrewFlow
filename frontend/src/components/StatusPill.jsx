const STYLES = {
  "New Lead": "bg-slate-100 text-slate-700 border border-slate-200/50 dark:bg-white/5 dark:text-[#beb7a7] dark:border-white/10",
  "Contacted": "bg-[#d8a64c]/10 text-[#d8a64c] border border-[#d8a64c]/20",
  "Interested": "bg-[#d8a64c]/15 text-[#d8a64c] border border-[#d8a64c]/30 font-bold",
  "Sample Sent": "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
  "Negotiation": "bg-[#e06656]/10 text-[#e06656] border border-[#e06656]/20",
  "Customer": "bg-[#5b7553]/10 text-[#5b7553] border border-[#5b7553]/20 font-bold",
  "Lost": "bg-slate-100 text-slate-400 border border-slate-200 line-through dark:bg-white/5 dark:text-slate-600 dark:border-white/5",
};

export default function StatusPill({ status }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
        STYLES[status] || STYLES["New Lead"]
      }`}
    >
      {status}
    </span>
  );
}
