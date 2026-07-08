import { useState, useMemo, useEffect, useCallback } from "react";
import { Plus, Search, Trash2, Pencil, List, Layers } from "lucide-react";
import { Link } from "react-router-dom";
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
      <div className="max-w-2xl mx-auto mt-10 p-6 rounded-xl border border-ink-100 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 space-y-4">
        <h2 className="font-display font-semibold text-lg text-ink-900 dark:text-paper-100">
          Setting up your workspace…
        </h2>
        <p className="text-sm text-ink-500 dark:text-ink-300">
          We are checking for your organization details or creating your workspace. This usually takes just a few seconds.
        </p>
        
        {authError ? (
          <div className="p-4 rounded-lg bg-coral-100 dark:bg-coral-500/15 border border-coral-500/20 text-xs sm:text-sm space-y-3">
            <p className="font-semibold text-coral-500">Database Diagnostic Alert:</p>
            <p className="text-ink-600 dark:text-ink-300 font-mono leading-relaxed bg-paper-100/50 dark:bg-ink-950/50 p-2.5 rounded">
              {authError}
            </p>
            <p className="text-ink-500 dark:text-ink-300">
              This error indicates that the Postgres database tables do not have standard access privileges granted to authenticated roles.
            </p>
            <div className="space-y-1.5">
              <p className="font-semibold text-ink-700 dark:text-ink-200">How to fix this:</p>
              <ol className="list-decimal list-inside space-y-1 text-ink-500 dark:text-ink-300">
                <li>Go to your **Supabase Dashboard**.</li>
                <li>In the left sidebar, click on **SQL Editor**.</li>
                <li>Click **New query**.</li>
                <li>Paste the following SQL commands and click **Run**:</li>
              </ol>
            </div>
            <pre className="p-3 rounded-lg bg-ink-950 text-paper-100 text-[10px] sm:text-xs overflow-x-auto font-mono">
{`GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON public.organizations TO anon, authenticated, service_role;
GRANT ALL ON public.leads TO anon, authenticated, service_role;
GRANT ALL ON public.lead_activity TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;`}
            </pre>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-ink-500 dark:text-ink-300">
            <div className="w-4 h-4 rounded-full border-2 border-t-gold-500 border-ink-100 dark:border-ink-800 animate-spin"></div>
            <span>Connecting to Supabase and checking active session...</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-paper-50 dark:bg-ink-900 border border-ink-100 dark:border-ink-800 w-full sm:w-80">
          <Search size={16} className="text-ink-500 dark:text-ink-300" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search business or contact…"
            className="bg-transparent outline-none text-sm w-full text-ink-900 dark:text-paper-100 placeholder:text-ink-300"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-paper-200 dark:bg-ink-950 p-1 rounded-lg border border-ink-100 dark:border-ink-800 text-xs font-semibold">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "bg-paper-50 dark:bg-ink-900 text-ink-900 dark:text-paper-100 shadow-sm"
                  : "text-ink-500 hover:text-ink-900 dark:hover:text-paper-100"
              }`}
            >
              <List size={14} /> List
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === "board"
                  ? "bg-paper-50 dark:bg-ink-900 text-ink-900 dark:text-paper-100 shadow-sm"
                  : "text-ink-500 hover:text-ink-900 dark:hover:text-paper-100"
              }`}
            >
              <Layers size={14} /> Board
            </button>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gold-500 text-ink-950 text-sm font-semibold hover:bg-gold-400 transition-colors shadow cursor-pointer"
          >
            <Plus size={16} />
            Add Lead
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-coral-500 bg-coral-100 dark:bg-coral-500/15 rounded-lg px-3 py-2">{error}</p>
      )}

      {viewMode === "list" ? (
        <>
          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                  statusFilter === s
                    ? "bg-ink-900 text-paper-50 border-ink-900 dark:bg-gold-500 dark:text-ink-950 dark:border-gold-500"
                    : "border-ink-100 dark:border-ink-800 text-ink-500 dark:text-ink-300 hover:bg-ink-100/60 dark:hover:bg-ink-800/60"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Leads Table */}
          <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 dark:border-ink-800 text-left text-ink-500 dark:text-ink-300">
                  <th className="px-5 py-3 font-medium">Business</th>
                  <th className="px-5 py-3 font-medium hidden md:table-cell">Contact</th>
                  <th className="px-5 py-3 font-medium hidden lg:table-cell">Type</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium hidden sm:table-cell">Next Follow-up</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-ink-500 dark:text-ink-300 text-sm">Loading leads…</td></tr>
                )}
                {!loading && filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-ink-100 dark:border-ink-800 last:border-0 hover:bg-ink-100/40 dark:hover:bg-ink-800/40 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <Link
                        to={`/leads/${lead.id}`}
                        className="font-medium text-ink-900 dark:text-paper-100 hover:text-gold-500 dark:hover:text-gold-400 hover:underline transition-colors"
                      >
                        {lead.business_name}
                      </Link>
                      <p className="text-xs text-ink-500 dark:text-ink-300">{lead.email}</p>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell text-ink-900 dark:text-paper-100">
                      {lead.contact_person}
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell text-ink-500 dark:text-ink-300">
                      {lead.business_type}
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill status={lead.status} />
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell font-mono text-xs text-ink-500 dark:text-ink-300">
                      {lead.next_follow_up_date || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEditModal(lead)} className="text-ink-500 dark:text-ink-300 hover:text-ink-900 dark:hover:text-paper-100 cursor-pointer">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(lead)} className="text-ink-500 dark:text-ink-300 hover:text-coral-500 cursor-pointer">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-ink-500 dark:text-ink-300 text-sm">
                      No leads yet — click "Add Lead" to create your first one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
