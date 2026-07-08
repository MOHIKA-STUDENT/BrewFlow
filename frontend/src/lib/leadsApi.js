import { supabase } from "./supabaseClient";

// WHY THIS FILE EXISTS:
// Same reason mockData.js existed in Sprint 1 — one place that knows how
// to fetch/create/update leads, so pages call getLeads()/createLead()
// instead of writing raw Supabase queries everywhere. If we ever change
// how a lead is stored, we change it here once.
//
// Note what's NOT here: an organization_id filter on read. We don't need
// one — Row Level Security on the `leads` table already guarantees
// Supabase only ever returns rows belonging to the caller's own
// organization. This file trusts the database to enforce that, which is
// exactly the point of doing security at that layer.

export async function getLeads() {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

const LEADS_COLUMNS = [
  "organization_id", "business_name", "business_type", "contact_person",
  "job_title", "phone", "email", "website", "instagram", "google_maps_link",
  "address", "city", "lead_source", "status", "current_supplier",
  "interested_products", "estimated_monthly_consumption", "potential_monthly_revenue",
  "first_contact_date", "next_follow_up_date", "general_notes", "internal_notes",
  "is_deleted"
];

function sanitizeFields(fields) {
  const sanitized = {};
  for (const key of LEADS_COLUMNS) {
    if (fields[key] !== undefined) {
      sanitized[key] = fields[key] === "" ? null : fields[key];
    }
  }
  return sanitized;
}

export async function createLead(organizationId, userId, fields) {
  const sanitized = sanitizeFields(fields);
  const { data, error } = await supabase
    .from("leads")
    .insert({ ...sanitized, organization_id: organizationId })
    .select()
    .single();
  if (error) throw error;

  await logActivity({
    leadId: data.id,
    organizationId,
    userId,
    eventType: "created",
    newValue: fields.business_name,
  });

  return data;
}

export async function updateLead(leadId, organizationId, userId, updates, previousLead) {
  const sanitized = sanitizeFields(updates);
  const { data, error } = await supabase
    .from("leads")
    .update({ ...sanitized, updated_at: new Date().toISOString() })
    .eq("id", leadId)
    .select()
    .single();
  if (error) throw error;

  // Log a status change specifically, since that's the event that
  // matters most for the activity timeline on the lead detail view.
  if (updates.status && previousLead && updates.status !== previousLead.status) {
    await logActivity({
      leadId,
      organizationId,
      userId,
      eventType: "status_changed",
      oldValue: previousLead.status,
      newValue: updates.status,
    });
  }

  return data;
}

export async function softDeleteLead(leadId, organizationId, userId) {
  const { error } = await supabase.from("leads").update({ is_deleted: true }).eq("id", leadId);
  if (error) throw error;

  await logActivity({
    leadId,
    organizationId,
    userId,
    eventType: "deleted",
  });
}

export async function getLead(leadId) {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .single();
  if (error) throw error;
  return data;
}

export async function getLeadActivity(leadId) {
  const { data, error } = await supabase
    .from("lead_activity")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function logActivity({ leadId, organizationId, userId, eventType, oldValue, newValue }) {
  const { error } = await supabase.from("lead_activity").insert({
    lead_id: leadId,
    organization_id: organizationId,
    user_id: userId,
    event_type: eventType,
    old_value: oldValue ?? null,
    new_value: newValue ?? null,
  });
  // Activity logging failing shouldn't block the actual lead operation —
  // log it to the console for now rather than throwing.
  if (error) console.error("Failed to log activity:", error);
}
