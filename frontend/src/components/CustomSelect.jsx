import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomSelect({ value, onChange, options, className = "", buttonClassName = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[#14213d]/10 dark:border-white/10 bg-[#f8f7f4] dark:bg-ink-950/40 text-xs sm:text-sm font-bold text-[#14213d] dark:text-[#f9fafb] outline-none focus:border-[#d8a64c] transition-all cursor-pointer shadow-inner ${buttonClassName}`}
      >
        <span>{value || "Select option"}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-[#14213d]/15 dark:border-white/15 bg-white/95 dark:bg-[#151b2a]/95 p-1 shadow-2xl z-50 text-xs sm:text-sm backdrop-blur-md"
          >
            {options.map((opt) => {
              const label = typeof opt === "string" ? opt : opt.label;
              const val = typeof opt === "string" ? opt : opt.value;
              const isSelected = val === value;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    onChange(val);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left font-bold transition-all cursor-pointer border-none ${
                    isSelected
                      ? "bg-[#d8a64c]/10 text-[#d8a64c]"
                      : "text-[#14213d] dark:text-[#beb7a7] hover:bg-[#14213d]/5 dark:hover:bg-white/5 bg-transparent"
                  }`}
                >
                  <span>{label}</span>
                  {isSelected && <Check size={12} className="text-[#d8a64c]" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
