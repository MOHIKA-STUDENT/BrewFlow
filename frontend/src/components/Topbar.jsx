import { useState, useRef, useEffect } from "react";
import { Moon, Sun, Menu, LogOut, Settings } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { Link } from "react-router-dom";

export default function Topbar({ title, theme, onToggleTheme, onOpenMobileNav }) {
  const { user, organization, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 md:px-8 border-b border-[#14213d]/5 dark:border-white/5 bg-[#f7f5ef]/80 dark:bg-[#0b1120]/80 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="md:hidden p-2 -ml-2 rounded-xl text-ink-500 hover:bg-[#14213d]/5 dark:hover:bg-white/5"
          aria-label="Open navigation"
        >
          <Menu size={20} className="text-[#14213d] dark:text-[#f9fafb]" />
        </button>
        <h1 className="font-display text-lg font-bold text-[#14213d] dark:text-[#f9fafb] tracking-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="p-2.5 rounded-xl text-[#14213d]/70 hover:bg-[#14213d]/5 dark:text-[#beb7a7] dark:hover:bg-white/5 transition-all cursor-pointer hover:scale-105"
          aria-label="Toggle dark mode"
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Profile Dropdown Avatar Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-9 h-9 rounded-xl bg-[#d8a64c] hover:bg-[#c19036] text-white flex items-center justify-center font-display font-bold text-sm shadow-sm cursor-pointer transition-all hover:scale-105 border-none"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
            title="Profile Menu"
          >
            {organization?.name?.[0]?.toUpperCase() || "O"}
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-2.5 w-56 rounded-xl border border-[#14213d]/10 dark:border-white/10 bg-white/95 dark:bg-[#111827]/95 p-2 shadow-xl z-50 text-xs sm:text-sm backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2.5 border-b border-[#14213d]/5 dark:border-white/5 mb-1.5">
                <p className="font-bold text-[#14213d] dark:text-white truncate">
                  {organization?.name || "My Organization"}
                </p>
                <p className="text-[10px] font-mono text-[#14213d]/50 dark:text-[#beb7a7]/60 truncate mt-0.5">
                  {user?.email}
                </p>
              </div>
              
              <Link
                to="/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#14213d]/5 dark:hover:bg-white/5 text-[#14213d] dark:text-[#beb7a7] font-semibold transition-colors"
              >
                <Settings size={14} className="text-[#d8a64c]" /> Workspace Settings
              </Link>
              
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  signOut();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-coral-500/10 text-coral-500 font-semibold transition-colors text-left cursor-pointer border-none"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
