import { supabase } from "./supabaseClient";
import { getLead, logActivity } from "./leadsApi";

// Config-driven registry: Add new items here to support new prompt types.
// The UI and generator will dynamically adapt without changing page files.
export const PROMPT_TYPES = [
  { id: "cold_email", label: "Cold Email", icon: "Mail", desc: "A first-touch introduction email." },
  { id: "whatsapp_followup", label: "WhatsApp Follow-up", icon: "MessageCircle", desc: "Short, casual ping outreach." },
  { id: "call_script", label: "Sales Call Script", icon: "Phone", desc: "First 30 seconds of a cold call." },
  { id: "meeting_summary", label: "Meeting Summary", icon: "FileText", desc: "Summarize recent call notes." },
  { id: "lead_summary", label: "Lead Summary", icon: "User", desc: "Quick executive opportunity summary." },
  { id: "next_best_action", label: "Next Best Action", icon: "CheckSquare", desc: "3 actions to advance this deal." }
];

function localFallbackGenerator(lead, promptType) {
  const businessName = lead.business_name || "your business";
  const contactPerson = lead.contact_person || "Purchasing Manager";
  const city = lead.city || "your area";
  const products = lead.interested_products || "our wholesale products";
  const supplier = lead.current_supplier || "your current supplier";

  switch (promptType) {
    case "cold_email":
      return `Subject: Partnership Proposal: Premium wholesale supplies for ${businessName}

Hi ${contactPerson},

I hope you are doing well.

I recently came across ${businessName} in ${city} and noticed your excellent B2B footprint. Since you are sourcing physical goods for your category, I wanted to reach out regarding our premium catalog.

Compared to standard distributors, we offer certified quality grades, faster logistics cycles, and competitive bulk pricing on items like ${products}. Many businesses transition to our model to improve product consistency and drive down operational margins.

Would you be open to a brief call next Tuesday to discuss sending a free sample package to your team?

Best regards,

[Sales Rep Name]
BrewFlow Partner Team`;

    case "whatsapp_followup":
      return `Hi ${contactPerson}! 👋 This is the partner team reaching out. We wanted to see if you had a brief moment to check out our premium wholesale price list for ${products}. Hope you are having a productive week at ${businessName}! Let me know if we can ship a free sample box to your location in ${city}.`;

    case "call_script":
      return `[SALES REP COLD CALL OPENER]

Rep: "Hi ${contactPerson}, this is [Your Name] from BrewFlow wholesale. How are you doing today?"
(Wait for greeting)

Rep: "Great! I notice you manage procurement at ${businessName} in ${city}. I wanted to reach out briefly because we supply high-grade B2B products (like ${products}) to physical brands in your area. 

I know you are currently working with ${supplier}, but we've been helping similar businesses reduce supply margins by 15% while improving delivery reliability. 

If I promise to keep it under 30 seconds, would it be alright to email over our latest catalog, or can I ship a free sample box to your office?"`;

    case "meeting_summary":
      return `MEETING SUMMARY - ${businessName}
Date: ${new Date().toLocaleDateString()}

Key Discussion Points:
- Reviewed current supply catalog and verified interest in ${products}.
- Identified margin pain points with their active supplier (${supplier}).
- Noted follow-up requirements for regional delivery options in ${city}.

Action Items:
1. Ship sample catalog to ${contactPerson}.
2. Confirm volume pricing tier for ${products}.
3. Scheduled next follow-up.`;

    case "lead_summary":
      return `LEAD BRIEFING: ${businessName}
This is a ${lead.business_type || "B2B client"} lead located in ${city}. The primary contact is ${contactPerson} (${lead.job_title || "Procurement Manager"}). 
Opportunities: High interest in ${products}. Estimated monthly revenue value is ${lead.potential_monthly_revenue ? `$${Number(lead.potential_monthly_revenue).toLocaleString()}` : "to be determined"}. They currently source from ${supplier}. Recent notes specify: "${lead.general_notes || "No general notes logged."}"`;

    case "next_best_action":
      return `RECOMMENDED ACTIONS FOR ${businessName}:
1. Outbound Follow-up: Dispatch a WhatsApp ping to ${contactPerson} regarding sample confirmation.
2. Competitive Analysis: Draft custom wholesale quote comparing pricing against ${supplier}.
3. Sales Call: Schedule follow-up discussion to address logistics and lead times.`;

    default:
      return `Sales outreach copy draft for ${businessName}. Contact person is ${contactPerson}.`;
  }
}

export const AIService = {
  /**
   * Securely invokes Supabase Edge Function to generate sales copy using server-side Gemini.
   * Gracefully falls back to local rule-based text generation if the function is not deployed or fails.
   */
  async generateSalesCopy({ leadId, promptType, organizationId, userId }) {
    try {
      console.log(`[AIService] Invoking generate-sales-copy Edge Function...`);
      const { data, error } = await supabase.functions.invoke("generate-sales-copy", {
        body: { leadId, promptType, organizationId, userId }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      console.log(`[AIService] Edge Function returned success:`, data);
      return {
        text: data.text,
        provider: data.provider,
        model: data.model,
        fallback: false
      };

    } catch (err) {
      console.warn(`[AIService] Edge Function invocation failed. Triggering local template fallback:`, err.message);
      
      // Fetch lead details locally to feed the fallback generator
      const lead = await getLead(leadId);
      const text = localFallbackGenerator(lead, promptType);
      
      return {
        text,
        provider: "Local Rules",
        model: "B2B Template v1.0",
        fallback: true
      };
    }
  },

  /**
   * Appends copy text block to lead notes in the database.
   */
  async saveToNotes(leadId, previousNotes, text) {
    const updatedNotes = previousNotes 
      ? `${previousNotes}\n\n=== AI Copy Draft (${new Date().toLocaleDateString()}) ===\n${text}`
      : `=== AI Copy Draft (${new Date().toLocaleDateString()}) ===\n${text}`;

    const { error } = await supabase
      .from("leads")
      .update({ general_notes: updatedNotes })
      .eq("id", leadId);

    if (error) throw error;
    return updatedNotes;
  },

  /**
   * Logs a generation record inside the activity timeline feed.
   */
  async logToTimeline({ leadId, organizationId, userId, promptType }) {
    const matched = PROMPT_TYPES.find((p) => p.id === promptType);
    const label = matched ? matched.label : promptType;
    
    await logActivity({
      leadId,
      organizationId,
      userId,
      eventType: "note_added",
      newValue: `Generated ${label} outreach copy via AI Assistant`
    });
  }
};
