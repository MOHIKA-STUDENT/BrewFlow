import { useState, useRef, useEffect } from "react";
import { Moon, Sun, Search, Menu, LogOut, Settings, User } from "lucide-react";
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
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 md:px-8 border-b border-ink-100 dark:border-ink-800 bg-paper-100/80 dark:bg-ink-950/80 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="md:hidden p-2 -ml-2 rounded-lg text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
        <h1 className="font-display text-xl font-semibold text-ink-900 dark:text-paper-100">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800 dark:text-ink-300 transition-colors cursor-pointer"
          aria-label="Toggle dark mode"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Profile Dropdown Avatar Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-9 h-9 rounded-full bg-gold-500 hover:bg-gold-400 text-paper-50 flex items-center justify-center font-display font-bold text-sm shadow cursor-pointer transition-all hover:scale-105"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
            title="Profile Menu"
          >
            {organization?.name?.[0]?.toUpperCase() || "O"}
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg border border-ink-100 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 p-2.5 shadow-xl z-50 text-xs sm:text-sm animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-2.5 py-2 border-b border-ink-100 dark:border-ink-800 mb-2">
                <p className="font-semibold text-ink-900 dark:text-paper-100 truncate">
                  {organization?.name || "My Organization"}
                </p>
                <p className="text-[10px] font-mono text-ink-500 dark:text-ink-300 truncate mt-0.5">
                  {user?.email}
                </p>
              </div>
              
              <Link
                to="/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-2.5 py-2 rounded-md hover:bg-ink-100/60 dark:hover:bg-ink-800/60 text-ink-700 dark:text-ink-300 font-medium transition-colors"
              >
                <Settings size={14} /> Workspace Settings
              </Link>
              
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  signOut();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md hover:bg-coral-100 dark:hover:bg-coral-500/10 text-coral-500 font-medium transition-colors text-left cursor-pointer border-none"
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
