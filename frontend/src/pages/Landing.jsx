import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Droplet,
  ArrowRight,
  Sun,
  Moon,
  Check,
  CheckCircle2,
  Activity,
  Sparkles,
  Users,
  CalendarClock,
  Coffee,
  Package,
  Store,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  BarChart3,
  ShieldAlert
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";

export default function Landing({ theme, onToggleTheme }) {
  const { session } = useAuth();
  
  // Interactive mock lead status changer state
  const [mockLeadStatus, setMockLeadStatus] = useState("Interested");
  
  // Interactive pricing period (monthly / annual)
  const [isAnnual, setIsAnnual] = useState(false);
  
  // Accordion FAQ active indexes
  const [openFaqs, setOpenFaqs] = useState({});

  // Mouse Parallax coordinates
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // SEO setup
    document.title = "BrewFlow AI — B2B Sales. Finally Organized.";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "BrewFlow AI is a premium B2B Sales Operating System for coffee suppliers, oat milk roasters, and bakeries. Track leads, pipelines, follow-ups, and AI assistance."
      );
    }
  }, []);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const x = (clientX - window.innerWidth / 2) / 45;
    const y = (clientY - window.innerHeight / 2) / 45;
    setMouseCoords({ x, y });
  };

  const toggleFaq = (index) => {
    setOpenFaqs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Metrics that respond to the mock lead status
  const getMockMetrics = () => {
    let baseLeads = 84;
    let baseSamples = 24;
    let baseCustomers = 36;
    
    if (mockLeadStatus === "Sample Sent") {
      baseSamples += 1;
    } else if (mockLeadStatus === "Customer") {
      baseCustomers += 1;
    }
    
    return {
      totalLeads: baseLeads,
      samplesSent: baseSamples,
      customers: baseCustomers,
      conversionRate: ((baseCustomers / baseLeads) * 100).toFixed(1),
    };
  };

  const metrics = getMockMetrics();

  const faqs = [
    {
      q: "Who is BrewFlow AI designed for?",
      a: "BrewFlow is built specifically for small-to-medium businesses that sell physical products to other businesses (B2B wholesale). This includes coffee roasters, bakeries, organic food brands, packaging companies, and FMCG distributors.",
    },
    {
      q: "How does the organization scoping work?",
      a: "We implement hard database-level multi-tenancy. Every single data point in BrewFlow is scoped to your organization. Thanks to Postgres Row Level Security (RLS), it is cryptographically impossible for other companies to ever read or write to your data.",
    },
    {
      q: "Can I import my existing spreadsheet leads?",
      a: "Yes. In the Leads dashboard, we support one-click CSV importing. BrewFlow maps your custom columns to your B2B fields—such as Business Type, Current Supplier, and Potential Monthly Consumption—so you never lose your history.",
    },
    {
      q: "Is there a real-time activity log?",
      a: "Yes. Every lead creation, status update, sample sent, and follow-up log automatically creates a record in the Lead Activity history. This allows sales teams to view a chronological timeline of interactions and know exactly where a lead stands.",
    },
  ];

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#f7f5ef] dark:bg-[#0b1120] text-[#14213d] dark:text-[#f9fafb] font-body selection:bg-[#d8a64c] selection:text-white transition-colors duration-300"
    >
      
      {/* 1. Header (Navbar) */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#f7f5ef]/80 dark:bg-[#0b1120]/80 border-b border-[#14213d]/5 dark:border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8.5 h-8.5 rounded-xl bg-[#d8a64c] flex items-center justify-center shadow-sm">
              <Droplet size={18} className="text-[#14213d]" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-[#14213d] dark:text-[#f9fafb]">
              BrewFlow <span className="text-[#d8a64c] font-mono text-xs font-bold">OS</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-[#14213d]/60 dark:text-[#beb7a7]/65">
            <a href="#features" className="hover:text-[#14213d] dark:hover:text-white transition-colors">Features</a>
            <a href="#demo" className="hover:text-[#14213d] dark:hover:text-white transition-colors">Product Tour</a>
            <a href="#pricing" className="hover:text-[#14213d] dark:hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-[#14213d] dark:hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={onToggleTheme}
              className="p-2.5 rounded-xl border border-[#14213d]/10 dark:border-white/10 text-[#14213d] dark:text-[#beb7a7] hover:bg-[#14213d]/5 dark:hover:bg-white/5 transition-all cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {session ? (
              <Link
                to="/dashboard"
                className="px-4.5 py-2.5 rounded-xl bg-[#d8a64c] hover:bg-[#c19036] text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.03] uppercase tracking-wider"
              >
                Go to Workspace
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-block text-xs font-bold uppercase tracking-wider text-[#14213d]/60 dark:text-[#beb7a7]/65 hover:text-[#14213d] dark:hover:text-white transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-4.5 py-2.5 rounded-xl bg-[#14213d] dark:bg-[#d8a64c] text-white dark:text-[#14213d] text-xs font-bold shadow-sm transition-all hover:scale-[1.03] uppercase tracking-wider"
                >
                  Start Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Hero Text */}
            <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono bg-[#d8a64c]/10 text-[#d8a64c] border border-[#d8a64c]/20 uppercase tracking-widest"
              >
                <Sparkles size={11} />
                Now in Private Beta
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight text-[#14213d] dark:text-[#f9fafb] leading-[1.05]"
              >
                B2B Sales. <br />
                <span className="text-[#d8a64c]">Finally Organized.</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-sm sm:text-base text-[#14213d]/60 dark:text-[#beb7a7]/75 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light"
              >
                Stop running wholesale pipelines on memory and sheets. BrewFlow is the premium Sales OS built for coffee suppliers, oat milk brands, bakeries, and distributors to log, automate, and close deals.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              >
                {session ? (
                  <Link
                    to="/dashboard"
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#d8a64c] text-white hover:bg-[#c19036] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.02]"
                  >
                    Go to Workspace <ArrowRight size={14} />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/signup"
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#14213d] dark:bg-[#d8a64c] text-white dark:text-[#14213d] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.02]"
                    >
                      Create Free Account <ArrowRight size={14} />
                    </Link>
                    <Link
                      to="/login"
                      className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#14213d]/15 dark:border-white/10 text-xs font-bold uppercase tracking-wider text-[#14213d]/70 dark:text-[#beb7a7] hover:bg-[#14213d]/5 dark:hover:bg-white/5 transition-all text-center"
                    >
                      Book a Demo
                    </Link>
                  </>
                )}
              </motion.div>

              {/* Brands Trust */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="pt-8 border-t border-[#14213d]/5 dark:border-white/5 max-w-md mx-auto lg:mx-0"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#14213d]/50 dark:text-[#beb7a7]/50 mb-3">
                  Powering Modern Wholesale Brands
                </p>
                <div className="flex justify-center lg:justify-start gap-8 items-center opacity-70 grayscale dark:invert">
                  <div className="flex items-center gap-1 font-display font-bold tracking-tight text-xs text-[#14213d]">
                    <Coffee size={14} className="text-[#d8a64c]" /> OATISH
                  </div>
                  <div className="flex items-center gap-1 font-display font-bold tracking-tight text-xs text-[#14213d]">
                    <Package size={14} className="text-[#d8a64c]" /> BEANERY CO.
                  </div>
                  <div className="flex items-center gap-1 font-display font-bold tracking-tight text-xs text-[#14213d]">
                    <Store size={14} className="text-[#d8a64c]" /> FLOUR & CO.
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Right Hero: Floating CRM Deck Graphics */}
            <div className="lg:col-span-7 relative flex items-center justify-center min-h-[450px]">
              
              {/* Parallax Container wrapping animated cards */}
              <motion.div 
                style={{ 
                  x: mouseCoords.x, 
                  y: mouseCoords.y,
                  rotateX: -mouseCoords.y * 0.4,
                  rotateY: mouseCoords.x * 0.4,
                  transformStyle: "preserve-3d" 
                }}
                className="relative w-full max-w-lg transition-transform duration-300 ease-out"
              >
                
                {/* 1. Base Canvas Card (Dashboard Overview) */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  className="rounded-2xl bg-white/70 dark:bg-[#111827]/70 border border-[#14213d]/5 dark:border-white/5 p-5 shadow-2xl backdrop-blur-md"
                >
                  <div className="flex items-center justify-between pb-3.5 border-b border-[#14213d]/5 dark:border-white/5 mb-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#e06656]"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#d8a64c]"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#5b7553]"></span>
                    </div>
                    <span className="text-[9px] font-mono tracking-widest text-[#14213d]/40 dark:text-[#beb7a7]/40 uppercase font-bold">
                      BREWFLOW_PIPELINE
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-[#f7f5ef]/50 dark:bg-[#0b1120]/40 border border-[#14213d]/5">
                      <p className="text-[9px] font-bold text-[#14213d]/50 dark:text-[#beb7a7]/50 uppercase">Active Leads</p>
                      <p className="text-lg font-mono font-bold text-[#14213d] dark:text-[#f9fafb] mt-0.5">
                        {metrics.totalLeads}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#f7f5ef]/50 dark:bg-[#0b1120]/40 border border-[#14213d]/5">
                      <p className="text-[9px] font-bold text-[#14213d]/50 dark:text-[#beb7a7]/50 uppercase">Samples Sent</p>
                      <p className="text-lg font-mono font-bold text-[#14213d] dark:text-[#f9fafb] mt-0.5">
                        {metrics.samplesSent}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#f7f5ef]/50 dark:bg-[#0b1120]/40 border border-[#14213d]/5">
                      <p className="text-[9px] font-bold text-[#14213d]/50 dark:text-[#beb7a7]/50 uppercase">Customers</p>
                      <p className="text-lg font-mono font-bold text-[#5b7553] mt-0.5">
                        {metrics.customers}
                      </p>
                    </div>
                  </div>

                  {/* Spacer for overlapping floating cards */}
                  <div className="h-44"></div>
                </motion.div>

                {/* 2. Floating Card A: Attio-style Lead Profile (Overlapping) */}
                <motion.div 
                  initial={{ opacity: 0, y: 50, x: -10 }}
                  animate={{ 
                    opacity: 1, 
                    y: 110, 
                    x: 20,
                    rotate: -1
                  }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="absolute top-20 left-4 w-72 rounded-2xl bg-white/90 dark:bg-[#1f2937]/90 p-4 border border-[#14213d]/5 dark:border-white/10 shadow-xl backdrop-blur-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#14213d] dark:text-[#f9fafb]">
                        Central Roast Coffee Co.
                      </h4>
                      <p className="text-[10px] text-[#14213d]/50 dark:text-[#beb7a7]/60 mt-0.5">
                        Coffee Shop · Chicago, IL
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-[#d8a64c]/10 text-[#d8a64c] border border-[#d8a64c]/20">
                      Interested
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 text-[9px] font-mono text-[#14213d]/60 dark:text-[#beb7a7]/60">
                    <div>Volume: <span className="text-[#14213d] dark:text-[#f9fafb] font-bold">120kg/mo</span></div>
                    <div>Est. Deal: <span className="text-[#14213d] dark:text-[#f9fafb] font-bold">$3,600</span></div>
                  </div>
                </motion.div>

                {/* 3. Floating Card B: AI Sales Assistant Draft Copy (Overlapping) */}
                <motion.div 
                  initial={{ opacity: 0, y: 60, x: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 130, 
                    x: 180,
                    rotate: 1.5
                  }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="absolute top-24 left-10 w-72 rounded-2xl bg-[#14213d]/95 p-4 border border-white/10 shadow-xl text-white backdrop-blur-lg"
                >
                  <div className="flex items-center gap-1.5 pb-2 border-b border-white/5 mb-2">
                    <Sparkles size={11} className="text-[#d8a64c]" />
                    <span className="text-[9px] font-mono uppercase tracking-widest text-[#d8a64c] font-bold">AI outreach builder</span>
                  </div>
                  <p className="text-[9px] text-[#beb7a7] leading-relaxed italic">
                    "Hi Central Roast team, noticed you run a specialty coffee bar in Chicago. We supply certified organic oat milk..."
                  </p>
                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/5">
                    <span className="text-[8px] font-mono text-white/40">Powered by Gemini</span>
                    <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-[#d8a64c] text-white">Drafted</span>
                  </div>
                </motion.div>

                {/* 4. Interactive Status Changer Switcher */}
                <div className="absolute -bottom-2 right-4 bg-white dark:bg-[#111827] border border-[#14213d]/10 dark:border-white/10 rounded-xl p-2.5 shadow-md flex gap-2 items-center text-[10px]">
                  <span className="font-semibold text-[#14213d]/60 dark:text-[#beb7a7]/60">Change Status:</span>
                  <div className="flex gap-1">
                    {["Interested", "Sample Sent", "Customer"].map((status) => (
                      <button
                        key={status}
                        onClick={() => setMockLeadStatus(status)}
                        className={`px-2 py-0.5 rounded text-[8px] font-bold transition-all border-none cursor-pointer ${
                          mockLeadStatus === status
                            ? "bg-[#d8a64c] text-white"
                            : "bg-[#f7f5ef] dark:bg-[#0b1120] text-[#14213d]/60 dark:text-[#beb7a7]/65 hover:bg-[#14213d]/5"
                        }`}
                      >
                        {status === "Sample Sent" ? "Sample" : status === "Customer" ? "Won" : status}
                      </button>
                    ))}
                  </div>
                </div>

              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Features Section (Scroll Reveal) */}
      <section id="features" className="py-24 bg-white dark:bg-[#111827] transition-all border-y border-[#14213d]/5 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          <div className="text-center space-y-4 mb-20">
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-[#14213d] dark:text-[#f9fafb] tracking-tight">
              A CRM Built for Physical Operations
            </h2>
            <p className="text-xs sm:text-sm text-[#14213d]/50 dark:text-[#beb7a7]/60 max-w-xl mx-auto font-light leading-relaxed">
              Traditional software CRMs track virtual SaaS deals. BrewFlow is optimized specifically for physical wholesale variables: samples, volumes, and regular suppliers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-6 rounded-2xl border border-[#14213d]/5 dark:border-white/5 bg-[#f7f5ef]/40 dark:bg-[#0b1120]/40 space-y-4 hover:border-[#d8a64c]/40 transition-colors group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#d8a64c]/10 text-[#d8a64c] flex items-center justify-center group-hover:bg-[#d8a64c] group-hover:text-white transition-colors">
                <Users size={18} />
              </div>
              <h3 className="font-display font-bold text-base text-[#14213d] dark:text-[#f9fafb]">
                Structured B2B Profiles
              </h3>
              <p className="text-xs text-[#14213d]/50 dark:text-[#beb7a7]/65 leading-relaxed font-light">
                Track interested products, target monthly consumption weight, and current competitor suppliers. Keep lead cards cleanly updated.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="p-6 rounded-2xl border border-[#14213d]/5 dark:border-white/5 bg-[#f7f5ef]/40 dark:bg-[#0b1120]/40 space-y-4 hover:border-[#d8a64c]/40 transition-colors group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#d8a64c]/10 text-[#d8a64c] flex items-center justify-center group-hover:bg-[#d8a64c] group-hover:text-white transition-colors">
                <CalendarClock size={18} />
              </div>
              <h3 className="font-display font-bold text-base text-[#14213d] dark:text-[#f9fafb]">
                Linear-style Scheduler
              </h3>
              <p className="text-xs text-[#14213d]/50 dark:text-[#beb7a7]/65 leading-relaxed font-light">
                Group follow-ups into Overdue, Today, and Upcoming lists. Never forget a client review or a sample package dispatch again.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="p-6 rounded-2xl border border-[#14213d]/5 dark:border-white/5 bg-[#f7f5ef]/40 dark:bg-[#0b1120]/40 space-y-4 hover:border-[#d8a64c]/40 transition-colors group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#d8a64c]/10 text-[#d8a64c] flex items-center justify-center group-hover:bg-[#d8a64c] group-hover:text-white transition-colors">
                <Sparkles size={18} />
              </div>
              <h3 className="font-display font-bold text-base text-[#14213d] dark:text-[#f9fafb]">
                Secure AI Assistant
              </h3>
              <p className="text-xs text-[#14213d]/50 dark:text-[#beb7a7]/65 leading-relaxed font-light">
                Draft customized cold emails, WhatsApp follow-ups, or scripts based on lead details. All API key credentials remain locked server-side.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 4. Product Tour/Tenancy Security Panel */}
      <section id="demo" className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Graphics */}
            <div className="lg:col-span-6 order-2 lg:order-1 space-y-4">
              <div className="p-5.5 rounded-2xl border border-[#14213d]/5 dark:border-white/5 bg-[#f7f5ef]/40 dark:bg-[#111827]/40 space-y-3.5 shadow-md">
                <div className="flex items-center justify-between pb-3 border-b border-[#14213d]/5 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#5b7553]" />
                    <span className="font-display font-bold text-xs uppercase tracking-wider">RLS Multi-Tenancy Scoped</span>
                  </div>
                  <span className="text-[8px] font-mono bg-[#5b7553]/15 text-[#5b7553] px-2 py-0.5 rounded font-bold">
                    Secure
                  </span>
                </div>
                <p className="text-xs text-[#14213d]/50 dark:text-[#beb7a7]/65 leading-relaxed font-light">
                  We use Row Level Security (RLS) policies directly on Supabase. Your business leads, activities, and generated copy are fully isolated from other organizations.
                </p>
                <div className="p-3 bg-white/80 dark:bg-black/30 rounded-xl border border-[#14213d]/5 dark:border-white/5 font-mono text-[9px] text-[#14213d]/50 dark:text-[#beb7a7]/60 overflow-x-auto">
                  <span>CREATE POLICY org_isolation ON leads USING (organization_id = auth.uid());</span>
                </div>
              </div>

              <div className="p-5.5 rounded-2xl border border-[#14213d]/5 dark:border-white/5 bg-[#f7f5ef]/40 dark:bg-[#111827]/40 space-y-3.5 shadow-md">
                <div className="flex items-center gap-2 pb-3 border-b border-[#14213d]/5 dark:border-white/5">
                  <Activity size={16} className="text-[#d8a64c]" />
                  <span className="font-display font-bold text-xs uppercase tracking-wider">Lead Activity Timeline</span>
                </div>
                <p className="text-xs text-[#14213d]/50 dark:text-[#beb7a7]/65 leading-relaxed font-light">
                  Whenever you update deal stages, send samples, or append logs, BrewFlow writes an audit trail inside the database activity ledger so your sales team has a unified context.
                </p>
              </div>
            </div>

            {/* Right Information */}
            <div className="lg:col-span-6 order-1 lg:order-2 space-y-6 text-center lg:text-left">
              <h2 className="font-display font-extrabold text-3xl md:text-4xl text-[#14213d] dark:text-[#f9fafb] tracking-tight leading-tight">
                Designed to Move B2B Wholesale Pipelines
              </h2>
              <p className="text-xs sm:text-sm text-[#14213d]/50 dark:text-[#beb7a7]/60 font-light leading-relaxed">
                BrewFlow simplifies lead procurement tracking and interaction histories, allowing sales reps to focus on client outreach rather than updating columns in messy tables.
              </p>
              <div className="space-y-4 max-w-lg mx-auto lg:mx-0 text-left pt-2">
                <div className="flex items-start gap-2.5 text-xs">
                  <div className="w-5.5 h-5.5 rounded bg-[#d8a64c]/10 text-[#d8a64c] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} />
                  </div>
                  <p className="text-[#14213d]/60 dark:text-[#beb7a7]/70 font-light leading-snug">
                    <strong className="text-[#14213d] dark:text-white font-bold">Soft-Delete Safeguard:</strong> Deleted leads are marked `is_deleted = true` instead of being permanently removed, protecting valuable customer records.
                  </p>
                </div>
                <div className="flex items-start gap-2.5 text-xs">
                  <div className="w-5.5 h-5.5 rounded bg-[#d8a64c]/10 text-[#d8a64c] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} />
                  </div>
                  <p className="text-[#14213d]/60 dark:text-[#beb7a7]/70 font-light leading-snug">
                    <strong className="text-[#14213d] dark:text-white font-bold">Live Estimates:</strong> Automated calculations sum prospective monthly weights and target revenue values on the fly.
                  </p>
                </div>
                <div className="flex items-start gap-2.5 text-xs">
                  <div className="w-5.5 h-5.5 rounded bg-[#d8a64c]/10 text-[#d8a64c] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} />
                  </div>
                  <p className="text-[#14213d]/60 dark:text-[#beb7a7]/70 font-light leading-snug">
                    <strong className="text-[#14213d] dark:text-white font-bold">Fluid UI Elements:</strong> Clean ivory styling and responsive layouts keep user strain low during long B2B outbound sessions.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Pricing Section (Clean Grid) */}
      <section id="pricing" className="py-24 bg-white dark:bg-[#111827] transition-all border-y border-[#14213d]/5 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          <div className="text-center space-y-4 mb-16">
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-[#14213d] dark:text-[#f9fafb] tracking-tight">
              Pricing Built for Supply Chains
            </h2>
            <p className="text-xs sm:text-sm text-[#14213d]/50 dark:text-[#beb7a7]/60 max-w-xl mx-auto font-light leading-relaxed">
              Start logging leads for free. Upgrade to team scaling operations as your wholesale accounts expand.
            </p>

            {/* Toggle Monthly / Annual */}
            <div className="flex items-center justify-center gap-3 pt-6">
              <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${!isAnnual ? "text-[#14213d] dark:text-[#f9fafb]" : "text-[#14213d]/40 dark:text-[#beb7a7]/40"}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="w-12 h-6.5 rounded-full bg-[#14213d]/10 dark:bg-white/10 p-1 flex items-center transition-colors relative cursor-pointer border-none"
                aria-label="Toggle pricing period"
              >
                <div className={`w-4.5 h-4.5 rounded-full bg-[#d8a64c] transition-transform ${isAnnual ? "translate-x-5.5" : "translate-x-0"}`}></div>
              </button>
              <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isAnnual ? "text-[#14213d] dark:text-[#f9fafb]" : "text-[#14213d]/40 dark:text-[#beb7a7]/40"}`}>
                Annually <span className="text-[9px] text-[#5b7553] font-bold bg-[#5b7553]/10 px-1.5 py-0.5 rounded ml-1 border border-[#5b7553]/20">Save 20%</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            
            {/* Starter Tier */}
            <div className="rounded-2xl border border-[#14213d]/5 dark:border-white/5 bg-[#f7f5ef]/40 dark:bg-[#0b1120]/40 p-6 flex flex-col justify-between space-y-8">
              <div>
                <h3 className="font-display font-bold text-base text-[#14213d] dark:text-[#f9fafb] uppercase tracking-wider">Starter</h3>
                <p className="text-[11px] text-[#14213d]/50 dark:text-[#beb7a7]/50 mt-1">For solo suppliers & roasters</p>
                <div className="mt-5 flex items-baseline text-[#14213d] dark:text-white font-mono">
                  <span className="text-3xl font-display font-bold">$0</span>
                  <span className="text-[10px] text-[#14213d]/50 dark:text-[#beb7a7]/50">/ month</span>
                </div>
                
                <ul className="mt-6 space-y-3.5 text-xs text-[#14213d]/60 dark:text-[#beb7a7]/60 font-light">
                  <li className="flex items-center gap-2"><Check size={13} className="text-[#d8a64c] shrink-0" /> Up to 50 active leads</li>
                  <li className="flex items-center gap-2"><Check size={13} className="text-[#d8a64c] shrink-0" /> Full Lead Timeline Log</li>
                  <li className="flex items-center gap-2"><Check size={13} className="text-[#d8a64c] shrink-0" /> Follow-up scheduler</li>
                  <li className="flex items-center gap-2"><Check size={13} className="text-[#d8a64c] shrink-0" /> Database-scoped RLS security</li>
                </ul>
              </div>
              <Link
                to="/signup"
                className="w-full py-2.5 rounded-xl border border-[#14213d]/15 dark:border-white/10 hover:bg-[#14213d]/5 dark:hover:bg-white/5 transition-all text-center text-[10px] font-bold uppercase tracking-wider text-[#14213d] dark:text-white"
              >
                Get Started
              </Link>
            </div>

            {/* Roast Master Tier */}
            <div className="rounded-2xl border-2 border-[#d8a64c] bg-[#f7f5ef]/40 dark:bg-[#0b1120]/40 p-6 flex flex-col justify-between space-y-8 relative">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#d8a64c] text-white text-[9px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                Most Popular
              </span>
              <div>
                <h3 className="font-display font-bold text-base text-[#14213d] dark:text-[#f9fafb] uppercase tracking-wider">Roast Master</h3>
                <p className="text-[11px] text-[#14213d]/50 dark:text-[#beb7a7]/50 mt-1">Scale up your sales team operations</p>
                <div className="mt-5 flex items-baseline text-[#14213d] dark:text-white font-mono">
                  <span className="text-3xl font-display font-bold">
                    ${isAnnual ? "39" : "49"}
                  </span>
                  <span className="text-[10px] text-[#14213d]/50 dark:text-[#beb7a7]/50">/ user / mo</span>
                </div>
                
                <ul className="mt-6 space-y-3.5 text-xs text-[#14213d]/60 dark:text-[#beb7a7]/60 font-light">
                  <li className="flex items-center gap-2"><Check size={13} className="text-[#d8a64c] shrink-0" /> Unlimited leads</li>
                  <li className="flex items-center gap-2"><Check size={13} className="text-[#d8a64c] shrink-0" /> AI Assistant Script drafts</li>
                  <li className="flex items-center gap-2"><Check size={13} className="text-[#d8a64c] shrink-0" /> Bulk CSV Import / Export</li>
                  <li className="flex items-center gap-2"><Check size={13} className="text-[#d8a64c] shrink-0" /> Multi-user workspace sharing</li>
                  <li className="flex items-center gap-2"><Check size={13} className="text-[#d8a64c] shrink-0" /> Priority support</li>
                </ul>
              </div>
              <Link
                to="/signup"
                className="w-full py-2.5 rounded-xl bg-[#d8a64c] text-white hover:bg-[#c19036] transition-all text-center text-[10px] font-bold uppercase tracking-wider shadow-sm hover:scale-[1.02]"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise Tier */}
            <div className="rounded-2xl border border-[#14213d]/5 dark:border-white/5 bg-[#f7f5ef]/40 dark:bg-[#0b1120]/40 p-6 flex flex-col justify-between space-y-8">
              <div>
                <h3 className="font-display font-bold text-base text-[#14213d] dark:text-[#f9fafb] uppercase tracking-wider">Enterprise</h3>
                <p className="text-[11px] text-[#14213d]/50 dark:text-[#beb7a7]/50 mt-1">For customized logistics workflows</p>
                <div className="mt-5 flex items-baseline text-[#14213d] dark:text-white font-mono">
                  <span className="text-3xl font-display font-bold">Custom</span>
                </div>
                
                <ul className="mt-6 space-y-3.5 text-xs text-[#14213d]/60 dark:text-[#beb7a7]/60 font-light">
                  <li className="flex items-center gap-2"><Check size={13} className="text-[#d8a64c] shrink-0" /> Everything in Roast Master</li>
                  <li className="flex items-center gap-2"><Check size={13} className="text-[#d8a64c] shrink-0" /> Custom database RLS scoping</li>
                  <li className="flex items-center gap-2"><Check size={13} className="text-[#d8a64c] shrink-0" /> API integration & Webhooks</li>
                  <li className="flex items-center gap-2"><Check size={13} className="text-[#d8a64c] shrink-0" /> Dedicated success manager</li>
                  <li className="flex items-center gap-2"><Check size={13} className="text-[#d8a64c] shrink-0" /> SLA & Security review</li>
                </ul>
              </div>
              <Link
                to="/login"
                className="w-full py-2.5 rounded-xl border border-[#14213d]/15 dark:border-white/10 hover:bg-[#14213d]/5 dark:hover:bg-white/5 transition-all text-center text-[10px] font-bold uppercase tracking-wider text-[#14213d] dark:text-white"
              >
                Contact Sales
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section id="faq" className="py-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-[#14213d] dark:text-[#f9fafb] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[#14213d]/50 dark:text-[#beb7a7]/60 font-light">
              Everything you need to know about getting started.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, index) => {
              const isOpen = !!openFaqs[index];
              return (
                <div
                  key={index}
                  className="rounded-xl border border-[#14213d]/5 dark:border-white/5 bg-white/70 dark:bg-[#111827]/70 overflow-hidden transition-colors shadow-sm"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-4.5 text-left font-bold text-[#14213d] dark:text-[#f9fafb] hover:bg-[#14213d]/5 dark:hover:bg-white/5 transition-colors cursor-pointer border-none"
                  >
                    <span className="font-display text-sm">{faq.q}</span>
                    {isOpen ? <ChevronUp size={14} className="text-[#d8a64c]" /> : <ChevronDown size={14} className="text-[#d8a64c]" />}
                  </button>
                  {isOpen && (
                    <div className="px-4.5 pb-4.5 text-xs text-[#14213d]/50 dark:text-[#beb7a7]/65 border-t border-[#14213d]/5 dark:border-white/5 pt-3 leading-relaxed font-light">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-[#14213d]/5 dark:border-white/5 bg-[#f7f5ef] dark:bg-[#0b1120] py-16 transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8.5 h-8.5 rounded-xl bg-[#d8a64c] flex items-center justify-center">
                  <Droplet size={18} className="text-[#14213d]" strokeWidth={2.5} />
                </div>
                <span className="font-display font-bold text-lg text-[#14213d] dark:text-[#f9fafb]">
                  BrewFlow
                </span>
              </div>
              <p className="text-xs text-[#14213d]/50 dark:text-[#beb7a7]/50 leading-relaxed font-light">
                The B2B Sales Operating System for physical wholesale brands. Scalable, secure, and intuitive.
              </p>
            </div>
            
            <div>
              <h4 className="font-display text-[10px] font-bold text-[#14213d] dark:text-white uppercase tracking-widest mb-3.5">Product</h4>
              <ul className="space-y-2 text-xs text-[#14213d]/50 dark:text-[#beb7a7]/65">
                <li><a href="#features" className="hover:text-[#14213d] dark:hover:text-white">Features</a></li>
                <li><a href="#demo" className="hover:text-[#14213d] dark:hover:text-white">Pipeline Demo</a></li>
                <li><a href="#pricing" className="hover:text-[#14213d] dark:hover:text-white">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-display text-[10px] font-bold text-[#14213d] dark:text-white uppercase tracking-widest mb-3.5">Resources</h4>
              <ul className="space-y-2 text-xs text-[#14213d]/50 dark:text-[#beb7a7]/65">
                <li><a href="#faq" className="hover:text-[#14213d] dark:hover:text-white">FAQs</a></li>
                <li><a href="#" className="hover:text-[#14213d] dark:hover:text-white">API Documentation</a></li>
                <li><a href="#" className="hover:text-[#14213d] dark:hover:text-white">Community Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-display text-[10px] font-bold text-[#14213d] dark:text-white uppercase tracking-widest mb-3.5">Legal</h4>
              <ul className="space-y-2 text-xs text-[#14213d]/50 dark:text-[#beb7a7]/65">
                <li><a href="#" className="hover:text-[#14213d] dark:hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#14213d] dark:hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-[#14213d] dark:hover:text-white">GDPR Compliance</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#14213d]/5 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center text-xs text-[#14213d]/40 dark:text-[#beb7a7]/40 gap-4">
            <p>© {new Date().getFullYear()} BrewFlow AI. All rights reserved.</p>
            <p className="font-mono text-[9px] text-[#14213d]/40">Built for GTM Operations & Wholesale Excellence</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
