import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import FollowUps from "./pages/FollowUps";
import AIAssistant from "./pages/AIAssistant";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CheckEmail from "./pages/CheckEmail";
import Landing from "./pages/Landing";
import LeadDetail from "./pages/LeadDetail";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import { getInitialTheme, applyTheme } from "./lib/theme";

const TITLES = {
  "/dashboard": "Dashboard",
  "/leads": "Leads",
  "/follow-ups": "Follow-ups",
  "/ai-assistant": "AI Assistant",
  "/settings": "Settings",
};

// WHY THIS COMPONENT EXISTS:
// Wraps any page that should only be visible to logged-in users. If
// there's no session, it redirects to /login instead of rendering the
// page — this is the frontend half of "protected routes." (The backend
// half is Supabase's Row Level Security, which we set up next — a
// curious user editing the URL still can't fetch data they don't own.)
function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper-100 dark:bg-ink-950 text-ink-500 dark:text-ink-300 text-sm">
        Loading…
      </div>
    );
  }
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

function AppShell({ theme, setTheme }) {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-paper-100 dark:bg-ink-950">
      <Sidebar onSignOut={signOut} />
      <div className="md:pl-64">
        <Topbar
          title={TITLES[location.pathname] ?? "BrewFlow"}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        />
        <main className="p-4 md:p-8">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/leads/:id" element={<LeadDetail />} />
            <Route path="/follow-ups" element={<FollowUps />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/settings" element={<Settings />} />
            {/* Catch any invalid paths inside the dashboard shell and redirect to /dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function Router({ theme, setTheme }) {
  return (
    <Routes>
      <Route path="/" element={<Landing theme={theme} onToggleTheme={setTheme} />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/check-email" element={<CheckEmail />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppShell theme={theme} setTheme={setTheme} />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Router theme={theme} setTheme={setTheme} />
      </AuthProvider>
    </BrowserRouter>
  );
}
