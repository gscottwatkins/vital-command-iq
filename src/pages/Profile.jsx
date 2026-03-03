import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import Card from "../components/Card";
import MetricBox from "../components/MetricBox";
import Modal from "../components/Modal";

export default function Profile({ user, showToast }) {
  const [metrics, setMetrics] = useState(null);
  const [bpOpen, setBpOpen] = useState(false);
  const [bodyOpen, setBodyOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  // BP form
  const [bpSys, setBpSys] = useState("");
  const [bpDia, setBpDia] = useState("");
  const [bpPulse, setBpPulse] = useState("");
  const [bpTime, setBpTime] = useState("AM");

  // Body comp form
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [muscle, setMuscle] = useState("");
  const [visceral, setVisceral] = useState("");
  const [ecg, setEcg] = useState("");

  const loadMetrics = async () => {
    const { data } = await supabase
      .from("daily_metrics")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle();
    setMetrics(data);
  };

  useEffect(() => { loadMetrics(); }, []);

  // Save BP
  const saveBP = async () => {
    const sys = parseFloat(bpSys);
    const dia = parseFloat(bpDia);
    if (!sys || !dia) { showToast("Enter BP values"); return; }

    const updates = {
      bp_systolic: sys,
      bp_diastolic: dia,
      resting_hr: parseFloat(bpPulse) || null,
    };

    const { error } = await supabase
      .from("daily_metrics")
      .upsert({ user_id: user.id, date: today, ...updates }, { onConflict: "user_id,date" });

    if (error) showToast("Error: " + error.message);
    else {
      showToast(`❤️ BP Saved: ${sys}/${dia} (${bpTime})`);
      setBpOpen(false);
      setBpSys(""); setBpDia(""); setBpPulse("");
      loadMetrics();
    }
  };

  // Save body comp
  const saveBody = async () => {
    if (!weight) { showToast("Enter weight"); return; }

    const updates = {
      weight: parseFloat(weight) || null,
      body_fat: parseFloat(bodyFat) || null,
      muscle_mass: parseFloat(muscle) || null,
      visceral_fat: parseFloat(visceral) || null,
      notes: ecg || null,
    };

    const { error } = await supabase
      .from("daily_metrics")
      .upsert({ user_id: user.id, date: today, ...updates }, { onConflict: "user_id,date" });

    if (error) showToast("Error: " + error.message);
    else {
      showToast(`⚖️ Body comp logged: ${weight} lbs`);
      setBodyOpen(false);
      setWeight(""); setBodyFat(""); setMuscle(""); setVisceral(""); setEcg("");
      loadMetrics();
    }
  };

  const signOut = () => supabase.auth.signOut();

  return (
    <div className="space-y-3 animate-fade-up">
      <div className="text-sm font-bold tracking-tight">Health & Profile</div>

      {/* Quick Log Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => setBodyOpen(true)} className="p-4 bg-vc-card border border-vc-border rounded-xl text-center hover:bg-vc-cyan-dim hover:border-vc-cyan/20 transition-all">
          <div className="text-xl mb-1">⚖️</div>
          <div className="text-sm font-semibold">Log Body Comp</div>
          <div className="text-[11px] text-zinc-500">Weight, fat, muscle</div>
        </button>
        <button onClick={() => setBpOpen(true)} className="p-4 bg-vc-card border border-vc-border rounded-xl text-center hover:bg-vc-red-dim hover:border-vc-red/20 transition-all">
          <div className="text-xl mb-1">❤️</div>
          <div className="text-sm font-semibold">Log Blood Pressure</div>
          <div className="text-[11px] text-zinc-500">AM / PM reading</div>
        </button>
      </div>

      {/* Today's Metrics Summary */}
      <Card title="Today's Metrics" subtitle={today} icon="📊" accent="cyan">
        <div className="grid grid-cols-2 gap-2">
          <MetricBox label="Weight" value={metrics?.weight || "—"} unit="lbs" />
          <MetricBox label="Body Fat" value={metrics?.body_fat || "—"} unit="%" />
          <MetricBox label="Muscle Mass" value={metrics?.muscle_mass || "—"} unit="lbs" />
          <MetricBox label="Visceral Fat" value={metrics?.visceral_fat || "—"} />
          <MetricBox label="BP" value={metrics?.bp_systolic ? `${metrics.bp_systolic}/${metrics.bp_diastolic}` : "—"} />
          <MetricBox label="Resting HR" value={metrics?.resting_hr || "—"} unit="bpm" />
          <MetricBox label="HRV" value={metrics?.hrv || "—"} unit="ms" />
          <MetricBox label="Sleep Score" value={metrics?.sleep_score || "—"} unit="%" />
        </div>
      </Card>

      {/* Journey Progress */}
      <Card title="Your Journey: 280 → 210" subtitle="70 lbs lost • Muscle preserved" icon="🏆" accent="purple" badge="82%" badgeColor="cyan">
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="text-center">
            <div className="text-[10px] text-zinc-500">Start</div>
            <div className="text-sm font-bold font-mono">280</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-zinc-500">Current</div>
            <div className="text-sm font-bold font-mono text-vc-cyan">{metrics?.weight || 210}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-zinc-500">Goal</div>
            <div className="text-sm font-bold font-mono">195</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-zinc-500">To Go</div>
            <div className="text-sm font-bold font-mono text-vc-orange">{(metrics?.weight || 210) - 195}</div>
          </div>
        </div>
        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-vc-cyan to-vc-blue progress-fill" style={{ width: `${Math.min(100, ((280 - (metrics?.weight || 210)) / 85) * 100)}%` }} />
        </div>
        <div className="text-center mt-2 text-xs text-vc-cyan font-semibold">
          {Math.round(((280 - (metrics?.weight || 210)) / 85) * 100)}% to goal 🔥
        </div>
      </Card>

      {/* Account */}
      <Card title="Account" icon="👤" accent="blue">
        <div className="text-sm text-zinc-400">Signed in as:</div>
        <div className="font-semibold text-sm mt-0.5">{user.email}</div>
        <button onClick={signOut} className="mt-3 w-full py-3 rounded-xl bg-white/[0.03] border border-vc-border text-sm text-zinc-400 hover:bg-vc-red-dim hover:text-vc-red hover:border-vc-red/20 transition-all">
          Sign Out
        </button>
      </Card>

      {/* BP Modal */}
      <Modal open={bpOpen} onClose={() => setBpOpen(false)} title="❤️ Log Blood Pressure">
        <div className="space-y-3">
          <div className="flex gap-2">
            {["AM", "PM"].map(t => (
              <button key={t} onClick={() => setBpTime(t)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-all ${bpTime === t ? "bg-vc-cyan-dim border-vc-cyan/30 text-vc-cyan" : "bg-white/[0.03] border-vc-border text-zinc-400"}`}>
                {t === "AM" ? "🌅 Morning" : "🌙 Evening"}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Systolic (top)</label>
              <input className="w-full p-3 rounded-xl bg-white/[0.03] border border-vc-border text-sm" type="number" placeholder="120" value={bpSys} onChange={e => setBpSys(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Diastolic (bottom)</label>
              <input className="w-full p-3 rounded-xl bg-white/[0.03] border border-vc-border text-sm" type="number" placeholder="78" value={bpDia} onChange={e => setBpDia(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Pulse (bpm)</label>
            <input className="w-full p-3 rounded-xl bg-white/[0.03] border border-vc-border text-sm" type="number" placeholder="62" value={bpPulse} onChange={e => setBpPulse(e.target.value)} />
          </div>
          <button onClick={saveBP} className="w-full py-3 rounded-xl bg-gradient-to-r from-vc-cyan to-emerald-500 text-vc-bg font-semibold text-sm">
            💾 Save Reading
          </button>
        </div>
      </Modal>

      {/* Body Comp Modal */}
      <Modal open={bodyOpen} onClose={() => setBodyOpen(false)} title="⚖️ Log Body Composition">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Weight (lbs)</label>
              <input className="w-full p-3 rounded-xl bg-white/[0.03] border border-vc-border text-sm" type="number" step="0.1" placeholder="210" value={weight} onChange={e => setWeight(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Body Fat %</label>
              <input className="w-full p-3 rounded-xl bg-white/[0.03] border border-vc-border text-sm" type="number" step="0.1" placeholder="19.8" value={bodyFat} onChange={e => setBodyFat(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Muscle Mass (lbs)</label>
              <input className="w-full p-3 rounded-xl bg-white/[0.03] border border-vc-border text-sm" type="number" step="0.1" placeholder="168" value={muscle} onChange={e => setMuscle(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Visceral Fat</label>
              <input className="w-full p-3 rounded-xl bg-white/[0.03] border border-vc-border text-sm" type="number" placeholder="8" value={visceral} onChange={e => setVisceral(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">ECG/EKG Reading</label>
            <input className="w-full p-3 rounded-xl bg-white/[0.03] border border-vc-border text-sm" placeholder="Normal sinus rhythm" value={ecg} onChange={e => setEcg(e.target.value)} />
          </div>
          <button onClick={saveBody} className="w-full py-3 rounded-xl bg-gradient-to-r from-vc-cyan to-emerald-500 text-vc-bg font-semibold text-sm">
            💾 Save Body Comp
          </button>
        </div>
      </Modal>
    </div>
  );
}
