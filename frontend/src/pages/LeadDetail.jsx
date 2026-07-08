import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Save,
  Trash2,
  Phone,
  Package,
  FileText,
  Plus,
  RefreshCw,
  Globe,
  MapPin,
  Calendar,
  Layers,
  TrendingUp,
  Briefcase,
  User,
  Activity,
  FileCode,
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { getLead, updateLead, softDeleteLead, getLeadActivity, logActivity } from "../lib/leadsApi";
import StatusPill from "../components/StatusPill";
import CustomSelect from "../components/CustomSelect";

const STATUS_OPTIONS = ["New Lead", "Contacted", "Interested", "Sample Sent", "Negotiation", "Customer", "Lost"];

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, organization } = useAuth();

  const [lead, setLead] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  // Quick Action state
  const [activeTab, setActiveTab] = useState("note"); // note, call, sample
  const [quickNotes, setQuickNotes] = useState("");
  const [logging, setLogging] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const leadData = await getLead(id);
      setLead(leadData);
      setForm(leadData);
      const activityData = await getLeadActivity(id);
      setActivity(activityData);
    } catch (err) {
      console.error(err);
      setError("Failed to load lead details. The record may not exist or you lack permission.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFieldChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateLead(id, organization.id, user.id, form, lead);
      setIsEditing(false);
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === lead.status) return;
    try {
      await updateLead(id, organization.id, user.id, { status: newStatus }, lead);
      await fetchData();
    } catch (err) {
      setError("Failed to update status: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${lead?.business_name}? This is a soft-delete and can be recovered later.`)) return;
    try {
      await softDeleteLead(id, organization.id, user.id);
      navigate("/leads");
    } catch (err) {
      setError("Failed to delete lead: " + err.message);
    }
  };

  const handleLogQuickAction = async (e) => {
    e.preventDefault();
    if (!quickNotes.trim()) return;
    setLogging(true);
    
    let eventType = "note_added";
    if (activeTab === "call") {
      eventType = "call_logged";
    } else if (activeTab === "sample") {
      eventType = "sample_sent";
    }

    try {
      await logActivity({
        leadId: id,
        organizationId: organization.id,
        userId: user.id,
        eventType,
        newValue: quickNotes.trim(),
      });
      
      // If we log "sample_sent" as a quick action, we also update status to "Sample Sent" in db if appropriate
      if (activeTab === "sample" && lead.status !== "Sample Sent") {
        await updateLead(id, organization.id, user.id, { status: "Sample Sent" }, lead);
      }

      setQuickNotes("");
      await fetchData();
    } catch (err) {
      setError("Failed to log activity: " + err.message);
    } finally {
      setLogging(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "created":
        return <Plus size={13} className="text-[#5b7553]" />;
      case "status_changed":
        return <RefreshCw size={12} className="text-[#d8a64c]" />;
      case "note_added":
        return <FileText size={12} className="text-slate-500" />;
      case "call_logged":
        return <Phone size={12} className="text-blue-500" />;
      case "sample_sent":
        return <Package size={12} className="text-purple-500" />;
      case "deleted":
        return <Trash2 size={12} className="text-[#e06656]" />;
      default:
        return <Activity size={12} className="text-slate-500" />;
    }
  };

  const getActivityLabel = (act) => {
    switch (act.event_type) {
      case "created":
        return `Lead created as "${act.new_value || ""}"`;
      case "status_changed":
        return (
          <span>
            Status changed: <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 text-slate-700 dark:text-[#beb7a7]">{act.old_value}</span>
            {" → "}
            <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-[#d8a64c]/10 border border-[#d8a64c]/20 text-[#d8a64c]">{act.new_value}</span>
          </span>
        );
      case "note_added":
        return "Internal note added";
      case "call_logged":
        return "Call logged";
      case "sample_sent":
        return "Sample dispatch recorded";
      case "deleted":
        return "Lead deleted";
      default:
        return "Activity recorded";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-[#14213d]/60 dark:text-[#beb7a7]/60 p-8">
        <div className="w-4 h-4 rounded-full border-2 border-t-[#d8a64c] border-[#14213d]/10 dark:border-white/10 animate-spin"></div>
        <span>Querying lead details profile...</span>
      </div>
    );
  }

  if (error && !lead) {
    return (
      <div className="space-y-4">
        <p className="text-xs text-[#e06656] bg-[#e06656]/10 rounded-xl px-3 py-2 border border-[#e06656]/20 font-semibold">{error}</p>
        <Link to="/leads" className="inline-flex items-center gap-1.5 text-xs text-[#d8a64c] font-bold uppercase tracking-wider">
          <ArrowLeft size={14} /> Back to Leads
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-body selection:bg-[#d8a64c] selection:text-white">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#14213d]/5 dark:border-white/5 pb-5">
        <div className="space-y-1.5">
          <Link to="/leads" className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-[#14213d]/50 dark:text-[#beb7a7]/50 hover:text-[#d8a64c] transition-colors">
            <ArrowLeft size={11} /> Back to Leads
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-display font-extrabold text-2xl text-[#14213d] dark:text-[#f9fafb] tracking-tight">
              {lead.business_name}
            </h1>
            <StatusPill status={lead.status} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick status select */}
          <div className="flex items-center gap-1.5 bg-[#f8f7f4] dark:bg-[#111827] border border-[#14213d]/5 dark:border-white/10 rounded-xl px-2.5 py-1 shadow-inner">
            <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 font-bold ml-1">Status</span>
            <CustomSelect
              value={lead.status}
              onChange={(val) => handleStatusChange(val)}
              options={STATUS_OPTIONS}
              buttonClassName="border-none bg-transparent shadow-none py-1 px-1.5 font-bold"
            />
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl border border-[#14213d]/10 dark:border-white/10 hover:bg-[#14213d]/5 dark:hover:bg-white/5 transition-all text-xs font-bold uppercase tracking-wider text-[#14213d] dark:text-white"
          >
            {isEditing ? (
              <>
                Cancel
              </>
            ) : (
              <>
                <Pencil size={13} className="text-[#d8a64c]" />
                <span>Edit profile</span>
              </>
            )}
          </button>

          <button
            onClick={handleDelete}
            className="p-2.5 rounded-xl border border-[#14213d]/10 dark:border-white/10 hover:border-[#e06656]/50 hover:bg-[#e06656]/10 text-slate-400 hover:text-[#e06656] transition-all cursor-pointer"
            title="Delete Lead"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-[#e06656] bg-[#e06656]/10 rounded-xl px-3 py-2 border border-[#e06656]/20 font-semibold">{error}</p>
      )}

      {/* 2. Main Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column - Details Form or Card */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Group 1: Company Profile */}
            <div className="rounded-2xl border border-[#14213d]/5 dark:border-white/5 bg-white/70 dark:bg-[#111827]/70 p-5 space-y-4 shadow-sm backdrop-blur-md">
              <h2 className="font-display font-bold text-xs text-[#14213d] dark:text-[#f9fafb] uppercase tracking-wider flex items-center gap-2 border-b border-[#14213d]/5 dark:border-white/5 pb-2.5">
                <Briefcase size={14} className="text-[#d8a64c]" /> Company Profile
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
                <DetailField
                  label="Business name"
                  name="business_name"
                  value={form.business_name}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  required
                />
                <DetailField
                  label="Business type"
                  name="business_type"
                  value={form.business_type}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  placeholder="e.g. Specialty Cafe, Bakery"
                />
                <DetailField
                  label="Current Supplier"
                  name="current_supplier"
                  value={form.current_supplier}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  placeholder="e.g. Sysco, Local supplier"
                />
                <DetailField
                  label="Interested Products"
                  name="interested_products"
                  value={form.interested_products}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  placeholder="e.g. Whole Milk, Coffee Beans"
                />
              </div>
            </div>

            {/* Group 2: Contact Info */}
            <div className="rounded-2xl border border-[#14213d]/5 dark:border-white/5 bg-white/70 dark:bg-[#111827]/70 p-5 space-y-4 shadow-sm backdrop-blur-md">
              <h2 className="font-display font-bold text-xs text-[#14213d] dark:text-[#f9fafb] uppercase tracking-wider flex items-center gap-2 border-b border-[#14213d]/5 dark:border-white/5 pb-2.5">
                <User size={14} className="text-[#d8a64c]" /> Contact & Links
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
                <DetailField
                  label="Contact Person"
                  name="contact_person"
                  value={form.contact_person}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                />
                <DetailField
                  label="Job Title"
                  name="job_title"
                  value={form.job_title}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                />
                <DetailField
                  label="Phone"
                  name="phone"
                  value={form.phone}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                />
                <DetailField
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                />
                <DetailField
                  label="Website"
                  name="website"
                  value={form.website}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  placeholder="e.g. www.cafe.com"
                  renderView={(val) =>
                    val ? (
                      <a href={val.startsWith("http") ? val : `https://${val}`} target="_blank" rel="noreferrer" className="text-[#d8a64c] hover:underline flex items-center gap-1 mt-1 text-xs font-bold">
                        <Globe size={13} /> {val}
                      </a>
                    ) : "—"
                  }
                />
                <DetailField
                  label="Instagram"
                  name="instagram"
                  value={form.instagram}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  placeholder="e.g. @cafehandle"
                  renderView={(val) =>
                    val ? (
                      <a href={`https://instagram.com/${val.replace("@", "")}`} target="_blank" rel="noreferrer" className="text-[#d8a64c] hover:underline flex items-center gap-1 mt-1 text-xs font-bold">
                        <Globe size={13} /> {val}
                      </a>
                    ) : "—"
                  }
                />
                <div className="sm:col-span-2">
                  <DetailField
                    label="Google Maps Link"
                    name="google_maps_link"
                    value={form.google_maps_link}
                    isEditing={isEditing}
                    onChange={handleFieldChange}
                    placeholder="e.g. https://maps.google.com/..."
                    renderView={(val) =>
                      val ? (
                        <a href={val} target="_blank" rel="noreferrer" className="text-[#d8a64c] hover:underline flex items-center gap-1 mt-1 text-xs font-bold truncate max-w-xs md:max-w-md block">
                          <MapPin size={13} className="inline mr-1" /> View on Google Maps
                        </a>
                      ) : "—"
                    }
                  />
                </div>
                <DetailField
                  label="Address"
                  name="address"
                  value={form.address}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                />
                <DetailField
                  label="City"
                  name="city"
                  value={form.city}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                />
              </div>
            </div>

            {/* Group 3: Sales Metrics */}
            <div className="rounded-2xl border border-[#14213d]/5 dark:border-white/5 bg-white/70 dark:bg-[#111827]/70 p-5 space-y-4 shadow-sm backdrop-blur-md">
              <h2 className="font-display font-bold text-xs text-[#14213d] dark:text-[#f9fafb] uppercase tracking-wider flex items-center gap-2 border-b border-[#14213d]/5 dark:border-white/5 pb-2.5">
                <TrendingUp size={14} className="text-[#d8a64c]" /> Sales Metrics & Schedules
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
                <DetailField
                  label="Est. Monthly Consumption"
                  name="estimated_monthly_consumption"
                  value={form.estimated_monthly_consumption}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  placeholder="e.g. 80kg"
                />
                <DetailField
                  label="Potential Monthly Revenue ($)"
                  name="potential_monthly_revenue"
                  type="number"
                  value={form.potential_monthly_revenue}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  placeholder="e.g. 2400"
                  renderView={(val) => (
                    <span className="font-mono text-xs font-bold text-[#14213d] dark:text-[#f9fafb]">
                      {val ? `$${Number(val).toLocaleString()}` : "—"}
                    </span>
                  )}
                />
                <DetailField
                  label="Lead Source"
                  name="lead_source"
                  value={form.lead_source}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  placeholder="e.g. Cold Outbound"
                />
                <DetailField
                  label="First Contact Date"
                  name="first_contact_date"
                  type="date"
                  value={form.first_contact_date}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  renderView={(val) => (
                    <span className="font-mono text-xs flex items-center gap-1 mt-1 text-[#14213d]/60 dark:text-[#beb7a7]/60">
                      <Calendar size={13} /> {val || "—"}
                    </span>
                  )}
                />
                <DetailField
                  label="Next Follow-up Date"
                  name="next_follow_up_date"
                  type="date"
                  value={form.next_follow_up_date}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  renderView={(val) => (
                    <span className="font-mono text-xs flex items-center gap-1 mt-1 text-[#14213d]/60 dark:text-[#beb7a7]/60">
                      <Calendar size={13} /> {val || "—"}
                    </span>
                  )}
                />
              </div>
            </div>

            {/* Group 4: Notes */}
            <div className="rounded-2xl border border-[#14213d]/5 dark:border-white/5 bg-white/70 dark:bg-[#111827]/70 p-5 space-y-4 shadow-sm backdrop-blur-md">
              <h2 className="font-display font-bold text-xs text-[#14213d] dark:text-[#f9fafb] uppercase tracking-wider flex items-center gap-2 border-b border-[#14213d]/5 dark:border-white/5 pb-2.5">
                <FileCode size={14} className="text-[#d8a64c]" /> Additional Notes
              </h2>

              <div className="space-y-4.5">
                <DetailField
                  label="General Notes"
                  name="general_notes"
                  value={form.general_notes}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  isTextArea
                />
                <DetailField
                  label="Internal Notes (Visible to team only)"
                  name="internal_notes"
                  value={form.internal_notes}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  isTextArea
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setForm(lead);
                    setIsEditing(false);
                  }}
                  className="px-4.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-[#14213d]/10 dark:border-white/10 hover:bg-[#14213d]/5 dark:hover:bg-white/5 text-slate-500"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d8a64c] hover:bg-[#c19036] text-white text-xs font-bold uppercase tracking-wider shadow disabled:opacity-60 border-none cursor-pointer"
                >
                  <Save size={15} /> <span>{saving ? "Saving…" : "Save Changes"}</span>
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Right Column - Action Sandbox & Activity Timeline */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick Action Box */}
          <div className="rounded-2xl border border-[#14213d]/5 dark:border-white/5 bg-white/70 dark:bg-[#111827]/70 p-5 space-y-4 shadow-sm backdrop-blur-md">
            <h3 className="font-display font-bold text-xs text-[#14213d] dark:text-[#f9fafb] uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-[#14213d]/5 dark:border-white/5">
              <Layers size={14} className="text-[#d8a64c]" /> Log Interactions
            </h3>

            {/* Vercel-style Quick Action Tabs */}
            <div className="flex bg-[#ebe8de]/50 dark:bg-ink-950 p-1 rounded-xl border border-[#14213d]/5 dark:border-white/5 text-xs font-bold uppercase tracking-wider">
              <button
                type="button"
                onClick={() => setActiveTab("note")}
                className={`flex-1 py-2 rounded-lg transition-all flex justify-center items-center gap-1.5 cursor-pointer text-[10px] ${
                  activeTab === "note"
                    ? "bg-white dark:bg-[#111827] text-[#14213d] dark:text-[#f9fafb] shadow-sm font-extrabold"
                    : "text-[#14213d]/50 dark:text-[#beb7a7]/50 hover:text-[#14213d] dark:hover:text-white"
                }`}
              >
                <FileText size={12} /> Note
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("call")}
                className={`flex-1 py-2 rounded-lg transition-all flex justify-center items-center gap-1.5 cursor-pointer text-[10px] ${
                  activeTab === "call"
                    ? "bg-white dark:bg-[#111827] text-[#14213d] dark:text-[#f9fafb] shadow-sm font-extrabold"
                    : "text-[#14213d]/50 dark:text-[#beb7a7]/50 hover:text-[#14213d] dark:hover:text-white"
                }`}
              >
                <Phone size={12} /> Call
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("sample")}
                className={`flex-1 py-2 rounded-lg transition-all flex justify-center items-center gap-1.5 cursor-pointer text-[10px] ${
                  activeTab === "sample"
                    ? "bg-white dark:bg-[#111827] text-[#14213d] dark:text-[#f9fafb] shadow-sm font-extrabold"
                    : "text-[#14213d]/50 dark:text-[#beb7a7]/50 hover:text-[#14213d] dark:hover:text-white"
                }`}
              >
                <Package size={12} /> Sample
              </button>
            </div>

            <form onSubmit={handleLogQuickAction} className="space-y-3.5">
              <textarea
                value={quickNotes}
                onChange={(e) => setQuickNotes(e.target.value)}
                placeholder={
                  activeTab === "note"
                    ? "Add a general internal note (e.g. met owner at coffee show)..."
                    : activeTab === "call"
                    ? "Summary of call outcome (e.g. called founder, sent pricing deck)..."
                    : "Details of sample sent (e.g. dispatched 1 bag medium roast + catalog)..."
                }
                rows={3}
                required
                className="w-full p-4 rounded-xl border border-[#14213d]/5 dark:border-white/5 bg-[#f8f7f4] dark:bg-ink-950/40 text-xs sm:text-sm outline-none focus:border-[#d8a64c] text-[#14213d] dark:text-[#f9fafb] placeholder:text-slate-400 font-sans resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={logging || !quickNotes.trim()}
                  className="px-4.5 py-2 rounded-xl bg-[#d8a64c] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#c19036] transition-all disabled:opacity-60 shadow border-none cursor-pointer"
                >
                  {logging ? "Logging…" : activeTab === "note" ? "Save Note" : activeTab === "call" ? "Log Call" : "Log Sample"}
                </button>
              </div>
            </form>
          </div>

          {/* Activity Timeline (Linear style) */}
          <div className="rounded-2xl border border-[#14213d]/5 dark:border-white/5 bg-white/70 dark:bg-[#111827]/70 p-5 space-y-4 shadow-sm backdrop-blur-md">
            <h3 className="font-display font-bold text-xs text-[#14213d] dark:text-[#f9fafb] uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-[#14213d]/5 dark:border-white/5">
              <Activity size={14} className="text-[#d8a64c]" /> Timeline & Events
            </h3>

            {activity.length === 0 ? (
              <p className="text-xs text-[#14213d]/50 dark:text-[#beb7a7]/50 py-6 text-center">No timeline activity logged.</p>
            ) : (
              <div className="relative pl-5 border-l border-[#14213d]/10 dark:border-white/10 space-y-6">
                {activity.map((act) => (
                  <div key={act.id} className="relative space-y-1.5">
                    
                    {/* Circle icon marker on the timeline line */}
                    <span className="absolute -left-[30px] top-0.5 w-6 h-6 rounded-lg border border-[#14213d]/5 dark:border-white/5 bg-white dark:bg-[#111827] flex items-center justify-center shadow-sm">
                      {getActivityIcon(act.event_type)}
                    </span>
                    
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-[#14213d] dark:text-[#f9fafb]">
                        {getActivityLabel(act)}
                      </p>
                      <span className="text-[9px] font-mono text-slate-400 font-bold whitespace-nowrap">
                        {new Date(act.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                      </span>
                    </div>

                    {/* Show comments or values logged */}
                    {act.new_value && act.event_type !== "created" && act.event_type !== "status_changed" && (
                      <p className="text-xs text-[#14213d]/70 dark:text-[#beb7a7]/80 p-3 rounded-xl bg-[#f8f7f4] dark:bg-ink-950/20 border border-[#14213d]/5 dark:border-white/5 font-body leading-relaxed whitespace-pre-wrap">
                        {act.new_value}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

// Subcomponent for cleaner form fields
function DetailField({
  label,
  name,
  value,
  isEditing,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  isTextArea = false,
  renderView,
}) {
  const displayValue = value ?? "";

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
        {label}
      </label>
      {isEditing ? (
        isTextArea ? (
          <textarea
            value={displayValue}
            onChange={(e) => onChange(name, e.target.value)}
            placeholder={placeholder}
            required={required}
            rows={4}
            className="w-full p-3.5 rounded-xl border border-[#14213d]/5 dark:border-white/5 bg-[#f8f7f4] dark:bg-ink-950/40 text-xs sm:text-sm outline-none focus:border-[#d8a64c] text-[#14213d] dark:text-[#f9fafb] font-sans resize-none"
          />
        ) : (
          <input
            type={type}
            value={displayValue}
            onChange={(e) => onChange(name, e.target.value)}
            placeholder={placeholder}
            required={required}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#14213d]/5 dark:border-white/5 bg-[#f8f7f4] dark:bg-ink-950/40 text-xs sm:text-sm outline-none focus:border-[#d8a64c] text-[#14213d] dark:text-[#f9fafb] font-sans"
          />
        )
      ) : (
        <div className="text-xs sm:text-sm font-bold text-[#14213d] dark:text-[#f9fafb] py-1">
          {renderView ? (
            renderView(displayValue)
          ) : isTextArea ? (
            <p className="whitespace-pre-wrap text-xs text-[#14213d]/70 dark:text-[#beb7a7]/80 leading-relaxed font-body bg-[#f8f7f4] dark:bg-ink-950/20 p-3.5 rounded-xl border border-[#14213d]/5 dark:border-white/5">
              {displayValue || "—"}
            </p>
          ) : (
            displayValue || "—"
          )}
        </div>
      )}
    </div>
  );
}
