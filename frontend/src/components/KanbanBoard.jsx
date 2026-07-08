import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Calendar, User, ChevronRight, DollarSign } from "lucide-react";
import StatusPill from "./StatusPill";

const STATUSES = ["New Lead", "Contacted", "Interested", "Sample Sent", "Negotiation", "Customer", "Lost"];

// Indicator dot colors for Kanban headers
const HEADER_DOTS = {
  "New Lead": "bg-slate-400",
  "Contacted": "bg-[#d8a64c]",
  "Interested": "bg-[#d8a64c] shadow-[0_0_8px_#d8a64c]",
  "Sample Sent": "bg-blue-400",
  "Negotiation": "bg-[#e06656]",
  "Customer": "bg-[#5b7553] shadow-[0_0_8px_#5b7553]",
  "Lost": "bg-slate-300"
};

export default function KanbanBoard({ leads, onStatusChange, onAddLeadClick }) {
  const [draggedOverCol, setDraggedOverCol] = useState(null);

  // Group leads by status
  const groupedLeads = STATUSES.reduce((acc, status) => {
    acc[status] = leads.filter((l) => l.status === status);
    return acc;
  }, {});

  // Calculate sum of potential revenue for a list of leads
  const calculateTotalRevenue = (leadList) => {
    return leadList.reduce((sum, l) => sum + (Number(l.potential_monthly_revenue) || 0), 0);
  };

  const handleDragStart = (e, leadId) => {
    e.dataTransfer.setData("text/plain", leadId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    setDraggedOverCol(status);
  };

  const handleDragLeave = () => {
    setDraggedOverCol(null);
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    setDraggedOverCol(null);
    const leadId = e.dataTransfer.getData("text/plain");
    if (leadId) {
      onStatusChange(leadId, status);
    }
  };

  const isOverdue = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dateString) < today;
  };

  return (
    <div className="flex gap-4.5 overflow-x-auto pb-8 pt-2 snap-x scrollbar-thin">
      {STATUSES.map((status) => {
        const columnLeads = groupedLeads[status] || [];
        const totalRevenue = calculateTotalRevenue(columnLeads);
        const isCurrentDropZone = draggedOverCol === status;

        return (
          <div
            key={status}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
            className={`flex flex-col w-76 min-w-76 rounded-2xl border p-4 snap-align-start transition-all duration-300 relative ${
              isCurrentDropZone
                ? "border-[#d8a64c] bg-[#d8a64c]/5 shadow-lg scale-[1.01]"
                : "border-[#14213d]/5 dark:border-white/5 bg-white/70 dark:bg-[#111827]/70 backdrop-blur-md"
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#14213d]/5 dark:border-white/5 mb-4">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${HEADER_DOTS[status] || "bg-slate-400"}`} />
                <div>
                  <h3 className="font-display font-bold text-xs text-[#14213d] dark:text-[#f9fafb] uppercase tracking-wider">
                    {status === "New Lead" ? "New" : status === "Sample Sent" ? "Samples" : status}
                  </h3>
                  <p className="text-[9px] font-mono text-slate-400 font-bold mt-0.5">
                    {columnLeads.length} {columnLeads.length === 1 ? "lead" : "leads"}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <span className="font-mono text-xs font-bold text-[#14213d] dark:text-white">
                  ${totalRevenue.toLocaleString()}
                </span>
                <p className="text-[8px] uppercase tracking-wider font-bold text-slate-400">Value</p>
              </div>
            </div>

            {/* Leads Card Stack */}
            <div className="flex-1 space-y-3 min-h-[380px] overflow-y-auto max-h-[55vh] pr-1.5 scrollbar-thin">
              {columnLeads.map((lead) => {
                const initials = lead.business_name 
                  ? lead.business_name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
                  : "LD";

                return (
                  <motion.div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    whileHover={{ y: -2, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className="p-4 rounded-xl border border-[#14213d]/5 dark:border-white/5 bg-[#f8f7f4] dark:bg-ink-950/40 hover:bg-white dark:hover:bg-[#1f2937] transition-all cursor-grab active:cursor-grabbing hover:shadow-sm space-y-3 relative group"
                  >
                    {/* Header: Company Initials & Title */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#d8a64c]/10 text-[#d8a64c] flex items-center justify-center font-display font-bold text-[10px] shrink-0 shadow-inner">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/leads/${lead.id}`}
                          className="font-bold text-xs text-[#14213d] dark:text-[#f9fafb] hover:text-[#d8a64c] hover:underline block truncate"
                        >
                          {lead.business_name}
                        </Link>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <User size={10} /> 
                          <span className="truncate">{lead.contact_person || "No Contact"}</span>
                        </p>
                      </div>
                    </div>

                    {/* Chips tags */}
                    {(lead.business_type || lead.interested_products) && (
                      <div className="flex flex-wrap gap-1">
                        {lead.business_type && (
                          <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-slate-100 dark:bg-white/5 text-slate-500 border border-slate-200/50 dark:border-white/5">
                            {lead.business_type.split(",")[0].trim()}
                          </span>
                        )}
                        {lead.interested_products && (
                          <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-[#d8a64c]/10 text-[#d8a64c] border border-[#d8a64c]/20">
                            {lead.interested_products.split(",")[0].trim()}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer values */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#14213d]/5 dark:border-white/5 text-[9px] text-slate-400 font-bold uppercase">
                      <span className="font-mono text-xs text-[#14213d] dark:text-[#f9fafb]">
                        {lead.potential_monthly_revenue ? `$${Number(lead.potential_monthly_revenue).toLocaleString()}` : "—"}
                      </span>

                      {lead.next_follow_up_date ? (
                        <span className={`font-mono flex items-center gap-0.5 ${isOverdue(lead.next_follow_up_date) ? "text-[#e06656] font-bold" : ""}`}>
                          <Calendar size={10} /> {lead.next_follow_up_date}
                        </span>
                      ) : (
                        <span>no date</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {columnLeads.length === 0 && (
                <div className="h-full flex items-center justify-center border-2 border-dashed border-[#14213d]/5 dark:border-white/5 rounded-2xl p-6 text-center bg-white/20 dark:bg-black/10">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Drag leads here
                  </p>
                </div>
              )}
            </div>

            {/* Quick add lead button */}
            <button
              onClick={onAddLeadClick}
              className="mt-4 w-full py-2.5 border border-dashed border-[#14213d]/10 dark:border-white/10 hover:border-[#d8a64c] hover:bg-[#d8a64c]/5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-[#14213d]/50 dark:text-[#beb7a7]/50 hover:text-[#d8a64c] transition-all cursor-pointer"
            >
              <Plus size={11} className="inline mr-1" /> Add Lead
            </button>
          </div>
        );
      })}
    </div>
  );
}
