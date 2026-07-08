import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";

export default function Landing({ theme, onToggleTheme }) {
  const { session } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if logged in is removed so users can view the landing page directly.
  
  // Interactive mock lead status changer state
  const [mockLeadStatus, setMockLeadStatus] = useState("Interested");
  
  // Interactive pricing period (monthly / annual)
  const [isAnnual, setIsAnnual] = useState(false);
  
  // Accordion FAQ active indexes
  const [openFaqs, setOpenFaqs] = useState({});

  useEffect(() => {
    // SEO setup
    document.title = "BrewFlow AI — Sales OS for Physical B2B Suppliers";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "BrewFlow AI is a B2B Sales Operating System for coffee roasters, bakeries, and physical product distributors to track leads, follow-ups, and log activity."
      );
    }
  }, []);

  const toggleFaq = (index) => {
    setOpenFaqs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Metrics that respond to the mock lead status
  const getMockMetrics = () => {
    let baseLeads = 42;
    let baseSamples = 12;
    let baseCustomers = 18;
    
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
    <div className="min-h-screen bg-paper-100 dark:bg-ink-950 text-ink-900 dark:text-paper-100 font-body selection:bg-gold-400 selection:text-ink-950">
      
      {/* 1. Header (Navbar) */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-paper-100/80 dark:bg-ink-950/80 border-b border-ink-100 dark:border-ink-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center">
              <Droplet size={18} className="text-ink-950" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-ink-900 dark:text-paper-100">
              BrewFlow <span className="text-gold-500 font-mono text-xs">AI</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-500 dark:text-ink-300">
            <a href="#features" className="hover:text-ink-900 dark:hover:text-paper-100 transition-colors">Features</a>
            <a href="#demo" className="hover:text-ink-900 dark:hover:text-paper-100 transition-colors">Product Tour</a>
            <a href="#pricing" className="hover:text-ink-900 dark:hover:text-paper-100 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-ink-900 dark:hover:text-paper-100 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg border border-ink-100 dark:border-ink-800 text-ink-500 dark:text-ink-300 hover:bg-ink-100/60 dark:hover:bg-ink-800/60 transition-all"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {session ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-lg bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors shadow-sm"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-block text-sm font-medium text-ink-500 dark:text-ink-300 hover:text-ink-900 dark:hover:text-paper-100 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-lg bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors shadow-sm"
                >
                  Start Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Text */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20">
                <Sparkles size={12} />
                Now in Private Beta
              </div>
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight text-ink-900 dark:text-paper-50 leading-[1.1]">
                The CRM Built for <br />
                <span className="text-gold-500">Physical B2B Sales</span>
              </h1>
              <p className="text-base sm:text-lg text-ink-500 dark:text-ink-300 max-w-xl mx-auto lg:mx-0">
                Stop running wholesale sales on memory and scattered spreadsheets. BrewFlow AI helps specialty roasters, bakeries, and food brands track leads, dispatch samples, log activity, and scale.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                {session ? (
                  <Link
                    to="/dashboard"
                    className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gold-500 text-ink-950 font-medium hover:bg-gold-400 transition-colors flex items-center justify-center gap-2 group shadow-md"
                  >
                    Go to workspace <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/signup"
                      className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gold-500 text-ink-950 font-medium hover:bg-gold-400 transition-colors flex items-center justify-center gap-2 group shadow-md"
                    >
                      Create Free Account <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      to="/login"
                      className="w-full sm:w-auto px-6 py-3 rounded-lg border border-ink-100 dark:border-ink-800 hover:bg-ink-100/60 dark:hover:bg-ink-800/60 font-medium text-sm transition-colors text-center"
                    >
                      Book a Demo
                    </Link>
                  </>
                )}
              </div>

              {/* Badges/Trust */}
              <div className="pt-6 border-t border-ink-100 dark:border-ink-800 max-w-md mx-auto lg:mx-0">
                <p className="text-xs font-mono uppercase tracking-wider text-ink-500 dark:text-ink-300 mb-3">
                  Loved by modern suppliers
                </p>
                <div className="flex justify-center lg:justify-start gap-8 items-center opacity-60 grayscale dark:invert">
                  <div className="flex items-center gap-1 font-display font-semibold tracking-tight text-sm">
                    <Coffee size={16} /> OATISH
                  </div>
                  <div className="flex items-center gap-1 font-display font-semibold tracking-tight text-sm">
                    <Package size={16} /> BEANERY CO.
                  </div>
                  <div className="flex items-center gap-1 font-display font-semibold tracking-tight text-sm">
                    <Store size={16} /> FLOUR & CO.
                  </div>
                </div>
              </div>
            </div>

            {/* Right Hero Interactive Mockup */}
            <div className="lg:col-span-6">
              <div className="relative p-2 rounded-2xl bg-paper-200/50 dark:bg-ink-900/50 border border-ink-100 dark:border-ink-800 shadow-2xl">
                
                {/* Simulated App Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-ink-100 dark:border-ink-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-coral-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-gold-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-moss-500"></span>
                  </div>
                  <span className="text-[10px] font-mono tracking-widest text-ink-500 dark:text-ink-300">
                    BREWFLOW_AI_DASHBOARD
                  </span>
                  <span className="w-4 h-4 rounded bg-ink-100 dark:bg-ink-800"></span>
                </div>

                {/* Dashboard Stats */}
                <div className="p-4 grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-paper-50 dark:bg-ink-950 border border-ink-100 dark:border-ink-800">
                    <p className="text-[10px] font-medium text-ink-500 dark:text-ink-300 uppercase">Leads</p>
                    <p className="text-xl font-display font-bold text-ink-900 dark:text-paper-100 font-mono mt-0.5">
                      {metrics.totalLeads}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-paper-50 dark:bg-ink-950 border border-ink-100 dark:border-ink-800">
                    <p className="text-[10px] font-medium text-ink-500 dark:text-ink-300 uppercase">Samples</p>
                    <p className="text-xl font-display font-bold text-ink-900 dark:text-paper-100 font-mono mt-0.5">
                      {metrics.samplesSent}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-paper-50 dark:bg-ink-950 border border-ink-100 dark:border-ink-800">
                    <p className="text-[10px] font-medium text-ink-500 dark:text-ink-300 uppercase">Customers</p>
                    <p className="text-xl font-display font-bold text-ink-900 dark:text-paper-100 font-mono mt-0.5 text-moss-500">
                      {metrics.customers}
                    </p>
                  </div>
                </div>

                {/* Interactive Demo Box */}
                <div className="mx-4 mb-4 p-4 rounded-xl bg-paper-50 dark:bg-ink-950 border border-ink-100 dark:border-ink-800">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-xs font-semibold text-ink-900 dark:text-paper-100">
                        Interactive Sandbox
                      </h3>
                      <p className="text-[10px] text-ink-500 dark:text-ink-300">
                        Click the buttons to change status and see dashboard update
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/25">
                      Live Preview
                    </span>
                  </div>

                  {/* Demo Lead Card */}
                  <div className="p-3.5 rounded-lg border border-ink-100 dark:border-ink-800 bg-paper-100 dark:bg-ink-900 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-ink-900 dark:text-paper-100">
                          Central Roast Coffee Co.
                        </h4>
                        <p className="text-xs text-ink-500 dark:text-ink-300">
                          Specialty Coffee Shop · Chicago, IL
                        </p>
                      </div>
                      
                      {/* Interactive pill */}
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide uppercase ${
                        mockLeadStatus === "Interested"
                          ? "bg-gold-500/15 text-gold-600 dark:text-gold-400"
                          : mockLeadStatus === "Sample Sent"
                          ? "bg-ink-100 dark:bg-ink-800 text-ink-950 dark:text-paper-100"
                          : "bg-moss-100 text-moss-500"
                      }`}>
                        {mockLeadStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-ink-500 dark:text-ink-300 font-mono">
                      <div>Consumption: <span className="text-ink-900 dark:text-paper-100 font-medium">80kg / mo</span></div>
                      <div>Monthly Revenue: <span className="text-ink-900 dark:text-paper-100 font-medium">$2,400</span></div>
                    </div>

                    {/* Interactive Button Bar */}
                    <div className="pt-2 border-t border-ink-100 dark:border-ink-800 flex gap-1.5">
                      <button
                        onClick={() => setMockLeadStatus("Interested")}
                        className={`flex-1 py-1 rounded text-[10px] font-medium transition-colors ${
                          mockLeadStatus === "Interested"
                            ? "bg-gold-500 text-ink-950"
                            : "bg-paper-50 dark:bg-ink-950 hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-500 dark:text-ink-300"
                        }`}
                      >
                        Interested
                      </button>
                      <button
                        onClick={() => setMockLeadStatus("Sample Sent")}
                        className={`flex-1 py-1 rounded text-[10px] font-medium transition-colors ${
                          mockLeadStatus === "Sample Sent"
                            ? "bg-gold-500 text-ink-950"
                            : "bg-paper-50 dark:bg-ink-950 hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-500 dark:text-ink-300"
                        }`}
                      >
                        Send Sample
                      </button>
                      <button
                        onClick={() => setMockLeadStatus("Customer")}
                        className={`flex-1 py-1 rounded text-[10px] font-medium transition-colors ${
                          mockLeadStatus === "Customer"
                            ? "bg-moss-500 text-paper-50"
                            : "bg-paper-50 dark:bg-ink-950 hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-500 dark:text-ink-300"
                        }`}
                      >
                        Close Won
                      </button>
                    </div>
                  </div>
                </div>

                {/* Simulated Audit Feed */}
                <div className="px-4 pb-4">
                  <div className="p-3 rounded-xl bg-paper-50 dark:bg-ink-950 border border-ink-100 dark:border-ink-800">
                    <p className="text-[10px] font-semibold text-ink-500 dark:text-ink-300 mb-2 flex items-center gap-1 uppercase tracking-wider">
                      <Activity size={10} /> Lead Activity Feed
                    </p>
                    <div className="space-y-2 text-[10px] font-mono">
                      <div className="flex items-center justify-between text-ink-500 dark:text-ink-300">
                        <span>Lead status updated to <span className="text-gold-500">{mockLeadStatus}</span></span>
                        <span>Just now</span>
                      </div>
                      <div className="flex items-center justify-between text-ink-500 dark:text-ink-300 opacity-60">
                        <span>New lead Central Roast Coffee Co. created</span>
                        <span>2 hours ago</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section id="features" className="py-20 bg-paper-50 dark:bg-ink-900 transition-colors border-y border-ink-100 dark:border-ink-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-ink-900 dark:text-paper-50">
              Built for the Operations of Physical Sales
            </h2>
            <p className="text-sm md:text-base text-ink-500 dark:text-ink-300 max-w-xl mx-auto">
              Traditional CRMs are designed for software. BrewFlow is tailored for the specific workflows of physical products, samples, and recurring orders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-xl border border-ink-100 dark:border-ink-800 bg-paper-100 dark:bg-ink-950 space-y-4 hover:border-gold-500/50 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-gold-500/10 text-gold-600 dark:text-gold-400 flex items-center justify-center group-hover:bg-gold-500 group-hover:text-ink-950 transition-colors">
                <Users size={20} />
              </div>
              <h3 className="font-display font-semibold text-lg text-ink-900 dark:text-paper-100">
                True B2B Scope
              </h3>
              <p className="text-sm text-ink-500 dark:text-ink-300">
                Track custom product interest, estimated monthly consumption, and current supplier info. Keep lead status synchronized from New to Sample Sent to customer.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl border border-ink-100 dark:border-ink-800 bg-paper-100 dark:bg-ink-950 space-y-4 hover:border-gold-500/50 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-gold-500/10 text-gold-600 dark:text-gold-400 flex items-center justify-center group-hover:bg-gold-500 group-hover:text-ink-950 transition-colors">
                <CalendarClock size={20} />
              </div>
              <h3 className="font-display font-semibold text-lg text-ink-900 dark:text-paper-100">
                Intelligent Follow-ups
              </h3>
              <p className="text-sm text-ink-500 dark:text-ink-300">
                Group follow-ups into Overdue, Today, and Upcoming lists. Never forget a client check-in or a scheduled sample dispatch again.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl border border-ink-100 dark:border-ink-800 bg-paper-100 dark:bg-ink-950 space-y-4 hover:border-gold-500/50 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-gold-500/10 text-gold-600 dark:text-gold-400 flex items-center justify-center group-hover:bg-gold-500 group-hover:text-ink-950 transition-colors">
                <Sparkles size={20} />
              </div>
              <h3 className="font-display font-semibold text-lg text-ink-900 dark:text-paper-100">
                AI GTM Assistant
              </h3>
              <p className="text-sm text-ink-500 dark:text-ink-300">
                Draft customized cold emails, call scripts, or WhatsApp follow-up messages based on the client's current supplier and product interest profile in seconds.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Product Tour/Interactive Section */}
      <section id="demo" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Graphics */}
            <div className="lg:col-span-6 order-2 lg:order-1 space-y-4">
              <div className="p-5 rounded-xl border border-ink-100 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 space-y-3 shadow-md">
                <div className="flex items-center justify-between pb-3 border-b border-ink-100 dark:border-ink-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-moss-500" />
                    <span className="font-display font-semibold text-sm">Security & RLS Enforced</span>
                  </div>
                  <span className="text-[10px] font-mono bg-moss-100 text-moss-500 px-2 py-0.5 rounded">
                    Passed
                  </span>
                </div>
                <p className="text-xs text-ink-500 dark:text-ink-300">
                  We use Supabase Postgres RLS policies directly. Your data is isolated at the database layer. No API breach can leak your leads or contacts to another organization.
                </p>
                <div className="p-3 bg-paper-100 dark:bg-ink-950 rounded-lg border border-ink-100 dark:border-ink-800 font-mono text-[9px] text-ink-500 dark:text-ink-300">
                  <span>CREATE POLICY org_security ON leads FOR ALL TO authenticated USING (organization_id = auth.uid());</span>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-ink-100 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 space-y-3 shadow-md">
                <div className="flex items-center gap-2 pb-3 border-b border-ink-100 dark:border-ink-800">
                  <Activity size={16} className="text-gold-500" />
                  <span className="font-display font-semibold text-sm">Real-time Lead Activity Timeline</span>
                </div>
                <p className="text-xs text-ink-500 dark:text-ink-300">
                  Whenever you update a lead's status, send a sample, or change key customer metrics, BrewFlow inserts an audit trail event log so your team has a shared timeline.
                </p>
              </div>
            </div>

            {/* Right Information */}
            <div className="lg:col-span-6 order-1 lg:order-2 space-y-6 text-center lg:text-left">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-ink-900 dark:text-paper-50 leading-tight">
                Designed to Move Physical Wholesale Pipelines
              </h2>
              <p className="text-sm md:text-base text-ink-500 dark:text-ink-300">
                BrewFlow AI simplifies physical inventory sample tracking and follow-up, giving your sales reps a clean overview.
              </p>
              <div className="space-y-3 max-w-lg mx-auto lg:mx-0 text-left">
                <div className="flex items-start gap-2.5 text-sm">
                  <div className="w-5 h-5 rounded bg-gold-500/10 text-gold-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={14} />
                  </div>
                  <p className="text-ink-500 dark:text-ink-300"><strong className="text-ink-900 dark:text-paper-100">Soft-Delete Safeguard:</strong> Leads are marked `is_deleted = true` instead of hard purging, preventing accidental sales history loss.</p>
                </div>
                <div className="flex items-start gap-2.5 text-sm">
                  <div className="w-5 h-5 rounded bg-gold-500/10 text-gold-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={14} />
                  </div>
                  <p className="text-ink-500 dark:text-ink-300"><strong className="text-ink-900 dark:text-paper-100">Live Estimates:</strong> Auto-calculate monthly consumption weights and potential customer value on the fly.</p>
                </div>
                <div className="flex items-start gap-2.5 text-sm">
                  <div className="w-5 h-5 rounded bg-gold-500/10 text-gold-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={14} />
                  </div>
                  <p className="text-ink-500 dark:text-ink-300"><strong className="text-ink-900 dark:text-paper-100">Unified UI:</strong> Dark and light theme modes render dynamically to keep eye strain low during long cold calling sessions.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Pricing Section */}
      <section id="pricing" className="py-20 bg-paper-50 dark:bg-ink-900 transition-colors border-y border-ink-100 dark:border-ink-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 mb-10">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-ink-900 dark:text-paper-50">
              Pricing Built for Growth
            </h2>
            <p className="text-sm md:text-base text-ink-500 dark:text-ink-300 max-w-xl mx-auto">
              Start tracking leads for free. Upgrade to roast-scale operations as your sales team expands.
            </p>

            {/* Toggle Monthly / Annual */}
            <div className="flex items-center justify-center gap-3 pt-4">
              <span className={`text-xs font-mono transition-colors ${!isAnnual ? "text-ink-900 dark:text-paper-100 font-semibold" : "text-ink-500"}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="w-12 h-6.5 rounded-full bg-ink-100 dark:bg-ink-800 p-1 flex items-center transition-colors relative"
                aria-label="Toggle pricing period"
              >
                <div className={`w-4.5 h-4.5 rounded-full bg-gold-500 transition-transform ${isAnnual ? "translate-x-5.5" : "translate-x-0"}`}></div>
              </button>
              <span className={`text-xs font-mono transition-colors ${isAnnual ? "text-ink-900 dark:text-paper-100 font-semibold" : "text-ink-500"}`}>
                Annually <span className="text-[10px] text-moss-500 font-bold bg-moss-100 px-1.5 py-0.5 rounded">Save 20%</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            
            {/* Starter Tier */}
            <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-paper-100 dark:bg-ink-950 p-6 flex flex-col justify-between space-y-8">
              <div>
                <h3 className="font-display font-semibold text-lg text-ink-900 dark:text-paper-100">Starter</h3>
                <p className="text-xs text-ink-500 dark:text-ink-300 mt-1">Perfect for solo founders & micro roasters</p>
                <div className="mt-4 flex items-baseline text-ink-900 dark:text-paper-50 font-mono">
                  <span className="text-4xl font-display font-bold">$0</span>
                  <span className="text-xs text-ink-500 dark:text-ink-300">/ forever</span>
                </div>
                
                <ul className="mt-6 space-y-3.5 text-xs text-ink-500 dark:text-ink-300">
                  <li className="flex items-center gap-2"><Check size={14} className="text-gold-500 shrink-0" /> Up to 50 active leads</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-gold-500 shrink-0" /> Full Lead Timeline Log</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-gold-500 shrink-0" /> Follow-up scheduler</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-gold-500 shrink-0" /> Database-scoped RLS security</li>
                </ul>
              </div>
              <Link
                to="/signup"
                className="w-full py-2.5 rounded-lg border border-ink-100 dark:border-ink-800 hover:bg-ink-100/60 dark:hover:bg-ink-800/60 transition-colors text-center text-xs font-semibold"
              >
                Get Started
              </Link>
            </div>

            {/* Roast Master Tier */}
            <div className="rounded-xl border-2 border-gold-500 bg-paper-100 dark:bg-ink-950 p-6 flex flex-col justify-between space-y-8 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-500 text-ink-950 text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </span>
              <div>
                <h3 className="font-display font-semibold text-lg text-ink-900 dark:text-paper-100">Roast Master</h3>
                <p className="text-xs text-ink-500 dark:text-ink-300 mt-1">Scale up your sales team operations</p>
                <div className="mt-4 flex items-baseline text-ink-900 dark:text-paper-50 font-mono">
                  <span className="text-4xl font-display font-bold">
                    ${isAnnual ? "39" : "49"}
                  </span>
                  <span className="text-xs text-ink-500 dark:text-ink-300">/ user / mo</span>
                </div>
                
                <ul className="mt-6 space-y-3.5 text-xs text-ink-500 dark:text-ink-300">
                  <li className="flex items-center gap-2"><Check size={14} className="text-gold-500 shrink-0" /> Unlimited leads</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-gold-500 shrink-0" /> AI Assistant Script drafts</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-gold-500 shrink-0" /> Bulk CSV Import / Export</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-gold-500 shrink-0" /> Multi-user workspace sharing</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-gold-500 shrink-0" /> Priority support</li>
                </ul>
              </div>
              <Link
                to="/signup"
                className="w-full py-2.5 rounded-lg bg-gold-500 text-ink-950 hover:bg-gold-400 transition-colors text-center text-xs font-semibold shadow"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise Tier */}
            <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-paper-100 dark:bg-ink-950 p-6 flex flex-col justify-between space-y-8">
              <div>
                <h3 className="font-display font-semibold text-lg text-ink-900 dark:text-paper-100">Enterprise</h3>
                <p className="text-xs text-ink-500 dark:text-ink-300 mt-1">For wholesale brands with custom workflows</p>
                <div className="mt-4 flex items-baseline text-ink-900 dark:text-paper-50 font-mono">
                  <span className="text-4xl font-display font-bold">Custom</span>
                </div>
                
                <ul className="mt-6 space-y-3.5 text-xs text-ink-500 dark:text-ink-300">
                  <li className="flex items-center gap-2"><Check size={14} className="text-gold-500 shrink-0" /> Everything in Roast Master</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-gold-500 shrink-0" /> Custom database RLS scoping</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-gold-500 shrink-0" /> API integration & Webhooks</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-gold-500 shrink-0" /> Dedicated success manager</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-gold-500 shrink-0" /> SLA & Security review</li>
                </ul>
              </div>
              <Link
                to="/login"
                className="w-full py-2.5 rounded-lg border border-ink-100 dark:border-ink-800 hover:bg-ink-100/60 dark:hover:bg-ink-800/60 transition-colors text-center text-xs font-semibold"
              >
                Contact Sales
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section id="faq" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-ink-900 dark:text-paper-50">
              Frequently Asked Questions
            </h2>
            <p className="text-sm md:text-base text-ink-500 dark:text-ink-300">
              Everything you need to know about setting up BrewFlow.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = !!openFaqs[index];
              return (
                <div
                  key={index}
                  className="rounded-xl border border-ink-100 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-5 text-left font-medium text-ink-900 dark:text-paper-100 hover:bg-ink-100/30 dark:hover:bg-ink-800/30 transition-colors"
                  >
                    <span className="font-display text-sm sm:text-base">{faq.q}</span>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-ink-500 dark:text-ink-300 border-t border-ink-100 dark:border-ink-800 pt-3">
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
      <footer className="border-t border-ink-100 dark:border-ink-800 bg-paper-100 dark:bg-ink-950 py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center">
                  <Droplet size={18} className="text-ink-950" strokeWidth={2.5} />
                </div>
                <span className="font-display font-bold text-lg text-ink-900 dark:text-paper-100">
                  BrewFlow
                </span>
              </div>
              <p className="text-xs text-ink-500 dark:text-ink-300">
                The B2B Sales Operating System for physical wholesale brands. Scalable, secure, and intuitive.
              </p>
            </div>
            
            <div>
              <h4 className="font-display text-xs font-semibold text-ink-900 dark:text-paper-100 uppercase tracking-widest mb-3">Product</h4>
              <ul className="space-y-2 text-xs text-ink-500 dark:text-ink-300">
                <li><a href="#features" className="hover:text-ink-900 dark:hover:text-paper-100">Features</a></li>
                <li><a href="#demo" className="hover:text-ink-900 dark:hover:text-paper-100">Pipeline Demo</a></li>
                <li><a href="#pricing" className="hover:text-ink-900 dark:hover:text-paper-100">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-display text-xs font-semibold text-ink-900 dark:text-paper-100 uppercase tracking-widest mb-3">Resources</h4>
              <ul className="space-y-2 text-xs text-ink-500 dark:text-ink-300">
                <li><a href="#faq" className="hover:text-ink-900 dark:hover:text-paper-100">FAQs</a></li>
                <li><a href="#" className="hover:text-ink-900 dark:hover:text-paper-100">API Documentation</a></li>
                <li><a href="#" className="hover:text-ink-900 dark:hover:text-paper-100">Community Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-display text-xs font-semibold text-ink-900 dark:text-paper-100 uppercase tracking-widest mb-3">Legal</h4>
              <ul className="space-y-2 text-xs text-ink-500 dark:text-ink-300">
                <li><a href="#" className="hover:text-ink-900 dark:hover:text-paper-100">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-ink-900 dark:hover:text-paper-100">Terms of Service</a></li>
                <li><a href="#" className="hover:text-ink-900 dark:hover:text-paper-100">GDPR Compliance</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-ink-100 dark:border-ink-800 flex flex-col sm:flex-row justify-between items-center text-xs text-ink-500 dark:text-ink-300 gap-4">
            <p>© {new Date().getFullYear()} BrewFlow AI. All rights reserved.</p>
            <p className="font-mono text-[10px] text-ink-500">Built for GTM Operations & Wholesale Excellence</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
