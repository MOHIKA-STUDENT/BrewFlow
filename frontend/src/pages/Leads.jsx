import { useState, useMemo, useEffect, useCallback } from "react";
import { Plus, Search, Trash2, Pencil, List, Layers, Building } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import StatusPill from "../components/StatusPill";
import LeadFormModal from "../components/LeadFormModal";
import KanbanBoard from "../components/KanbanBoard";
import { useAuth } from "../lib/AuthContext";
import { getLeads, createLead, updateLead, softDeleteLead } from "../lib/leadsApi";

const STATUS_FILTERS = ["All", "New Lead", "Contacted", "Interested", "Sample Sent", "Negotiation", "Customer", "Lost"];

export default function Leads() {
  const { user, organization, authError } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // list or board

  const loadLeads = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    setError("");
    try {
      const data = await getLeads();
      setLeads(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [organization]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      const matchesQuery =
        lead.business_name?.toLowerCase().includes(query.toLowerCase()) ||
        lead.contact_person?.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "All" || lead.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [leads, query, statusFilter]);

  async function handleCreateOrUpdate(formValues) {
    setError("");
    try {
      if (editingLead) {
        await updateLead(editingLead.id, organization.id, user.id, formValues, editingLead);
      } else {
        await createLead(organization.id, user.id, formValues);
      }
      setModalOpen(false);
      await loadLeads();
    } catch (err) {
      console.error(err);
      setError("Failed to save lead: " + err.message);
    }
  }

  async function handleStatusChange(leadId, newStatus) {
    const leadToUpdate = leads.find((l) => l.id === leadId);
    if (!leadToUpdate) return;
    try {
      await updateLead(leadId, organization.id, user.id, { status: newStatus }, leadToUpdate);
      await loadLeads();
    } catch (err) {
      setError("Failed to update status: " + err.message);
    }
  }

  async function handleDelete(lead) {
    if (!confirm(`Delete ${lead.business_name}? This can be recovered later — it's a soft delete.`)) return;
    await softDeleteLead(lead.id, organization.id, user.id);
    await loadLeads();
  }

  function openAddModal() {
    setEditingLead(null);
    setModalOpen(true);
  }

  function openEditModal(lead) {
    setEditingLead(lead);
    setModalOpen(true);
  }

  if (!organization) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6 rounded-2xl border border-[#14213d]/10 dark:border-white/10 bg-white/70 dark:bg-[#111827]/70 space-y-4 backdrop-blur-md">
        <h2 className="font-display font-bold text-lg text-[#14213d] dark:text-[#f9fafb]">
          Setting up your workspace…
        </h2>
        <p className="text-xs text-[#14213d]/60 dark:text-[#beb7a7]/60">
          We are checking for your organization details or creating your workspace. This usually takes just a few seconds.
        </p>
        
        {authError ? (
          <div className="p-4.5 rounded-xl bg-coral-100/50 dark:bg-coral-500/10 border border-coral-500/20 text-xs sm:text-sm space-y-3">
            <p className="font-bold text-coral-500">Database Diagnostic Alert:</p>
            <p className="text-[#14213d]/80 dark:text-ink-300 font-mono leading-relaxed bg-paper-100/50 dark:bg-ink-950/50 p-2.5 rounded text-xs">
              {authError}
            </p>
            <p className="text-xs text-ink-500 dark:text-ink-300">
              This error indicates that the Postgres database tables do not have standard access privileges granted to authenticated roles.
            </p>
            <div className="space-y-1.5">
              <p className="font-bold text-ink-700 dark:text-ink-200">How to fix this:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs text-ink-500 dark:text-ink-300">
                <li>Go to your **Supabase Dashboard**.</li>
                <li>In the left sidebar, click on **SQL Editor**.</li>
                <li>Click **New query**.</li>
                <li>Paste the following SQL commands and click **Run**:</li>
              </ol>
            </div>
            <pre className="p-3 rounded-lg bg-ink-950 text-[#f9fafb] text-[10px] sm:text-xs overflow-x-auto font-mono">
{`GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON public.organizations TO anon, authenticated, service_role;
GRANT ALL ON public.leads TO anon, authenticated, service_role;
GRANT ALL ON public.lead_activity TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;`}
            </pre>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-[#14213d]/60 dark:text-[#beb7a7]/60">
            <div className="w-4 h-4 rounded-full border-2 border-t-[#d8a64c] border-[#14213d]/10 dark:border-white/10 animate-spin"></div>
            <span>Connecting to Supabase and checking active session...</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 font-body selection:bg-[#d8a64c] selection:text-white">
      
      {/* Search and view toggle row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#f8f7f4] dark:bg-ink-950/40 border border-[#14213d]/5 dark:border-white/5 w-full sm:w-80 shadow-inner">
          <Search size={16} className="text-[#14213d]/40 dark:text-[#beb7a7]/50" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search leads..."
            className="bg-transparent outline-none text-xs w-full text-[#14213d] dark:text-[#f9fafb] placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Vercel-style View Toggle */}
          <div className="flex bg-[#ebe8de]/50 dark:bg-ink-950 p-1 rounded-xl border border-[#14213d]/5 dark:border-white/10 text-xs font-bold uppercase tracking-wider">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer text-[10px] ${
                viewMode === "list"
                  ? "bg-white dark:bg-[#111827] text-[#14213d] dark:text-[#f9fafb] shadow-sm font-extrabold"
                  : "text-[#14213d]/50 dark:text-[#beb7a7]/50 hover:text-[#14213d] dark:hover:text-white"
              }`}
            >
              <List size={13} /> List
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer text-[10px] ${
                viewMode === "board"
                  ? "bg-white dark:bg-[#111827] text-[#14213d] dark:text-[#f9fafb] shadow-sm font-extrabold"
                  : "text-[#14213d]/50 dark:text-[#beb7a7]/50 hover:text-[#14213d] dark:hover:text-white"
              }`}
            >
              <Layers size={13} /> Board
            </button>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-[#d8a64c] text-white text-xs font-bold hover:bg-[#c19036] transition-all shadow-sm cursor-pointer border-none"
          >
            <Plus size={15} />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-[#e06656] bg-[#e06656]/10 rounded-xl px-3 py-2 border border-[#e06656]/20 font-semibold">{error}</p>
      )}

      {viewMode === "list" ? (
        <>
          {/* Status Filters */}
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-[10px] uppercase font-bold tracking-wider border transition-all cursor-pointer ${
                  statusFilter === s
                    ? "bg-[#14213d] text-white border-[#14213d] dark:bg-[#d8a64c] dark:text-[#14213d] dark:border-[#d8a64c] shadow-sm"
                    : "border-[#14213d]/10 dark:border-white/10 text-[#14213d]/50 dark:text-[#beb7a7]/60 bg-white/40 dark:bg-[#111827]/40 hover:bg-[#14213d]/5 dark:hover:bg-white/5"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Leads Table (Attio CRM Style) */}
          <div className="rounded-2xl border border-[#14213d]/5 dark:border-white/5 bg-white/70 dark:bg-[#111827]/70 overflow-hidden shadow-sm backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#14213d]/5 dark:border-white/5 text-left text-[#14213d]/50 dark:text-[#beb7a7]/50 font-display font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Company Name</th>
                    <th className="px-6 py-4 hidden md:table-cell">Contact Person</th>
                    <th className="px-6 py-4 hidden lg:table-cell">Business Category</th>
                    <th className="px-6 py-4">Outreach Status</th>
                    <th className="px-6 py-4 hidden sm:table-cell">Follow-up Target</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-[#14213d]/50 dark:text-[#beb7a7]/50 font-light">
                        <div className="flex items-center justify-center gap-2 text-xs">
                          <div className="w-4 h-4 rounded-full border-2 border-t-[#d8a64c] border-[#14213d]/10 dark:border-white/10 animate-spin"></div>
                          <span>Querying active accounts directory...</span>
                        </div>
                      </td>
                    </tr>
                  )}
                  
                  {!loading && filtered.map((lead) => {
                    // Extract B2B company name initials
                    const initials = lead.business_name 
                      ? lead.business_name.split(" ").slice(0, 2).map((word) => word[0]).join("").toUpperCase()
                      : "LD";
                    return (
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key={lead.id}
                        className="border-b border-[#14213d]/5 dark:border-white/5 last:border-0 hover:bg-[#14213d]/5 dark:hover:bg-white/5 transition-colors group"
                      >
                        <td className="px-6 py-4.5 flex items-center gap-3">
                          <div className="w-8.5 h-8.5 rounded-lg bg-[#d8a64c]/10 text-[#d8a64c] flex items-center justify-center font-display font-bold text-xs shrink-0 shadow-inner">
                            {initials}
                          </div>
                          <div>
                            <Link
                              to={`/leads/${lead.id}`}
                              className="font-bold text-[#14213d] dark:text-[#f9fafb] hover:text-[#d8a64c] dark:hover:text-[#d8a64c] transition-colors hover:underline"
                            >
                              {lead.business_name}
                            </Link>
                            <p className="text-[10px] text-[#14213d]/45 dark:text-[#beb7a7]/50 font-mono mt-0.5">{lead.email}</p>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4.5 hidden md:table-cell text-[#14213d] dark:text-[#f9fafb] font-medium">
                          {lead.contact_person || "—"}
                        </td>
                        
                        <td className="px-6 py-4.5 hidden lg:table-cell text-[#14213d]/60 dark:text-[#beb7a7]/65">
                          {lead.business_type || "—"}
                        </td>
                        
                        <td className="px-6 py-4.5">
                          <StatusPill status={lead.status} />
                        </td>
                        
                        <td className="px-6 py-4.5 hidden sm:table-cell font-mono text-[10px] text-[#14213d]/50 dark:text-[#beb7a7]/50 font-bold">
                          {lead.next_follow_up_date || "—"}
                        </td>
                        
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-3 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => openEditModal(lead)} 
                              className="text-[#14213d]/40 dark:text-[#beb7a7]/40 hover:text-[#d8a64c] dark:hover:text-white cursor-pointer border-none bg-transparent p-1"
                              title="Edit Lead"
                            >
                              <Pencil size={14} />
                            </button>
                            <button 
                              onClick={() => handleDelete(lead)} 
                              className="text-[#14213d]/40 dark:text-[#beb7a7]/40 hover:text-[#e06656] cursor-pointer border-none bg-transparent p-1"
                              title="Delete Lead"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                  
                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-[#14213d]/50 dark:text-[#beb7a7]/50 font-light">
                        No leads registered in this view. Click "Add Lead" to insert a contact.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <KanbanBoard
          leads={filtered}
          onStatusChange={handleStatusChange}
          onAddLeadClick={openAddModal}
        />
      )}

      {modalOpen && (
        <LeadFormModal
          initialLead={editingLead}
          onSubmit={handleCreateOrUpdate}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
