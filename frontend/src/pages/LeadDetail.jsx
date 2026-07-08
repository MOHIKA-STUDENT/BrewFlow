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
  ChevronRight,
  TrendingUp,
  Briefcase,
  User,
  Activity,
  FileCode,
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { getLead, updateLead, softDeleteLead, getLeadActivity, logActivity } from "../lib/leadsApi";
import StatusPill from "../components/StatusPill";

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
        return <Plus size={14} className="text-moss-500" />;
      case "status_changed":
        return <RefreshCw size={14} className="text-gold-500" />;
      case "note_added":
        return <FileText size={14} className="text-ink-500 dark:text-ink-300" />;
      case "call_logged":
        return <Phone size={14} className="text-sky-500" />;
      case "sample_sent":
        return <Package size={14} className="text-purple-500" />;
      case "deleted":
        return <Trash2 size={14} className="text-coral-500" />;
      default:
        return <Activity size={14} className="text-ink-500" />;
    }
  };

  const getActivityLabel = (act) => {
    switch (act.event_type) {
      case "created":
        return `Lead created as "${act.new_value || ""}"`;
      case "status_changed":
        return (
          <span>
            Status updated: <span className="font-mono text-xs font-semibold px-1 py-0.5 rounded bg-ink-100 dark:bg-ink-800 text-ink-900 dark:text-paper-100">{act.old_value}</span>
            {" → "}
            <span className="font-mono text-xs font-semibold px-1 py-0.5 rounded bg-gold-500/10 text-gold-600 dark:text-gold-400">{act.new_value}</span>
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
    return <p className="text-sm text-ink-500 dark:text-ink-300">Loading lead details…</p>;
  }

  if (error && !lead) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-coral-500 bg-coral-100 dark:bg-coral-500/15 rounded-lg px-3 py-2">{error}</p>
        <Link to="/leads" className="inline-flex items-center gap-2 text-sm text-gold-600 dark:text-gold-400 font-medium">
          <ArrowLeft size={16} /> Back to Leads
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-ink-100 dark:border-ink-800 pb-5">
        <div className="space-y-1.5">
          <Link to="/leads" className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-500 dark:text-ink-300 hover:text-ink-900 dark:hover:text-paper-100 transition-colors">
            <ArrowLeft size={12} /> Back to Leads
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-display font-bold text-2xl text-ink-900 dark:text-paper-50 leading-tight">
              {lead.business_name}
            </h1>
            <StatusPill status={lead.status} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick status select */}
          <div className="flex items-center gap-1.5 bg-paper-50 dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-lg px-2.5 py-1.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-ink-500">Pipeline Status</span>
            <select
              value={lead.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold outline-none text-ink-900 dark:text-paper-100 cursor-pointer pr-1"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ink-100 dark:border-ink-800 hover:bg-ink-100/60 dark:hover:bg-ink-800/60 transition-colors text-xs font-medium"
          >
            {isEditing ? (
              <>
                <ArrowLeft size={14} /> Cancel
              </>
            ) : (
              <>
                <Pencil size={14} /> Edit profile
              </>
            )}
          </button>

          <button
            onClick={handleDelete}
            className="p-2 rounded-lg border border-ink-100 dark:border-ink-800 hover:border-coral-500/50 hover:bg-coral-500/10 text-ink-500 hover:text-coral-500 transition-colors"
            title="Delete Lead"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-coral-500 bg-coral-100 dark:bg-coral-500/15 rounded-lg px-3 py-2">{error}</p>
      )}

      {/* 2. Main Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column - Details Form or Card */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Group 1: Company Profile */}
            <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 p-5 space-y-4">
              <h2 className="font-display font-semibold text-sm text-ink-900 dark:text-paper-100 flex items-center gap-1.5 border-b border-ink-100 dark:border-ink-800 pb-2">
                <Briefcase size={15} className="text-gold-500" /> Company Profile
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  placeholder="e.g. Specialty Cafe, Bakery, Hotel"
                />
                <DetailField
                  label="Current Supplier"
                  name="current_supplier"
                  value={form.current_supplier}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  placeholder="e.g. Sysco, Local Roaster Co."
                />
                <DetailField
                  label="Interested Products"
                  name="interested_products"
                  value={form.interested_products}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  placeholder="e.g. Oat Milk, Coffee Beans"
                />
              </div>
            </div>

            {/* Group 2: Contact Info */}
            <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 p-5 space-y-4">
              <h2 className="font-display font-semibold text-sm text-ink-900 dark:text-paper-100 flex items-center gap-1.5 border-b border-ink-100 dark:border-ink-800 pb-2">
                <User size={15} className="text-gold-500" /> Contact & Links
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <a href={val.startsWith("http") ? val : `https://${val}`} target="_blank" rel="noreferrer" className="text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1 mt-1 text-sm font-medium">
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
                      <a href={`https://instagram.com/${val.replace("@", "")}`} target="_blank" rel="noreferrer" className="text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1 mt-1 text-sm font-medium">
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
                        <a href={val} target="_blank" rel="noreferrer" className="text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1 mt-1 text-sm font-medium truncate max-w-md">
                          <MapPin size={13} /> View on Google Maps
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
            <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 p-5 space-y-4">
              <h2 className="font-display font-semibold text-sm text-ink-900 dark:text-paper-100 flex items-center gap-1.5 border-b border-ink-100 dark:border-ink-800 pb-2">
                <TrendingUp size={15} className="text-gold-500" /> Sales Metrics & Schedules
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailField
                  label="Est. Monthly Consumption"
                  name="estimated_monthly_consumption"
                  value={form.estimated_monthly_consumption}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  placeholder="e.g. 50kg, 12 cases"
                />
                <DetailField
                  label="Potential Monthly Revenue ($)"
                  name="potential_monthly_revenue"
                  type="number"
                  value={form.potential_monthly_revenue}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  placeholder="e.g. 1500"
                  renderView={(val) => (
                    <span className="font-mono text-sm font-semibold">
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
                  placeholder="e.g. Cold Call, Instagram, Referral"
                />
                <DetailField
                  label="First Contact Date"
                  name="first_contact_date"
                  type="date"
                  value={form.first_contact_date}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  renderView={(val) => (
                    <span className="font-mono text-xs flex items-center gap-1 mt-1 text-ink-600 dark:text-ink-300">
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
                    <span className="font-mono text-xs flex items-center gap-1 mt-1 text-ink-600 dark:text-ink-300">
                      <Calendar size={13} /> {val || "—"}
                    </span>
                  )}
                />
              </div>
            </div>

            {/* Group 4: Notes */}
            <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 p-5 space-y-4">
              <h2 className="font-display font-semibold text-sm text-ink-900 dark:text-paper-100 flex items-center gap-1.5 border-b border-ink-100 dark:border-ink-800 pb-2">
                <FileCode size={15} className="text-gold-500" /> Additional Notes
              </h2>

              <div className="space-y-4">
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
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setForm(lead);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium border border-ink-100 dark:border-ink-800 hover:bg-ink-100/60 dark:hover:bg-ink-800/60 text-ink-500"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-ink-950 text-sm font-semibold shadow disabled:opacity-60"
                >
                  <Save size={16} /> {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Right Column - Action Sandbox & Activity Timeline */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick Action Box */}
          <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 p-5 space-y-4">
            <h3 className="font-display font-semibold text-sm text-ink-900 dark:text-paper-100 flex items-center gap-1.5 pb-2 border-b border-ink-100 dark:border-ink-800">
              <Layers size={15} className="text-gold-500" /> Log Interactions
            </h3>

            {/* Quick Action Tabs */}
            <div className="flex bg-paper-100 dark:bg-ink-950 p-1 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("note")}
                className={`flex-1 py-1.5 rounded-md transition-colors flex justify-center items-center gap-1 ${
                  activeTab === "note"
                    ? "bg-paper-50 dark:bg-ink-900 text-ink-900 dark:text-paper-50 shadow-sm"
                    : "text-ink-500 hover:text-ink-900 dark:hover:text-paper-100"
                }`}
              >
                <FileText size={12} /> Note
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("call")}
                className={`flex-1 py-1.5 rounded-md transition-colors flex justify-center items-center gap-1 ${
                  activeTab === "call"
                    ? "bg-paper-50 dark:bg-ink-900 text-ink-900 dark:text-paper-50 shadow-sm"
                    : "text-ink-500 hover:text-ink-900 dark:hover:text-paper-100"
                }`}
              >
                <Phone size={12} /> Call log
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("sample")}
                className={`flex-1 py-1.5 rounded-md transition-colors flex justify-center items-center gap-1 ${
                  activeTab === "sample"
                    ? "bg-paper-50 dark:bg-ink-900 text-ink-900 dark:text-paper-50 shadow-sm"
                    : "text-ink-500 hover:text-ink-900 dark:hover:text-paper-100"
                }`}
              >
                <Package size={12} /> Sample sent
              </button>
            </div>

            <form onSubmit={handleLogQuickAction} className="space-y-3">
              <textarea
                value={quickNotes}
                onChange={(e) => setQuickNotes(e.target.value)}
                placeholder={
                  activeTab === "note"
                    ? "Add a general internal note (e.g. met owner at coffee show)..."
                    : activeTab === "call"
                    ? "Summary of call outcome (e.g. called founder, sent pricing deck, likes current supplier)..."
                    : "Details of sample sent (e.g. dispatched 1 bag medium roast + 2L oat milk)..."
                }
                rows={3}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-ink-100 dark:border-ink-800 bg-paper-100 dark:bg-ink-950 text-xs sm:text-sm outline-none focus:border-gold-500 text-ink-900 dark:text-paper-100 placeholder:text-ink-300"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={logging || !quickNotes.trim()}
                  className="px-4 py-2 rounded-lg bg-gold-500 text-ink-950 text-xs font-semibold hover:bg-gold-400 transition-colors disabled:opacity-60 shadow"
                >
                  {logging ? "Logging…" : activeTab === "note" ? "Save Note" : activeTab === "call" ? "Log Call" : "Log Sample"}
                </button>
              </div>
            </form>
          </div>

          {/* Activity Timeline */}
          <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 p-5 space-y-4">
            <h3 className="font-display font-semibold text-sm text-ink-900 dark:text-paper-100 flex items-center gap-1.5 pb-2 border-b border-ink-100 dark:border-ink-800">
              <Activity size={15} className="text-gold-500" /> Timeline & Events
            </h3>

            {activity.length === 0 ? (
              <p className="text-xs text-ink-500 dark:text-ink-300 py-6 text-center">No timeline activity logged.</p>
            ) : (
              <div className="relative pl-6 border-l border-ink-100 dark:border-ink-800 space-y-6">
                {activity.map((act) => (
                  <div key={act.id} className="relative space-y-1">
                    
                    {/* Circle icon marker on the timeline line */}
                    <span className="absolute -left-[33px] top-0.5 w-6.5 h-6.5 rounded-full border border-ink-100 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 flex items-center justify-center">
                      {getActivityIcon(act.event_type)}
                    </span>
                    
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-ink-900 dark:text-paper-50">
                        {getActivityLabel(act)}
                      </p>
                      <span className="text-[9px] font-mono text-ink-500 dark:text-ink-300 whitespace-nowrap">
                        {new Date(act.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                      </span>
                    </div>

                    {/* Show comments or values logged */}
                    {act.new_value && act.event_type !== "created" && act.event_type !== "status_changed" && (
                      <p className="text-xs text-ink-600 dark:text-ink-300 p-2.5 rounded bg-paper-100 dark:bg-ink-950 border border-ink-100/60 dark:border-ink-800/60 font-body leading-relaxed whitespace-pre-wrap">
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
      <label className="text-[11px] font-semibold text-ink-500 dark:text-ink-300 uppercase tracking-wide block">
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
            className="w-full px-3 py-2 rounded-lg border border-ink-100 dark:border-ink-800 bg-paper-100 dark:bg-ink-950 text-sm outline-none focus:border-gold-500 text-ink-900 dark:text-paper-100"
          />
        ) : (
          <input
            type={type}
            value={displayValue}
            onChange={(e) => onChange(name, e.target.value)}
            placeholder={placeholder}
            required={required}
            className="w-full px-3 py-2 rounded-lg border border-ink-100 dark:border-ink-800 bg-paper-100 dark:bg-ink-950 text-sm outline-none focus:border-gold-500 text-ink-900 dark:text-paper-100"
          />
        )
      ) : (
        <div className="text-sm font-medium text-ink-900 dark:text-paper-100 py-1">
          {renderView ? (
            renderView(displayValue)
          ) : isTextArea ? (
            <p className="whitespace-pre-wrap text-sm text-ink-700 dark:text-ink-200 leading-relaxed font-body bg-paper-100/50 dark:bg-ink-950/50 p-3 rounded-lg border border-ink-100/40 dark:border-ink-800/40">
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
