# Deployment Guide — BrewFlow AI

Step-by-step instructions for deploying BrewFlow AI to production.

---

## 1. Backend Deployment (Supabase)

### Step A: Configure Postgres Tables
Make sure that your tables (`organizations`, `leads`, `lead_activity`, `ai_generations`) are created with the correct types and that **Row-Level Security (RLS)** is enabled on all of them.

### Step B: Configure API Secrets
You must configure your Gemini API Key in Supabase secrets so the Edge Function can fetch it securely:
```bash
supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here
```
*(Alternatively, configure it inside the Supabase Dashboard under Project Settings -> API -> Secrets).*

### Step C: Deploy Edge Functions
Deploy the outreach copywriter Edge Function using the Supabase CLI:
```bash
supabase functions deploy generate-sales-copy
```

---

## 2. Frontend Deployment

The frontend compiles to standard static HTML/JS/CSS assets.

### Deploying to Vercel or Netlify
1. Connect your Github repository to Vercel or Netlify.
2. Configure build settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Root Directory:** `frontend`
3. Configure Environment Variables:
   - `VITE_SUPABASE_URL`: Your Supabase API endpoint.
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key.
4. Click **Deploy**.
