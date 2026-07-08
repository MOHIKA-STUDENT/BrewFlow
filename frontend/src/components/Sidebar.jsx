import { NavLink } from "react-router-dom";
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
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-slate-900 bg-[#0b0f19]">
      {/* Brand mark */}
      <div className="flex items-center gap-2 px-6 h-16 border-b border-slate-900">
        <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center">
          <Droplet size={18} className="text-ink-950" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="font-display font-semibold text-sm tracking-tight text-white leading-none">
            BrewFlow
          </span>
          <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase mt-0.5">
            Sales OS
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-paper-200 text-ink-900 shadow-sm font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40",
              ].join(" ")
            }
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Workspace Footer Section */}
      <div className="px-4 py-4 border-t border-slate-900 space-y-3 mt-auto">
        {organization && (
          <div className="px-3 py-2 space-y-0.5 rounded-lg bg-slate-900/40 border border-slate-800/50">
            <p className="text-[9px] font-mono tracking-widest text-slate-500 uppercase">
              Workspace
            </p>
            <p className="text-sm font-bold text-white truncate leading-snug">
              {organization.name}
            </p>
            {organization.business_category && (
              <p className="text-[11px] text-slate-400 truncate">
                {organization.business_category}
              </p>
            )}
          </div>
        )}
        
        {user && (
          <p className="text-[10px] text-slate-500 truncate px-1" title={user.email}>
            {user.email}
          </p>
        )}
        
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors cursor-pointer border-none"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
