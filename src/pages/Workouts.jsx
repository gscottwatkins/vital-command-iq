import { useState } from "react";
import Card from "../components/Card";
import MetricBox from "../components/MetricBox";

const WORKOUTS = [
  { section: "🔔 Kettlebell Work" },
  { name: "Swings + Goblet Squats + Halos", detail: "Moderate reps • Controlled tempo • Form focus", icon: "🔔", color: "bg-vc-orange-dim", tag: "Compound", tagColor: "orange" },
  { name: "SA Rows + Floor Press + RDLs", detail: "Unilateral strength • Core engagement", icon: "🔔", color: "bg-vc-orange-dim", tag: "Pull", tagColor: "orange" },
  { name: "Carries + Swings + Goblet Squats", detail: "Grip, core, posterior chain", icon: "🔔", color: "bg-vc-orange-dim", tag: "Full Body", tagColor: "cyan" },
  { section: "🔩 Dumbbell Work" },
  { name: "Flat Bench + Incline + Shoulder Press", detail: "Clean structured sets • Progressive overload", icon: "🔩", color: "bg-vc-blue-dim", tag: "Push", tagColor: "orange" },
  { name: "Rows + RDLs + Step-ups", detail: "Strength emphasis • No joint abuse", icon: "🔩", color: "bg-vc-blue-dim", tag: "Pull/Lower", tagColor: "blue" },
  { name: "Bulgarian Splits + Step-ups + RDLs", detail: "Unilateral lower • Controlled volume", icon: "🔩", color: "bg-vc-blue-dim", tag: "Legs", tagColor: "purple" },
  { section: "🏋️ Barbell / Rack" },
  { name: "Squats + Bench + Deadlift Variation", detail: "Strength-focused • Controlled • Not ego lifting", icon: "🏋️", color: "bg-vc-red-dim", tag: "Big 3", tagColor: "red" },
  { section: "🫀 Conditioning" },
  { name: "Assault Bike — Short Intervals", detail: "30s on / 30s off or Tabata", icon: "🚴", color: "bg-vc-blue-dim", tag: "HIIT", tagColor: "blue" },
  { name: "Assault Rower", detail: "Steady or intervals • Great response", icon: "🚣", color: "bg-vc-blue-dim", tag: "Cardio", tagColor: "blue" },
  { name: "Elliptical — Tempo / Steady State", detail: "Lower joint stress • Longer sessions", icon: "🏃", color: "bg-vc-cyan-dim", tag: "Zone 2", tagColor: "cyan" },
  { name: "Walking — 1–2 Miles", detail: "Outdoor when weather is good", icon: "🚶", color: "bg-vc-cyan-dim", tag: "Recovery", tagColor: "cyan" },
  { section: "🧘 Recovery" },
  { name: "Sauna Session", detail: "Very consistent • HRV + recovery boost", icon: "🧖", color: "bg-vc-orange-dim" },
  { name: "Cold Plunge", detail: "Strategic • Post-workout or recovery", icon: "🧊", color: "bg-vc-blue-dim" },
  { name: "Mobility & Stretching", detail: "Active recovery • Joint health", icon: "🧘", color: "bg-vc-purple-dim" },
];

