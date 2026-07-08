import { motion } from "framer-motion";

export default function StatCard({ label, value, delta, deltaTone = "moss", icon: Icon }) {
  const toneClasses = {
    moss: "text-[#5b7553] bg-[#5b7553]/10 border border-[#5b7553]/20",
    coral: "text-[#e06656] bg-[#e06656]/10 border border-[#e06656]/20",
  };

  return (
    <motion.div 
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="rounded-2xl border border-[#14213d]/5 dark:border-white/5 bg-white/70 dark:bg-[#111827]/70 p-5 shadow-sm backdrop-blur-md relative overflow-hidden"
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-[#14213d]/50 dark:text-[#beb7a7]/60 uppercase tracking-wider">{label}</span>
        {Icon && (
          <div className="w-8.5 h-8.5 rounded-xl bg-[#d8a64c]/10 flex items-center justify-center shadow-inner">
            <Icon size={16} className="text-[#d8a64c]" />
          </div>
        )}
      </div>
      <div className="mt-3.5 flex items-baseline gap-2">
        <span className="font-mono text-3xl font-bold text-[#14213d] dark:text-[#f9fafb] tracking-tight">
          {value}
        </span>
        {delta && (
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${toneClasses[deltaTone] || toneClasses.moss}`}>
            {delta}
          </span>
        )}
      </div>
      
      {/* Muted background geometric glow */}
      <div className="absolute -bottom-4 -right-4 w-12 h-12 rounded-full bg-[#d8a64c]/5 blur-lg pointer-events-none" />
    </motion.div>
  );
}
