import { useState } from "react";
import { 
  Compass, 
  MapPin, 
  Building, 
  Sparkles, 
  TrendingUp, 
  Check, 
  X, 
  Phone, 
  Globe, 
  Mail, 
  ShieldCheck, 
  AlertTriangle,
  ArrowRight,
  HelpCircle
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { createLead } from "../lib/leadsApi";
import { AIService } from "../lib/aiService";
import CustomSelect from "../components/CustomSelect";

const CITY_OPTIONS = [
  { value: "San Francisco", label: "San Francisco, CA" },
  { value: "Portland", label: "Portland, OR" },
  { value: "Chicago", label: "Chicago, IL" },
  { value: "Los Angeles", label: "Los Angeles, CA" },
  { value: "New York", label: "New York, NY" }
];

const INDUSTRY_OPTIONS = [
  { value: "Café", label: "Specialty Cafes" },
  { value: "Bakery", label: "Bakeries & Outlets" }
];

export default function LeadScout() {
  const { user, organization } = useAuth();
  const [companyDetails, setCompanyDetails] = useState("");
  const [selectedCity, setSelectedCity] = useState("San Francisco");
  const [selectedIndustry, setSelectedIndustry] = useState("Café");
  
  const [scouting, setScouting] = useState(false);
  const [prospects, setProspects] = useState([]);
  const [searchRun, setSearchRun] = useState(false);
  
  const [acceptedLog, setAcceptedLog] = useState("");
  const [error, setError] = useState("");

  const handleScout = async (e) => {
    e.preventDefault();
    if (!companyDetails.trim()) {
      setError("Please describe your business value proposition.");
      return;
    }
    setError("");
    setScouting(true);
    setSearchRun(true);
    setAcceptedLog("");

    try {
      // Run qualification scan through pre-verified registries in service
      const results = await AIService.scoutProspects({
        companyDetails,
        targetLocation: selectedCity,
        businessType: selectedIndustry
      });
      setProspects(results);
    } catch (err) {
      setError("Sourcing failed: " + err.message);
    } finally {
      setScouting(false);
    }
  };

  const handleAccept = async (prospect) => {
    setError("");
    try {
      const fields = {
        business_name: prospect.business_name,
        business_type: prospect.business_type,
        contact_person: "Purchasing Manager",
        phone: prospect.phone,
        email: prospect.email,
        website: prospect.website,
        address: prospect.address,
        city: selectedCity,
        status: "New Lead",
        current_supplier: prospect.current_supplier,
        interested_products: prospect.interested_products,
        estimated_monthly_consumption: prospect.consumption,
        potential_monthly_revenue: prospect.potential_revenue,
        general_notes: prospect.explanation,
        is_deleted: false
      };

      await createLead(organization.id, user.id, fields);
      
      // Remove from list
      setProspects(prev => prev.filter(p => p.business_name !== prospect.business_name));
      setAcceptedLog(`Added "${prospect.business_name}" to your Leads pipeline!`);
      setTimeout(() => setAcceptedLog(""), 4000);
    } catch (err) {
      setError("Failed to add lead: " + err.message);
    }
  };

  const handleReject = (businessName) => {
    setProspects(prev => prev.filter(p => p.business_name !== businessName));
  };

  return (
    <div className="space-y-8 font-body selection:bg-[#d8a64c] selection:text-white">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#14213d]/5 dark:border-white/5 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-[#d8a64c] font-bold uppercase tracking-wider">
            <Compass size={14} className="animate-spin-slow" />
            <span>Outbound Lead Prospecting</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl text-[#14213d] dark:text-[#f9fafb] tracking-tight">
            AI Lead Scout
          </h1>
          <p className="text-xs text-[#14213d]/60 dark:text-[#beb7a7]/65">
            Discover and qualify real, pre-verified B2B clients in your target logistics region.
          </p>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Sourcing Parameters Input */}
        <div className="lg:col-span-1 rounded-2xl border border-[#14213d]/5 dark:border-white/5 bg-white/70 dark:bg-[#0e1528]/70 p-6 shadow-sm backdrop-blur-md space-y-5">
          <div className="flex items-center gap-2 border-b border-[#14213d]/5 dark:border-white/5 pb-3">
            <Sparkles size={16} className="text-[#d8a64c]" />
            <h2 className="font-display font-bold text-sm text-[#14213d] dark:text-[#f9fafb] uppercase tracking-wider">
              Scout Parameters
            </h2>
          </div>

          <form onSubmit={handleScout} className="space-y-4">
            
            {/* Value proposition details */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Your Company Details & USP
              </label>
              <textarea
                value={companyDetails}
                onChange={(e) => setCompanyDetails(e.target.value)}
                placeholder="e.g. We supply organic wholesale oat milk with premium barista froth capabilities to local brands."
                rows={4}
                className="w-full p-3.5 rounded-xl border border-[#14213d]/10 dark:border-white/10 bg-[#f8f7f4] dark:bg-ink-950/40 text-xs sm:text-sm outline-none focus:border-[#d8a64c] text-[#14213d] dark:text-[#f9fafb] placeholder:text-slate-400 transition-all resize-none shadow-inner"
              />
            </div>

            {/* Target Location dropdown */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Target Logistics Region
              </label>
              <CustomSelect
                value={CITY_OPTIONS.find(c => c.value === selectedCity)?.label || selectedCity}
                onChange={setSelectedCity}
                options={CITY_OPTIONS}
              />
            </div>

            {/* Target Business Type dropdown */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Target Industry
              </label>
              <CustomSelect
                value={INDUSTRY_OPTIONS.find(i => i.value === selectedIndustry)?.label || selectedIndustry}
                onChange={setSelectedIndustry}
                options={INDUSTRY_OPTIONS}
              />
            </div>

            {error && (
              <p className="text-[11px] text-[#e06656] bg-[#e06656]/5 border border-[#e06656]/15 rounded-lg px-3 py-2 flex items-center gap-1.5 font-semibold">
                <AlertTriangle size={12} />
                <span>{error}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={scouting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#14213d] dark:bg-[#d8a64c] text-white dark:text-[#14213d] text-xs font-bold uppercase tracking-wider hover:opacity-95 disabled:opacity-50 transition-all shadow border-none cursor-pointer"
            >
              {scouting ? "Scouting Registry..." : "Scout Prospects"}
              <ArrowRight size={13} />
            </button>

          </form>
        </div>

        {/* Right Column: Sourced Prospects Inbox */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Notifications logs */}
          {acceptedLog && (
            <div className="p-3.5 rounded-xl bg-[#5b7553]/10 border border-[#5b7553]/25 text-[#5b7553] text-xs font-bold flex items-center gap-2 animate-in fade-in duration-300">
              <Check size={14} className="bg-[#5b7553] text-white rounded-full p-0.5" />
              <span>{acceptedLog}</span>
            </div>
          )}

          {/* Sourcing Inbox title */}
          <div className="flex items-center justify-between border-b border-[#14213d]/5 dark:border-white/5 pb-3">
            <h3 className="font-display font-bold text-xs uppercase text-slate-400 tracking-wider">
              Prospect Sourcing Inbox ({prospects.length} available)
            </h3>
            <span className="text-[9px] font-mono text-slate-400 bg-slate-200/50 dark:bg-slate-800/40 px-2 py-0.5 rounded-full font-bold">
              Verified Registry Scan
            </span>
          </div>

          {/* Scouting Loading state */}
          {scouting && (
            <div className="rounded-2xl border border-dashed border-[#14213d]/10 dark:border-white/10 bg-white/30 dark:bg-transparent p-12 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#d8a64c]/20 border-t-[#d8a64c] animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Analyzing verified records...</p>
              <p className="text-[10px] text-slate-400/70">Calculating lead score matches against your company profile.</p>
            </div>
          )}

          {/* Default state */}
          {!scouting && !searchRun && (
            <div className="rounded-2xl border border-dashed border-[#14213d]/10 dark:border-white/10 bg-white/30 dark:bg-transparent p-16 text-center space-y-3">
              <Compass size={32} className="text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Prospecting Sandbox Idle</p>
              <p className="text-[11px] text-slate-400/80 max-w-sm mx-auto">
                Fill in your company value proposition and location details on the left, then click scout to pull real verified leads.
              </p>
            </div>
          )}

          {/* Empty state */}
          {!scouting && searchRun && prospects.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#e06656]/20 bg-[#e06656]/3 p-16 text-center space-y-3">
              <AlertTriangle size={32} className="text-[#e06656]/60 mx-auto" />
              <p className="text-xs font-bold uppercase tracking-wider text-[#e06656]">No verified prospects found</p>
              <p className="text-[11px] text-[#e06656]/80 max-w-sm mx-auto">
                No matching verified businesses were located in the registry for this location and business type. Try searching SF, Portland, or LA.
              </p>
            </div>
          )}

          {/* Prospects list grid */}
          {!scouting && prospects.length > 0 && (
            <div className="space-y-4">
              {prospects.map((prospect) => (
                <div 
                  key={prospect.business_name} 
                  className="rounded-2xl border border-[#14213d]/5 dark:border-white/5 bg-white/80 dark:bg-[#0e1528]/80 p-6 shadow-sm space-y-5 hover:border-[#d8a64c]/20 transition-all"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#14213d]/5 dark:border-white/5 pb-3.5">
                    <div>
                      <h4 className="font-display font-extrabold text-base text-[#14213d] dark:text-white">
                        {prospect.business_name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                        <MapPin size={10} className="text-[#d8a64c]" />
                        <span>{prospect.address}</span>
                      </div>
                    </div>
                    
                    {/* Score badge */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="text-[10px] font-mono font-bold text-[#5b7553] bg-[#5b7553]/10 px-2 py-0.5 rounded-full">
                        {prospect.buying_intent} Intent
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-[#d8a64c]/10 text-[#d8a64c] flex flex-col items-center justify-center border border-[#d8a64c]/20">
                        <span className="text-[10px] uppercase font-mono font-bold leading-none">Score</span>
                        <span className="text-sm font-display font-extrabold leading-none mt-0.5">{prospect.lead_score}</span>
                      </div>
                    </div>
                  </div>

                  {/* Calculated metrics stats box */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#f8f7f4] dark:bg-ink-950/40 border border-[#14213d]/5 rounded-xl p-3.5 text-center">
                    <div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase block">Est Revenue</span>
                      <span className="text-xs font-mono font-bold text-[#14213d] dark:text-[#f9fafb] block mt-0.5">
                        ${prospect.potential_revenue.toLocaleString()}/mo
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase block">ICP Fit</span>
                      <span className="text-xs font-mono font-bold text-[#d8a64c] block mt-0.5">
                        {prospect.icp_match}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase block">Competitor</span>
                      <span className="text-xs font-mono font-bold text-slate-400 block mt-0.5 truncate max-w-full">
                        {prospect.current_supplier}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase block">Logistics Node</span>
                      <span className="text-xs font-mono font-bold text-[#5b7553] block mt-0.5">
                        {prospect.distance} mi
                      </span>
                    </div>
                  </div>

                  {/* AI Qualification Logic text */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[9px] uppercase font-mono tracking-widest text-[#d8a64c] font-bold">
                      <ShieldCheck size={12} />
                      <span>AI Qualification Audit</span>
                    </div>
                    <p className="text-xs text-[#14213d]/70 dark:text-[#beb7a7]/75 leading-relaxed font-light">
                      {prospect.explanation}
                    </p>
                  </div>

                  {/* Sourced contact details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 border-t border-[#14213d]/5 dark:border-white/5 pt-4 text-xs font-bold text-[#14213d]/70 dark:text-[#beb7a7]/70">
                    <div className="flex items-center gap-2 truncate">
                      <Mail size={12} className="text-[#d8a64c] shrink-0" />
                      <span className="truncate">{prospect.email}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Phone size={12} className="text-[#d8a64c] shrink-0" />
                      <span>{prospect.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Globe size={12} className="text-[#d8a64c] shrink-0" />
                      <a href={prospect.website} target="_blank" rel="noopener noreferrer" className="underline hover:text-[#d8a64c] truncate">
                        {prospect.website.replace("https://", "")}
                      </a>
                    </div>
                  </div>

                  {/* Inbox Control Triggers */}
                  <div className="flex items-center justify-end gap-2 border-t border-[#14213d]/5 dark:border-white/5 pt-4">
                    <button
                      onClick={() => handleReject(prospect.business_name)}
                      className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl border border-[#e06656]/20 hover:bg-[#e06656]/10 transition-all text-xs font-bold uppercase tracking-wider text-[#e06656] cursor-pointer"
                    >
                      <X size={13} />
                      <span>Dismiss</span>
                    </button>
                    <button
                      onClick={() => handleAccept(prospect)}
                      className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-[#5b7553] text-white hover:opacity-90 transition-all text-xs font-bold uppercase tracking-wider cursor-pointer border-none shadow-sm"
                    >
                      <Check size={13} />
                      <span>Accept & Save to CRM</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
