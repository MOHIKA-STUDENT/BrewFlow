import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Coffee, Calendar, MapPin, Package, ArrowRight, User } from "lucide-react";
import StatusPill from "./StatusPill";

const STATUSES = ["New Lead", "Contacted", "Interested", "Sample Sent", "Negotiation", "Customer", "Lost"];

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
    <div className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x scrollbar-thin scrollbar-thumb-ink-200 dark:scrollbar-thumb-ink-800">
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
            className={`flex flex-col w-80 min-w-80 rounded-xl border p-4 snap-align-start transition-all duration-200 ${
              isCurrentDropZone
                ? "border-gold-500 bg-gold-500/5 dark:bg-gold-500/10 shadow-lg scale-[1.01]"
                : "border-ink-100 dark:border-ink-800 bg-paper-50 dark:bg-ink-900"
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-ink-100 dark:border-ink-800 mb-4">
              <div>
                <h3 className="font-display font-bold text-sm text-ink-900 dark:text-paper-100 tracking-tight">
                  {status}
                </h3>
                <p className="text-[10px] font-mono text-ink-500 dark:text-ink-300 mt-0.5">
                  {columnLeads.length} {columnLeads.length === 1 ? "lead" : "leads"}
                </p>
              </div>
              
              <div className="text-right">
                <span className="font-mono text-xs font-semibold text-ink-800 dark:text-paper-100">
                  ${totalRevenue.toLocaleString()}
                </span>
                <p className="text-[9px] uppercase tracking-wider font-semibold text-ink-500">Value / mo</p>
              </div>
            </div>

            {/* Leads Card Stack */}
            <div className="flex-1 space-y-3 min-h-[350px] overflow-y-auto max-h-[60vh] pr-1.5 scrollbar-thin">
              {columnLeads.map((lead) => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead.id)}
                  className="p-3.5 rounded-lg border border-ink-100 dark:border-ink-800 bg-paper-100 dark:bg-ink-950/60 hover:bg-paper-50 dark:hover:bg-ink-950 transition-all cursor-grab active:cursor-grabbing hover:border-gold-500/50 hover:shadow-md hover:-translate-y-0.5 group space-y-3"
                >
                  {/* Lead Info */}
                  <div className="space-y-1">
                    <Link
                      to={`/leads/${lead.id}`}
                      className="font-display font-semibold text-sm text-ink-900 dark:text-paper-100 hover:text-gold-500 dark:hover:text-gold-400 hover:underline block truncate"
                    >
                      {lead.business_name}
                    </Link>
                    <p className="text-xs text-ink-500 dark:text-ink-300 flex items-center gap-1">
                      <User size={11} /> {lead.contact_person || "No Contact"}
                    </p>
                  </div>

                  {/* Badges and tags */}
                  {(lead.business_type || lead.interested_products) && (
                    <div className="flex flex-wrap gap-1">
                      {lead.business_type && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-ink-200/50 dark:bg-ink-800/80 text-ink-900 dark:text-paper-200">
                          {lead.business_type}
                        </span>
                      )}
                      {lead.interested_products && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/15">
                          {lead.interested_products.split(",")[0].trim()}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footing detail (Revenue & Follow up) */}
                  <div className="flex items-center justify-between pt-2 border-t border-ink-100/50 dark:border-ink-800/50 text-[10px] text-ink-500 dark:text-ink-300">
                    <span className="font-mono font-semibold text-ink-900 dark:text-paper-100">
                      {lead.potential_monthly_revenue ? `$${Number(lead.potential_monthly_revenue).toLocaleString()}` : "—"}
                    </span>

                    {lead.next_follow_up_date ? (
                      <span className={`font-mono flex items-center gap-0.5 ${isOverdue(lead.next_follow_up_date) ? "text-coral-500 font-semibold" : ""}`}>
                        <Calendar size={10} /> {lead.next_follow_up_date}
                      </span>
                    ) : (
                      <span>no date</span>
                    )}
                  </div>
                </div>
              ))}

              {columnLeads.length === 0 && (
                <div className="h-full flex items-center justify-center border-2 border-dashed border-ink-100 dark:border-ink-800/60 rounded-lg p-6 text-center">
                  <p className="text-xs text-ink-500 dark:text-ink-300">
                    Drag leads here
                  </p>
                </div>
              )}
            </div>

            {/* Quick add lead button at bottom of columns */}
            <button
              onClick={onAddLeadClick}
              className="mt-4 w-full py-2 border border-dashed border-ink-100 dark:border-ink-800 hover:border-gold-500 hover:bg-gold-500/5 rounded-lg text-xs font-semibold text-ink-500 hover:text-gold-500 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus size={12} /> Add Lead
            </button>
          </div>
        );
      })}
    </div>
  );
}
