import { useState } from "react";
import { supabase } from "./supabase";
import { useSession } from "./hooks/useSession";
import { useToast } from "./hooks/useToast";
import AICoach from "./components/AICoach";
import TabBar from "./components/TabBar";
import Toast from "./components/Toast";
import Dashboard from "./pages/Dashboard";
import Food from "./pages/Food";
import AITab from "./pages/AITab";
import Workouts from "./pages/Workouts";
import Profile from "./pages/Profile";

function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("signin");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const go = async () => {
    setBusy(true);
    setMsg("");
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg("Check your email to confirm, then login.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e) {
      setMsg(e.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 relative z-10">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-vc-cyan to-vc-blue flex items-center justify-center text-2xl font-extrabold text-vc-bg shadow-lg shadow-vc-cyan/30">
            V
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight">
              Vital<span className="text-vc-cyan">Command</span> IQ
            </div>
            <div className="text-xs text-zinc-500">Personal Health Command Center</div>
          </div>
        </div>

        <div className="space-y-3">
          <input
            className="w-full p-3.5 rounded-xl bg-vc-card border border-vc-border text-sm"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && go()}
          />
          <input
            className="w-full p-3.5 rounded-xl bg-vc-card border border-vc-border text-sm"
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && go()}
          />

          {msg && (
            <div className={`text-xs p-2 rounded-lg ${msg.includes("Check") ? "text-vc-cyan bg-vc-cyan-dim" : "text-vc-red bg-vc-red-dim"}`}>
              {msg}
            </div>
          )}

          <button
            disabled={busy}
            onClick={go}
            className="w-full p-3.5 rounded-xl bg-gradient-to-r from-vc-cyan to-vc-blue text-vc-bg font-semibold text-sm disabled:opacity-50 hover:shadow-lg hover:shadow-vc-cyan/20 transition-all"
          >
            {mode === "signup" ? "Create Account" : "Login"}
          </button>

          <button
            disabled={busy}
            onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setMsg(""); }}
            className="w-full p-3.5 rounded-xl bg-vc-card border border-vc-border text-sm text-zinc-400 hover:bg-vc-card-hover transition-all"
          >
            {mode === "signup" ? "Already have an account? Login" : "New here? Create account"}
          </button>
        </div>

        <div className="text-[10px] text-zinc-600 text-center mt-6">
          Secure • Multi-device • Your data stays private
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading } = useSession();
  const { toast, showToast } = useToast();
  const [tab, setTab] = useState("dashboard");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-vc-cyan to-vc-blue flex items-center justify-center text-2xl font-extrabold text-vc-bg mx-auto mb-3 animate-pulse-glow">
            V
          </div>
          <div className="text-sm text-zinc-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  const navigate = (t) => { setTab(t); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div className="min-h-screen pb-24 relative z-10">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-vc-bg/85 backdrop-blur-xl border-b border-vc-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-vc-cyan to-vc-blue flex items-center justify-center text-sm font-extrabold text-vc-bg shadow-md shadow-vc-cyan/20">
              V
            </div>
            <div className="text-base font-bold tracking-tight">
              Vital<span className="text-vc-cyan">Command</span> IQ
            </div>
          </div>
          <button onClick={() => showToast("🔄 Syncing...")} className="w-8 h-8 rounded-lg bg-vc-card border border-vc-border flex items-center justify-center text-sm text-zinc-400 hover:text-white transition-colors">
            🔄
          </button>
        </div>
      </header>

      {/* Page Content */}
      <main className="max-w-lg mx-auto px-4 py-4">
        {tab === "dashboard" && <Dashboard user={user} onNavigate={navigate} showToast={showToast} />}
        {tab === "food" && <Food user={user} showToast={showToast} />}
        {tab === "ai" && <AITab user={user} showToast={showToast} />}
        {tab === "workouts" && <Workouts user={user} showToast={showToast} />}
        {tab === "profile" && <Profile user={user} showToast={showToast} />}
      </main>

      <AICoach />
      <TabBar active={tab} onChange={navigate} />
      <Toast message={toast} />
    </div>
  );
}
