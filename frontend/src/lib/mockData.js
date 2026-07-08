// SPRINT 1 NOTE:
// This file exists purely so the UI has something to render. Every field
// here matches the Lead schema from your project doc (Sprint 4), on purpose.
// In Sprint 2 we build a real MongoDB collection with this exact shape,
// and in Sprint 3 the pages below swap `mockLeads` for a `fetch("/api/leads")`
// call — no component will need to change, only where the data comes from.

export const mockLeads = [
  {
    id: "1",
    businessName: "The Daily Grind Cafe",
    contactPerson: "Aditi Rao",
    phone: "+91 98200 11223",
    email: "aditi@dailygrind.in",
    businessType: "Cafe",
    status: "Interested",
    nextFollowUp: "2026-07-10",
    tags: ["oat-milk", "high-volume"],
  },
  {
    id: "2",
    businessName: "Northfield Hotels Group",
    contactPerson: "Marcus Lee",
    phone: "+91 98450 88771",
    email: "procurement@northfieldhotels.com",
    businessType: "Hotel",
    status: "Sample Sent",
    nextFollowUp: "2026-07-09",
    tags: ["breakfast-buffet"],
  },
  {
    id: "3",
    businessName: "Sunrise Bakery Co.",
    contactPerson: "Priya Menon",
    phone: "+91 90210 33441",
    email: "priya@sunrisebakery.co",
    businessType: "Bakery",
    status: "Negotiation",
    nextFollowUp: "2026-07-08",
    tags: ["bulk-order"],
  },
  {
    id: "4",
    businessName: "Vertex Office Pantry",
    contactPerson: "Rohan Shah",
    phone: "+91 99887 65432",
    email: "rohan@vertexworks.com",
    businessType: "Office",
    status: "Customer",
    nextFollowUp: "2026-07-15",
    tags: ["recurring", "corporate"],
  },
  {
    id: "5",
    businessName: "Coastline Roasters",
    contactPerson: "Fatima Al-Sayed",
    phone: "+91 97654 12300",
    email: "fatima@coastlineroasters.com",
    businessType: "Coffee Chain",
    status: "New Lead",
    nextFollowUp: "2026-07-11",
    tags: ["multi-location"],
  },
  {
    id: "6",
    businessName: "Green Leaf Organics",
    contactPerson: "Devika Nair",
    phone: "+91 96543 22109",
    email: "devika@greenleaforganics.in",
    businessType: "Organic Store",
    status: "Contacted",
    nextFollowUp: "2026-07-12",
    tags: ["organic", "eco"],
  },
  {
    id: "7",
    businessName: "Union Street Diner",
    contactPerson: "Tom Bakshi",
    phone: "+91 95432 10988",
    email: "tom@unionstreetdiner.com",
    businessType: "Restaurant",
    status: "Lost",
    nextFollowUp: null,
    tags: ["price-sensitive"],
  },
];

export const mockStats = {
  totalLeads: 142,
  interestedLeads: 38,
  customers: 24,
  callsToday: 6,
  conversionRate: "16.9%",
};

export const mockActivity = [
  { id: "a1", text: "Sample sent to Northfield Hotels Group", time: "2h ago" },
  { id: "a2", text: "Sunrise Bakery Co. moved to Negotiation", time: "5h ago" },
  { id: "a3", text: "Call logged with Coastline Roasters", time: "Yesterday" },
  { id: "a4", text: "Vertex Office Pantry marked as Customer", time: "2 days ago" },
];