export default function Workouts({ user, showToast }) {
  const [active, setActive] = useState(null);

  const startWorkout = (workout) => {
    setActive(workout.name);
    showToast(`🏋️ Started: ${workout.name}`);
  };

  return (
    <div className="space-y-3 animate-fade-up">
      <div className="text-sm font-bold tracking-tight">Training Command</div>

      {/* Weekly Structure */}
      <Card title="Weekly Structure" subtitle="4 Strength • 2 Conditioning • 1 Recovery" icon="📅" accent="orange">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {[
            { d: "Mon", i: "💪", t: "Upper", c: "str" }, { d: "Tue", i: "🚴", t: "Cond", c: "cond" },
            { d: "Wed", i: "🦵", t: "Lower", c: "str" }, { d: "Thu", i: "💪", t: "Upper", c: "str" },
            { d: "Fri", i: "🚣", t: "Cond", c: "cond" }, { d: "Sat", i: "🔥", t: "Full", c: "str" },
            { d: "Sun", i: "🧘", t: "Rest", c: "rest" },
          ].map(day => (
            <div key={day.d} className={`text-center py-2 rounded-lg border border-vc-border ${day.c === "str" ? "bg-vc-orange-dim border-vc-orange/20" : day.c === "cond" ? "bg-vc-blue-dim border-vc-blue/20" : "bg-vc-cyan-dim border-vc-cyan/20"}`}>
              <div className="text-[8px] text-zinc-500 uppercase">{day.d}</div>
              <div className="text-sm">{day.i}</div>
              <div className={`text-[8px] font-semibold ${day.c === "str" ? "text-vc-orange" : day.c === "cond" ? "text-vc-blue" : "text-vc-cyan"}`}>{day.t}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <span className="text-[9px] px-2 py-0.5 rounded bg-vc-purple-dim text-vc-purple">🧖 Sauna integrated</span>
          <span className="text-[9px] px-2 py-0.5 rounded bg-vc-blue-dim text-vc-blue">🧊 Cold plunge strategic</span>
          <span className="text-[9px] px-2 py-0.5 rounded bg-vc-cyan-dim text-vc-cyan">🚶 Walking layered in</span>
        </div>
      </Card>

      {/* Today's Activity */}
      <Card title="Today's Activity" subtitle="WHOOP Strain — Live" icon="🔥" accent="orange"
        right={<span className="px-1.5 py-0.5 rounded text-[8px] font-semibold bg-vc-blue-dim text-vc-blue border border-vc-blue/20">API</span>}>
        <div className="grid grid-cols-2 gap-2">
          <MetricBox label="Strain" value="—" change="Log workout to track" />
          <MetricBox label="Calories Burned" value="—" />
          <MetricBox label="Active Minutes" value="—" unit="min" />
          <MetricBox label="Avg Heart Rate" value="—" unit="bpm" />
        </div>
      </Card>

      {/* Workout List */}
      {WORKOUTS.map((w, i) => w.section ? (
        <div key={i} className="text-[11px] text-vc-orange font-semibold uppercase tracking-wider mt-3 mb-1 pl-0.5">{w.section}</div>
      ) : (
        <button key={i} onClick={() => startWorkout(w)} className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${active === w.name ? "bg-vc-cyan-dim border-vc-cyan/30" : "bg-white/[0.02] border-vc-border hover:bg-vc-card-hover"}`}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${w.color}`}>{w.icon}</div>
          <div className="flex-1">
            <div className="text-xs font-semibold">{w.name}</div>
            <div className="text-[10px] text-zinc-500">{w.detail}</div>
            {w.tag && <span className={`text-[9px] px-1.5 py-0.5 rounded mt-0.5 inline-block bg-vc-${w.tagColor}-dim text-vc-${w.tagColor}`}>{w.tag}</span>}
          </div>
          <div className="text-vc-cyan text-sm">{active === w.name ? "✓" : "▶"}</div>
        </button>
      ))}

      {/* Training Identity */}
      <Card title="Your Training Identity" subtitle="Structured. Measured. Purpose-driven." icon="🎯" accent="purple">
        <div className="text-[11px] text-zinc-400 leading-relaxed">
          <span className="text-vc-cyan font-semibold">Priorities:</span> VO2 improvement • HRV stability • Strength progression • Body fat reduction • Muscle retention • BP stability
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {["Data-driven", "Performance-oriented", "Competitive with self", "Strength > aesthetics", "Recovery-aware"].map(t => (
            <span key={t} className="text-[9px] px-2 py-0.5 rounded bg-white/[0.03] border border-vc-border text-zinc-400">{t}</span>
          ))}
        </div>
        <div className="text-[10px] text-zinc-500 italic mt-2">Goal: Feel strong. Controlled. Elite. Not wrecked.</div>
      </Card>
    </div>
  );
}
