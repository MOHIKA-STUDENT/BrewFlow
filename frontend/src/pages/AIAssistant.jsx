import { useState } from "react";
import { Mail, MessageCircle, Phone, Sparkles, ArrowRight } from "lucide-react";

// Sprint 7 spec: generate a sales pitch, cold email, WhatsApp message,
// or call-opening script. No AI call exists yet — this proves out the
// interaction shape (pick a generator, fill context, get output) so
// wiring the real OpenAI/Gemini call in Sprint 7 is a drop-in swap.
const GENERATORS = [
  { id: "email", label: "Cold Email", icon: Mail, desc: "A first-touch email for a new lead." },
  { id: "whatsapp", label: "WhatsApp Message", icon: MessageCircle, desc: "Short, casual outreach." },
  { id: "call", label: "Call Opening Script", icon: Phone, desc: "First 30 seconds of a cold call." },
];

export default function AIAssistant() {
  const [active, setActive] = useState("email");
  const [businessName, setBusinessName] = useState("");
  const [output, setOutput] = useState("");

  const activeGen = GENERATORS.find((g) => g.id === active);

  function handleGenerate() {
    // Placeholder only — Sprint 7 replaces this with a real API call to
    // POST /api/ai/generate. Kept obviously fake so it's never mistaken
    // for a working feature.
    setOutput(
      businessName
        ? `[Sprint 7 will generate a real ${activeGen.label.toLowerCase()} for "${businessName}" here.]`
        : `Enter a business name, then Generate — this is a UI placeholder for now.`
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-1 space-y-2">
        {GENERATORS.map((g) => (
          <button
            key={g.id}
            onClick={() => setActive(g.id)}
            className={`w-full text-left flex items-start gap-3 p-4 rounded-xl border transition-colors ${
              active === g.id
                ? "border-gold-500 bg-gold-500/10"
                : "border-ink-100 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 hover:bg-ink-100/40 dark:hover:bg-ink-800/40"
            }`}
          >
            <g.icon size={18} className="text-gold-600 dark:text-gold-400 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-ink-900 dark:text-paper-100">{g.label}</p>
              <p className="text-xs text-ink-500 dark:text-ink-300">{g.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="lg:col-span-2 rounded-xl border border-ink-100 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 p-5 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-gold-600 dark:text-gold-400" />
          <h2 className="font-display font-semibold text-ink-900 dark:text-paper-100">
            {activeGen.label}
          </h2>
        </div>

        <label className="text-xs font-medium text-ink-500 dark:text-ink-300 mb-1.5">
          Business name
        </label>
        <input
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="e.g. The Daily Grind Cafe"
          className="px-3 py-2.5 rounded-lg border border-ink-100 dark:border-ink-800 bg-paper-100 dark:bg-ink-950 text-sm outline-none focus:border-gold-500 text-ink-900 dark:text-paper-100 placeholder:text-ink-300 mb-4"
        />

        <button
          onClick={handleGenerate}
          className="self-start flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gold-500 text-ink-950 text-sm font-medium hover:bg-gold-400 transition-colors mb-5"
        >
          Generate <ArrowRight size={15} />
        </button>

        <div className="flex-1 rounded-lg bg-paper-100 dark:bg-ink-950 border border-dashed border-ink-100 dark:border-ink-800 p-4 text-sm text-ink-500 dark:text-ink-300 min-h-32">
          {output || "Output will appear here."}
        </div>
      </div>
    </div>
  );
}
