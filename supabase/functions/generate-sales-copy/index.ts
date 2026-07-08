import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const PROMPT_TEMPLATES = {
  cold_email: (lead: any) => `
    Write a short, highly compelling B2B cold email to a potential wholesale customer.
    Company Name: ${lead.business_name}
    Contact Person: ${lead.contact_person || 'Purchasing Manager'}
    Business Type: ${lead.business_type || 'Retailer'}
    City: ${lead.city || 'their city'}
    Interested Products: ${lead.interested_products || 'our wholesale catalog'}
    Current Supplier: ${lead.current_supplier || 'unknown supplier'}
    General Notes: ${lead.general_notes || ''}

    Structure:
    - Subject: Needs a highly personalized, clickable B2B subject line.
    - Salutation: Addressed to the contact person.
    - Body: Under 150 words. Focus on how we can improve their supply quality and margins.
    - CTA: Call to action to send product samples.
  `,
  whatsapp_followup: (lead: any) => `
    Write a short, casual B2B WhatsApp follow-up outreach message.
    Company Name: ${lead.business_name}
    Contact Person: ${lead.contact_person || 'there'}
    Interested Products: ${lead.interested_products || 'wholesale supplies'}
    
    Guidelines:
    - Keep it under 60 words.
    - Warm, friendly, and brief.
    - Ask if they had a chance to look at our samples or price catalog.
    - Use a few emojis.
  `,
  call_script: (lead: any) => `
    Write a cold call opening script (first 30-45 seconds hook) for a wholesale sales representative.
    Company Name: ${lead.business_name}
    Contact Person: ${lead.contact_person || 'Purchasing Manager'}
    Business Type: ${lead.business_type || 'Retailer'}
    Current Supplier: ${lead.current_supplier || 'unknown'}

    Structure:
    - Intro: Greeting, identify self and brand, state reason for call.
    - Hook: Mentioning their business in ${lead.city || 'their area'} and address their probable pain points with their ${lead.current_supplier ? `current supplier (${lead.current_supplier})` : 'current supplier'}.
    - Ask: Low-friction CTA (e.g. permission to email a menu/catalog or ship a sample pack).
  `,
  meeting_summary: (lead: any) => `
    Generate a concise B2B meeting summary based on the notes below.
    Lead Name: ${lead.business_name}
    Contact Person: ${lead.contact_person || 'Purchasing Manager'}
    Lead Notes: ${lead.general_notes || 'No recent notes logged.'}

    Structure:
    - Bullets for key discussion items.
    - Identified pain points/interests.
    - Clear action items.
  `,
  lead_summary: (lead: any) => `
    Generate a high-level executive B2B lead summary.
    Lead Name: ${lead.business_name}
    Type: ${lead.business_type || 'Wholesale lead'}
    City: ${lead.city || 'unknown'}
    Potential Revenue: ${lead.potential_monthly_revenue ? `$${lead.potential_monthly_revenue}` : 'unknown'}
    Current Supplier: ${lead.current_supplier || 'unknown'}
    General Notes: ${lead.general_notes || ''}

    Guidelines:
    - Summarize in one concise paragraph.
    - Highlight the estimated deal value and core opportunity.
  `,
  next_best_action: (lead: any) => `
    Provide 3 actionable next steps for a sales representative to advance this deal.
    Lead Name: ${lead.business_name}
    Status: ${lead.status || 'New Lead'}
    Next Follow-up Scheduled: ${lead.next_follow_up_date || 'None'}
    General Notes: ${lead.general_notes || ''}

    Guidelines:
    - Output exactly 3 bullet points.
    - Base actions on lead status and notes.
  `
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let bodyJson: any = {}
  let authHeader = ""
  let promptText = ""

  try {
    authHeader = req.headers.get('Authorization') ?? ""
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    bodyJson = await req.json()
    const { leadId, promptType, organizationId, userId, companyDetails, targetLocation, businessType } = bodyJson
    if (!promptType || !organizationId) {
      return new Response(JSON.stringify({ error: 'Missing required body parameters (promptType, organizationId)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (promptType !== 'scout_prospects' && !leadId) {
      return new Response(JSON.stringify({ error: 'Missing required leadId parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    let lead = null;
    if (promptType !== 'scout_prospects') {
      const { data: leadData, error: leadError } = await supabaseClient
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single()

      if (leadError || !leadData) {
        console.error('Lead authorization failed or lead not found:', leadError)
        return new Response(JSON.stringify({ error: 'Access denied or Lead not found.' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      lead = leadData;
      
      const promptTemplateFn = PROMPT_TEMPLATES[promptType as keyof typeof PROMPT_TEMPLATES]
      if (!promptTemplateFn) {
        return new Response(JSON.stringify({ error: `Invalid promptType: ${promptType}` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      promptText = promptTemplateFn(lead)
    } else {
      // 100% Free Scouting Sourcing: Overpass API & Nominatim
      let scoutedElements = [];
      try {
        console.log(`[Edge Scout] Geocoding target region: ${targetLocation}`);
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(targetLocation)}&format=json&limit=1`;
        const geocodeRes = await fetch(geocodeUrl, {
          headers: { 'User-Agent': 'BrewFlow-Sales-OS/1.0 (support@brewflow.ai)' }
        });
        const geocodeData = await geocodeRes.json();
        
        if (geocodeData && geocodeData.length > 0) {
          const lat = parseFloat(geocodeData[0].lat);
          const lon = parseFloat(geocodeData[0].lon);
          console.log(`[Edge Scout] Resolved coordinates: lat=${lat}, lon=${lon}`);
          
          // Query Overpass for cafes and bakeries within 15km of target city coordinates
          const query = `[out:json];(node[amenity=cafe](around:15000,${lat},${lon});node[amenity=bakery](around:15000,${lat},${lon}););out 10;`;
          const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
          
          const overpassRes = await fetch(overpassUrl);
          const overpassData = await overpassRes.json();
          const elements = overpassData.elements || [];
          
          scoutedElements = elements.map((el: any) => ({
            business_name: el.tags.name || "Local Café",
            business_type: el.tags.amenity === "cafe" ? "Specialty Café" : "Bakery",
            address: `${el.tags['addr:street'] || ''} ${el.tags['addr:suburb'] || ''} ${targetLocation}`.trim(),
            phone: el.tags.phone || el.tags['contact:phone'] || "Not Available",
            email: el.tags.email || el.tags['contact:email'] || "Not Available",
            website: el.tags.website || "Not Available"
          })).filter((p: any) => p.business_name !== "Local Café");
        }
      } catch (scoutErr) {
        console.error(`[Edge Scout] Overpass API query failed, using AI baseline:`, scoutErr);
      }

      // If Firecrawl Key is present, we could scrape websites for matches.
      const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY') || "";
      const scoutDataString = scoutedElements.length > 0 
        ? JSON.stringify(scoutedElements.slice(0, 4))
        : "No local coordinates found. Please suggest real existing targets from memory.";

      promptText = `
        You are a B2B sales prospector and lead finder.
        Our company details are: "${companyDetails || ''}"
        We want to find B2B clients of type "${businessType || ''}" in "${targetLocation || ''}".
        
        Here is a list of real-world business nodes retrieved from OpenStreetMap:
        ${scoutDataString}
        
        Find 3 real, existing businesses in "${targetLocation || ''}" that match our target and output them.
        Output ONLY a valid JSON array of objects (no markdown, no backticks, no wrapping other than the array).
        
        Required JSON format:
        [
          {
            "business_name": "Name of Business",
            "business_type": "Specific Type",
            "address": "Street Address, City",
            "phone": "Real Phone Number or 'Not Available'",
            "email": "Real Email Address or 'Not Available'",
            "website": "Real Website URL or 'Not Available'",
            "interested_products": "Specific products they would buy from us",
            "current_supplier": "Likely supplier or 'Unknown'",
            "consumption": "Estimated monthly consumption volume (e.g. 300 liters or 20 cases)"
          }
        ]
        
        Absolute Rules:
        - Never hallucinate contact details. If not available in OSM data or memory, return 'Not Available'.
        - Only return real, existing businesses.
      `;
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Gemini API Key is not configured on Supabase Secrets' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const startTime = Date.now()
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: promptText }]
        }]
      })
    })
    const latencyMs = Date.now() - startTime

    if (!response.ok) {
      const errText = await response.text()
      console.error('Gemini API call failed:', errText)
      throw new Error(`Gemini API returned error: ${response.status} - ${errText}`)
    }

    const resJson = await response.json()
    const resultText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text
    const tokensUsed = resJson?.usageMetadata?.totalTokenCount || null

    if (!resultText) {
      throw new Error('Gemini API returned empty text response')
    }

    const { error: logError } = await supabaseClient
      .from('ai_generations')
      .insert({
        organization_id: organizationId,
        lead_id: leadId || null,
        user_id: userId || null,
        prompt_type: promptType,
        provider: 'gemini',
        model: 'gemini-1.5-flash',
        prompt: promptText,
        response: resultText,
        status: 'completed',
        tokens_used: tokensUsed,
        latency_ms: latencyMs,
        error_message: null
      })

    if (logError) {
      console.error('Failed to write generation details to log table:', logError)
    }

    return new Response(JSON.stringify({
      text: resultText,
      provider: 'gemini',
      model: 'gemini-1.5-flash'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err: any) {
    console.error('Edge Function Exception:', err)
    
    if (bodyJson.organizationId && bodyJson.leadId && authHeader) {
      try {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          { global: { headers: { Authorization: authHeader } } }
        )
        await supabaseClient
          .from('ai_generations')
          .insert({
            organization_id: bodyJson.organizationId,
            lead_id: bodyJson.leadId || null,
            user_id: bodyJson.userId || null,
            prompt_type: bodyJson.promptType || 'unknown',
            provider: 'gemini',
            model: 'gemini-1.5-flash',
            prompt: promptText || bodyJson.promptType || 'generation request',
            response: '',
            status: 'failed',
            error_message: err.message || 'Unknown error'
          })
      } catch (logErr) {
        console.error('Failed to log failure event to database:', logErr)
      }
    }

    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
