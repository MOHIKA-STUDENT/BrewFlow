import { useState } from "react";
import { X } from "lucide-react";

const STATUS_OPTIONS = ["New Lead", "Contacted", "Interested", "Sample Sent", "Negotiation", "Customer", "Lost"];

export default function LeadFormModal({ initialLead, onSubmit, onClose }) {
  const [form, setForm] = useState({
    business_name: initialLead?.business_name || "",
    business_type: initialLead?.business_type || "",
    status: initialLead?.status || "New Lead",
    contact_person: initialLead?.contact_person || "",
    job_title: initialLead?.job_title || "",
    phone: initialLead?.phone || "",
    email: initialLead?.email || "",
    website: initialLead?.website || "",
    instagram: initialLead?.instagram || "",
    google_maps_link: initialLead?.google_maps_link || "",
    city: initialLead?.city || "",
    address: initialLead?.address || "",
    lead_source: initialLead?.lead_source || "",
    assigned_salesperson: initialLead?.assigned_salesperson || "",
  });
  const [saving, setSaving] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="font-display font-bold text-xl text-ink-900 dark:text-paper-50 tracking-tight">
              {initialLead ? "Edit lead details" : "Add a new lead"}
            </h2>
            <p className="text-xs text-ink-500 dark:text-ink-300">
              Capture the essentials. You can always edit the rest later.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-ink-500 hover:text-ink-900 dark:hover:text-paper-100 hover:bg-ink-100/60 dark:hover:bg-ink-800/60 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Business Name (Full Width) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-900 dark:text-paper-200 block">
              Business Name <span className="text-gold-600 dark:text-gold-400">*</span>
            </label>
            <input
              type="text"
              value={form.business_name}
              onChange={(e) => set("business_name", e.target.value)}
              required
              placeholder="e.g. Blue Bottle Coffee"
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink-100 dark:border-ink-800 bg-[#f8f7f4] dark:bg-ink-950/40 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-ink-900 dark:text-paper-100 transition-all placeholder:text-ink-300"
            />
          </div>

          {/* Business Type & Status */}
          <Row>
            <Field label="Business Type" value={form.business_type} onChange={(v) => set("business_type", v)} placeholder="Café, Restaurant..." />
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink-900 dark:text-paper-200 block">Status</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-ink-100 dark:border-ink-800 bg-[#f8f7f4] dark:bg-ink-950/40 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-ink-900 dark:text-paper-100 transition-all cursor-pointer"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </Row>

          {/* Contact Person & Job Title */}
          <Row>
            <Field label="Contact Person" value={form.contact_person} onChange={(v) => set("contact_person", v)} placeholder="Full name" />
            <Field label="Job Title" value={form.job_title} onChange={(v) => set("job_title", v)} placeholder="Purchasing Manager..." />
          </Row>

          {/* Phone & Email */}
          <Row>
            <Field label="Phone" value={form.phone} onChange={(v) => set("phone", v)} placeholder="+1 (555) 000-0000" />
            <Field label="Email" type="email" value={form.email} onChange={(v) => set("email", v)} placeholder="contact@business.com" />
          </Row>

          {/* Website & Instagram */}
          <Row>
            <Field label="Website" value={form.website} onChange={(v) => set("website", v)} placeholder="www.business.com" />
            <Field label="Instagram" value={form.instagram} onChange={(v) => set("instagram", v)} placeholder="@username" />
          </Row>

          {/* Google Maps Link & City */}
          <Row>
            <Field label="Google Maps Link" value={form.google_maps_link} onChange={(v) => set("google_maps_link", v)} placeholder="https://maps.google.com/..." />
            <Field label="City" value={form.city} onChange={(v) => set("city", v)} placeholder="e.g. San Francisco" />
          </Row>

          {/* Address (Full Width) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-900 dark:text-paper-200 block">Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="123 Street Name, Suite 100"
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink-100 dark:border-ink-800 bg-[#f8f7f4] dark:bg-ink-950/40 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-ink-900 dark:text-paper-100 transition-all placeholder:text-ink-300"
            />
          </div>

          {/* Lead Source & Assigned Salesperson */}
          <Row>
            <Field label="Lead Source" value={form.lead_source} onChange={(v) => set("lead_source", v)} placeholder="Instagram, cold call, referral..." />
            <Field label="Assigned Salesperson" value={form.assigned_salesperson} onChange={(v) => set("assigned_salesperson", v)} placeholder="Name of representative" />
          </Row>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-ink-100 dark:border-ink-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-ink-500 dark:text-ink-300 hover:bg-ink-100/60 dark:hover:bg-ink-800/60 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gold-500 text-ink-950 text-sm font-bold hover:bg-gold-400 disabled:opacity-60 transition-all cursor-pointer shadow-sm"
            >
              {saving ? "Saving…" : "Save Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Row({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

function Field({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-ink-900 dark:text-paper-200 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-xl border border-ink-100 dark:border-ink-800 bg-[#f8f7f4] dark:bg-ink-950/40 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-ink-900 dark:text-paper-100 transition-all placeholder:text-ink-300"
      />
    </div>
  );
}
