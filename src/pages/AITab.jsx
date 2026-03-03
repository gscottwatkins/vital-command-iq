import { useState } from "react";
import { supabase } from "../supabase";
import Card from "../components/Card";

const DEVICE_TYPES = [
  { key: "garmin", label: "Garmin", emoji: "⌚" },
  { key: "whoop", label: "WHOOP", emoji: "🟢" },
  { key: "bp", label: "Blood Pressure", emoji: "❤️" },
  { key: "cpap", label: "CPAP / myAir", emoji: "💨" },
  { key: "withings", label: "Withings", emoji: "⚖️" },
  { key: "oura", label: "Oura Ring", emoji: "💍" },
  { key: "meal", label: "Food Photo", emoji: "🍽️" },
];

export default function AITab({ user, showToast }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [context, setContext] = useState("garmin");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setSaved(false);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  };

  const analyze = async () => {
    if (!file) return;
    setBusy(true);
    setResult(null);
    setSaved(false);
    try {
      const dataUrl = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      const [meta, b64] = dataUrl.split(",");
      const mediaType = meta.match(/data:(.*);base64/)?.[1] || "image/jpeg";

      const r = await fetch("/.netlify/functions/ai-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: b64, mediaType, context }),
      });
      const data = await r.json();
      setResult(data.parsed || data);
    } catch (e) {
      setResult({ error: e.message });
    } finally {
      setBusy(false);
    }
  };

  // Save parsed metrics to daily_metrics
  const saveMetrics = async () => {
    if (!result?.items) return;
    const today = new Date().toISOString().slice(0, 10);

    // Build an update object from parsed items
    const updates = {};
    result.items.forEach(item => {
      const key = item.metric_name;
      const val = parseFloat(item.value);
      if (!isNaN(val) && item.confidence >= 0.5) {
        // Map metric names to database columns
        const colMap = {
          weight: "weight", body_fat: "body_fat", visceral_fat: "visceral_fat",
          muscle_mass: "muscle_mass", hrv: "hrv", resting_hr: "resting_hr",
          sleep_score: "sleep_score", bp_systolic: "bp_systolic",
          bp_diastolic: "bp_diastolic", respiratory_rate: "respiratory_rate",
          vo2_max: "vo2_max", recovery_score: "sleep_score",
        };
        if (colMap[key]) updates[colMap[key]] = val;
      }
    });

    if (Object.keys(updates).length === 0) {
      showToast("No high-confidence metrics to save");
      return;
    }

    // Upsert
    const { error } = await supabase
      .from("daily_metrics")
      .upsert({ user_id: user.id, date: today, ...updates }, { onConflict: "user_id,date" });

    if (error) {
      showToast("Error: " + error.message);
    } else {
      showToast(`✓ Saved ${Object.keys(updates).length} metrics!`);
      setSaved(true);
    }
  };

  // Save parsed food to nutrition log
  const saveFood = async () => {
    if (!result?.items) return;
    const today = new Date().toISOString().slice(0, 10);

    const entries = result.items
      .filter(i => i.confidence >= 0.4)
      .map(i => ({
        user_id: user.id,
        date: today,
        meal_type: "snack",
        item_name: i.name,
        calories: i.calories || null,
        protein: i.protein_g || null,
        carbs: i.carbs_g || null,
        fat: i.fat_g || null,
        source: "photo_ai",
      }));

    if (entries.length === 0) {
      showToast("No items to save");
      return;
    }

    const { error } = await supabase.from("nutrition_log").insert(entries);
    if (error) showToast("Error: " + error.message);
    else {
      showToast(`✓ Logged ${entries.length} food items!`);
      setSaved(true);
    }
  };

  return (
    <div className="space-y-3 animate-fade-up">
      <div className="text-sm font-bold tracking-tight">🤖 AI Health Assistant</div>

      {/* Device Type Selector */}
      <Card title="Upload Device Screenshot" subtitle="AI will analyze and extract your metrics" icon="📸" accent="cyan">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {DEVICE_TYPES.map(d => (
            <button
              key={d.key}
              onClick={() => setContext(d.key)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all ${
                context === d.key
                  ? "bg-vc-cyan-dim border-vc-cyan/30 text-vc-cyan"
                  : "bg-white/[0.02] border-vc-border text-zinc-400 hover:border-zinc-600"
              }`}
            >
              {d.emoji} {d.label}
            </button>
          ))}
        </div>

        {/* File Input */}
        <label className="block w-full p-4 rounded-xl border-2 border-dashed border-vc-border hover:border-vc-cyan/30 transition-colors cursor-pointer text-center">
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
          ) : (
            <div>
              <div className="text-2xl mb-1">📷</div>
              <div className="text-sm text-zinc-400">Tap to upload screenshot or photo</div>
              <div className="text-[11px] text-zinc-600 mt-1">Camera or gallery</div>
            </div>
          )}
        </label>

        <button
          onClick={analyze}
          disabled={!file || busy}
          className="mt-3 w-full py-3 rounded-xl bg-gradient-to-r from-vc-cyan to-vc-blue text-vc-bg font-semibold text-sm disabled:opacity-40 transition-all hover:shadow-lg hover:shadow-vc-cyan/20"
        >
          {busy ? "🔄 Analyzing..." : "🤖 Analyze with AI"}
        </button>
      </Card>

      {/* Results */}
      {result && !result.error && (
        <Card title={`AI Results — ${result.kind === "meal" ? "Food Detected" : "Metrics Found"}`} icon={result.kind === "meal" ? "🍽️" : "📊"} accent={result.kind === "meal" ? "yellow" : "cyan"}>
          <div className="text-[11px] text-zinc-500 mb-2">
            Source: {result.source || "—"} • {result.items?.length || 0} items detected
          </div>

          <div className="space-y-2">
            {result.items?.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 bg-white/[0.02] rounded-xl border border-vc-border">
                <div className="flex-1">
                  {result.kind === "meal" ? (
                    <>
                      <div className="text-sm font-medium">{item.name}</div>
                      <div className="text-[11px] text-zinc-500 font-mono">
                        {item.calories || "—"} cal • {item.protein_g || "—"}g P • {item.carbs_g || "—"}g C • {item.fat_g || "—"}g F
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-medium capitalize">{item.metric_name?.replace(/_/g, " ")}</div>
                      <div className="text-lg font-bold font-mono text-vc-cyan">
                        {item.value} <span className="text-xs text-zinc-500">{item.unit}</span>
                      </div>
                    </>
                  )}
                </div>
                <div className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  item.confidence >= 0.8 ? "bg-vc-cyan-dim text-vc-cyan" :
                  item.confidence >= 0.5 ? "bg-vc-yellow-dim text-vc-yellow" :
                  "bg-vc-red-dim text-vc-red"
                }`}>
                  {Math.round(item.confidence * 100)}%
                </div>
              </div>
            ))}
          </div>

          {!saved && (
            <button
              onClick={result.kind === "meal" ? saveFood : saveMetrics}
              className="mt-3 w-full py-3 rounded-xl bg-gradient-to-r from-vc-cyan to-emerald-500 text-vc-bg font-semibold text-sm"
            >
              💾 {result.kind === "meal" ? "Save to Nutrition Log" : "Save Metrics to Today"}
            </button>
          )}

          {saved && (
            <div className="mt-3 text-center text-sm text-vc-cyan font-semibold">✓ Saved successfully!</div>
          )}
        </Card>
      )}

      {result?.error && (
        <Card title="Error" accent="red">
          <div className="text-sm text-vc-red">{result.error}</div>
        </Card>
      )}

      {/* Tips */}
      <div className="text-center text-[11px] text-zinc-600 py-2 px-4">
        💡 Upload Garmin, WHOOP, BP, CPAP, Withings, or Oura screenshots — AI extracts your metrics automatically and saves to your dashboard.
        New food items are learned and added to your favorites.
      </div>
    </div>
  );
}
