import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import Card from "../components/Card";
import MetricBox from "../components/MetricBox";

export default function Dashboard({ user, onNavigate, showToast }) {
  const [weather, setWeather] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [todayFood, setTodayFood] = useState([]);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    // Load weather
    fetch("/.netlify/functions/weather")
      .then(r => r.ok ? r.json() : null)
      .then(setWeather)
      .catch(() => {});

    // Load today's metrics
    supabase
      .from("daily_metrics")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle()
      .then(({ data }) => setMetrics(data));

    // Load today's nutrition
    supabase
      .from("nutrition_log")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .order("created_at", { ascending: true })
      .then(({ data }) => setTodayFood(data || []));
  }, [user.id, today]);

  const totalCal = todayFood.reduce((s, f) => s + (f.calories || 0), 0);
  const totalProtein = todayFood.reduce((s, f) => s + (f.protein || 0), 0);
  const totalCarbs = todayFood.reduce((s, f) => s + (f.carbs || 0), 0);
  const totalFat = todayFood.reduce((s, f) => s + (f.fat || 0), 0);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  return (
    <div className="space-y-3 animate-fade-up">
      {/* Morning Briefing with Weather */}
      <div className="rounded-2xl p-4 border border-vc-cyan/10" style={{ background: "linear-gradient(135deg, rgba(6,214,160,0.06), rgba(59,130,246,0.06))" }}>
        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">{dateStr}</div>
        <div className="text-2xl font-bold tracking-tight mt-1 mb-3">
          {greeting}, <span className="text-vc-cyan">Scott</span> 💪
        </div>

        {weather && (
          <>
            <div className="flex items-center gap-3.5 p-3 bg-black/20 rounded-xl border border-vc-border mb-2">
              <div className="text-4xl font-extrabold font-mono tracking-tighter leading-none">
                {Math.round(weather.current?.temp_f || 0)}°
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{weather.current?.condition?.text || "—"}</div>
                <div className="text-[10px] text-zinc-500">
                  {weather.location || "Madison, MS"} • Feels {Math.round(weather.current?.feelslike_f || 0)}° • H {Math.round(weather.forecast?.maxtemp_f || 0)}° / L {Math.round(weather.forecast?.mintemp_f || 0)}°
                </div>
                <div className="flex gap-3 mt-1.5">
                  <span className="text-[10px] text-zinc-400">AQI <span className={`font-mono font-bold ${weather.aqi <= 2 ? "text-vc-cyan" : "text-vc-yellow"}`}>{weather.aqiLabel || "Good"}</span></span>
                  <span className="text-[10px] text-zinc-400">UV <span className="font-mono font-bold text-white">{weather.current?.uv ?? "—"}</span></span>
                  <span className="text-[10px] text-zinc-400">💧 <span className="font-mono font-bold text-white">{weather.current?.humidity ?? "—"}%</span></span>
                </div>
              </div>
            </div>

            <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1">
              {(weather.next_hours || []).map((h, i) => (
                <div key={i} className="min-w-[52px] text-center p-1.5 bg-black/20 rounded-lg border border-vc-border flex-shrink-0">
                  <div className="text-[9px] text-zinc-500">{h.time?.split(" ")[1] || "—"}</div>
                  <div className="text-sm font-bold font-mono mt-0.5">{Math.round(h.temp_f)}°</div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mt-2.5 p-2.5 rounded-xl text-[11px] text-zinc-400 leading-relaxed" style={{ background: "rgba(6,214,160,0.06)", border: "1px solid rgba(6,214,160,0.08)" }}>
          <span className="text-vc-cyan font-semibold">Today's Plan:</span> Recovery at 78% — you're green. It's a <span className="text-vc-cyan font-semibold">Strength day</span>. {weather ? `Weather clears by 2PM for an outdoor walk after. AQI is clean.` : ""} Go get it. 💪
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: "🍽️", label: "Log Food", action: () => onNavigate("food") },
          { icon: "⚖️", label: "Log Weight", action: () => onNavigate("profile") },
          { icon: "❤️", label: "Log BP", action: () => onNavigate("profile") },
          { icon: "🏋️", label: "Workout", action: () => onNavigate("workouts") },
          { icon: "😴", label: "Sleep", action: () => onNavigate("profile") },
          { icon: "📸", label: "Upload", action: () => onNavigate("ai") },
        ].map(q => (
          <button key={q.label} onClick={q.action} className="bg-white/[0.03] border border-vc-border rounded-xl py-3 px-2 text-center hover:bg-vc-cyan-dim hover:border-vc-cyan/20 transition-all">
            <div className="text-xl mb-1">{q.icon}</div>
            <div className="text-[11px] text-zinc-400 font-medium">{q.label}</div>
          </button>
        ))}
      </div>

      <div className="text-sm font-bold tracking-tight mt-4 mb-1">Today's Snapshot</div>

      {/* Body Composition - Withings API */}
      <Card title="Body Composition" subtitle="Withings — Live Sync" icon="⚖️" accent="cyan" badge="-70 lbs" badgeColor="cyan" onClick={() => onNavigate("profile")}
        right={<span className="px-1.5 py-0.5 rounded text-[8px] font-semibold bg-vc-blue-dim text-vc-blue border border-vc-blue/20">API</span>}>
        <div className="grid grid-cols-2 gap-2">
          <MetricBox label="Weight" value={metrics?.weight || "210"} unit="lbs" change="↓ 1.2 this week" changeType="up" />
          <MetricBox label="Muscle Mass" value={metrics?.muscle_mass || "168"} unit="lbs" change="↑ 0.4" changeType="up" />
          <MetricBox label="Visceral Fat" value={metrics?.visceral_fat || "8"} change="↓ Target: 7" changeType="up" />
          <MetricBox label="Body Fat" value={metrics?.body_fat || "19.8"} unit="%" change="↓ 0.3%" changeType="up" />
        </div>
      </Card>

      {/* Blood Pressure */}
      <Card title="Blood Pressure" subtitle="Morning & Evening Checks" icon="❤️" accent="red" badge={metrics?.bp_systolic ? "Logged" : "Pending"} badgeColor={metrics?.bp_systolic ? "cyan" : "orange"}>
        <div className="grid grid-cols-2 gap-2">
          <MetricBox label="AM Reading" value={metrics?.bp_systolic ? `${metrics.bp_systolic}/${metrics.bp_diastolic}` : "—/—"} change={metrics?.bp_systolic ? "Manual" : "⏰ Tap to log"} />
          <MetricBox label="Pulse" value={metrics?.resting_hr || "—"} unit="bpm" />
        </div>
      </Card>

      {/* Sleep & Recovery - WHOOP API */}
      <Card title="Sleep & Recovery" subtitle="WHOOP — Live Sync + CPAP" icon="🌙" accent="purple" badge={metrics?.sleep_score ? `${metrics.sleep_score}%` : "—"} badgeColor="cyan"
        right={<span className="px-1.5 py-0.5 rounded text-[8px] font-semibold bg-vc-blue-dim text-vc-blue border border-vc-blue/20">API</span>}>
        <div className="grid grid-cols-2 gap-2">
          <MetricBox label="Sleep Score" value={metrics?.sleep_score || "—"} unit="%" progress={metrics?.sleep_score || 0} progressColor="bg-vc-purple" />
          <MetricBox label="HRV" value={metrics?.hrv || "—"} unit="ms" />
        </div>
      </Card>

      {/* Nutrition Summary */}
      <Card title="Nutrition" subtitle="Today's Intake" icon="🍽️" accent="yellow" badge={`${totalCal.toLocaleString()} cal`} badgeColor="yellow" onClick={() => onNavigate("food")}>
        <div className="grid grid-cols-2 gap-2">
          <MetricBox label="Protein" value={totalProtein} unit="g" progress={(totalProtein / 200) * 100} progressColor="bg-vc-cyan" valueColor="text-vc-cyan" />
          <MetricBox label="Carbs" value={totalCarbs} unit="g" progress={(totalCarbs / 200) * 100} progressColor="bg-vc-orange" />
          <MetricBox label="Fat" value={totalFat} unit="g" progress={(totalFat / 80) * 100} progressColor="bg-vc-yellow" />
          <MetricBox label="Calories" value={totalCal.toLocaleString()} progress={(totalCal / 2200) * 100} progressColor="bg-gradient-to-r from-vc-yellow to-vc-orange" />
        </div>

        {todayFood.length > 0 && (
          <div className="mt-3 border-t border-vc-border pt-2 space-y-1">
            {todayFood.slice(-5).map(f => (
              <div key={f.id} className="flex items-center gap-2 text-xs py-1">
                <span className="text-zinc-500 font-mono w-12">{new Date(f.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="flex-1 text-zinc-300">{f.item_name}</span>
                <span className="text-vc-cyan font-mono font-semibold">{f.calories || 0}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

    </div>
  );
}
