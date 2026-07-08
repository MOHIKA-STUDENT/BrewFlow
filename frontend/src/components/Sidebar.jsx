import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  Sparkles,
  Settings,
  Droplet,
  LogOut,
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/follow-ups", label: "Follow-ups", icon: CalendarClock },
  { to: "/ai-assistant", label: "AI Assistant", icon: Sparkles },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ onSignOut }) {
  const { user, organization } = useAuth();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-[#14213d]/10 bg-[#14213d] text-white">
      
      {/* Brand mark */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-[#d8a64c] flex items-center justify-center shadow-md">
          <Droplet size={18} className="text-[#14213d]" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="font-display font-bold text-sm tracking-tight text-[#f9fafb] leading-none">
            BrewFlow
          </span>
          <span className="text-[9px] font-mono tracking-widest text-[#d8a64c] uppercase mt-0.5 font-bold">
            Sales OS
          </span>
        </div>
      </div>

      {/* Navigation Links with Framer Motion slide indicators */}
      <nav className="flex-1 px-3 py-6 space-y-1.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white/5 rounded-xl border border-white/10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon
                  size={18}
                  className={`relative z-10 transition-colors ${
                    isActive ? "text-[#d8a64c]" : "text-[#beb7a7]/60"
                  }`}
                  strokeWidth={2}
                />
                <span
                  className={`relative z-10 transition-colors ${
                    isActive ? "text-white font-bold" : "text-[#beb7a7]/75 hover:text-white"
                  }`}
                >
                  {label}
                </span>
                {isActive && (
                  <span className="absolute right-3.5 w-1.5 h-1.5 rounded-full bg-[#d8a64c] relative z-10" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Workspace Footer Section */}
      <div className="px-4 py-4 border-t border-white/5 space-y-3.5 mt-auto">
        {organization && (
          <div className="px-3.5 py-3 space-y-1 rounded-xl bg-white/5 border border-white/10">
            <p className="text-[9px] font-mono tracking-widest text-[#d8a64c] uppercase font-bold">
              Workspace
            </p>
            <p className="text-sm font-bold text-white truncate leading-snug">
              {organization.name}
            </p>
            {organization.business_category && (
              <p className="text-[11px] text-[#beb7a7]/70 truncate">
                {organization.business_category}
              </p>
            )}
          </div>
        )}
        
        {user && (
          <p className="text-[10px] text-[#beb7a7]/40 truncate px-1 font-mono" title={user.email}>
            {user.email}
          </p>
        )}
        
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#beb7a7]/60 hover:text-white hover:bg-white/5 transition-all cursor-pointer border-none"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
