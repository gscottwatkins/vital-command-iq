import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase";
import Card from "../components/Card";
import MetricBox from "../components/MetricBox";
import { defaultFavorites } from "../lib/favorites";

export default function Food({ user, showToast }) {
  const [favorites, setFavorites] = useState([]);
  const [todayLog, setTodayLog] = useState([]);
  const [mealType, setMealType] = useState(() => {
    const h = new Date().getHours();
    if (h < 10) return "breakfast";
    if (h < 15) return "lunch";
    if (h < 20) return "dinner";
    return "snack";
  });
  const [search, setSearch] = useState("");
  const [customOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCal, setCustomCal] = useState("");
  const [customProtein, setCustomProtein] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  // Group favorites by category
  const grouped = useMemo(() => {
    const items = favorites.length > 0 ? favorites : defaultFavorites;
    const filtered = search
      ? items.filter(f => f.name.toLowerCase().includes(search.toLowerCase()) || f.category?.toLowerCase().includes(search.toLowerCase()))
      : items;

    const by = {};
    filtered.forEach(f => {
      const cat = f.category || "Other";
      by[cat] = by[cat] || [];
      by[cat].push(f);
    });
    return by;
  }, [favorites, search]);

  // Load favorites from Supabase
  const loadFavorites = async () => {
    const { data } = await supabase
      .from("food_favorites")
      .select("*")
      .eq("user_id", user.id)
      .order("category")
      .order("name");
    if (data && data.length > 0) setFavorites(data);
  };

  // Load today's food log
  const loadTodayLog = async () => {
    const { data } = await supabase
      .from("nutrition_log")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .order("created_at", { ascending: true });
    setTodayLog(data || []);
  };

  useEffect(() => {
    loadFavorites();
    loadTodayLog();
  }, []);

  // Seed favorites if none exist
  useEffect(() => {
    if (favorites.length === 0) {
      supabase
        .from("food_favorites")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .then(({ data }) => {
          if (!data || data.length === 0) {
            supabase.from("food_favorites").insert(
              defaultFavorites.map(f => ({
                user_id: user.id,
                category: f.category,
                name: f.name,
                default_calories: f.default_calories,
                default_protein: f.default_protein,
                default_carbs: f.default_carbs,
                default_fat: f.default_fat,
              }))
            ).then(() => loadFavorites());
          }
        });
    }
  }, [favorites.length]);

  // Quick log a food item
  const quickLog = async (item) => {
    const entry = {
      user_id: user.id,
      date: today,
      meal_type: mealType,
      item_name: item.name,
      calories: item.default_calories || item.calories || null,
      protein: item.default_protein || item.protein || null,
      carbs: item.default_carbs || item.carbs || null,
      fat: item.default_fat || item.fat || null,
      source: "quick_add",
    };

    const { error } = await supabase.from("nutrition_log").insert(entry);
    if (error) {
      showToast("Error: " + error.message);
    } else {
      showToast(`✓ ${item.name} (${item.default_calories || "—"} cal)`);
      loadTodayLog();
    }
  };

  // Custom food add
  const addCustom = async () => {
    if (!customName.trim()) return;
    const cal = parseInt(customCal) || null;
    const prot = parseInt(customProtein) || null;

    // Log it
    await supabase.from("nutrition_log").insert({
      user_id: user.id,
      date: today,
      meal_type: mealType,
      item_name: customName,
      calories: cal,
      protein: prot,
      source: "manual",
    });

    // Save to favorites for future
    await supabase.from("food_favorites").insert({
      user_id: user.id,
      category: "My Custom",
      name: customName,
      default_calories: cal,
      default_protein: prot,
    });

    showToast(`💡 "${customName}" saved to favorites!`);
    setCustomName(""); setCustomCal(""); setCustomProtein("");
    setCustomOpen(false);
    loadFavorites();
    loadTodayLog();
  };

  // Delete a log entry
  const deleteEntry = async (id) => {
    await supabase.from("nutrition_log").delete().eq("id", id);
    loadTodayLog();
    showToast("Removed");
  };

  const totalCal = todayLog.reduce((s, f) => s + (f.calories || 0), 0);
  const totalProtein = todayLog.reduce((s, f) => s + (f.protein || 0), 0);
  const totalCarbs = todayLog.reduce((s, f) => s + (f.carbs || 0), 0);
  const totalFat = todayLog.reduce((s, f) => s + (f.fat || 0), 0);

  return (
    <div className="space-y-3 animate-fade-up">
      {/* Macro Summary */}
      <Card title="Today's Macros" subtitle={`${totalCal.toLocaleString()} of 2,200 cal target`} icon="📊" accent="yellow">
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center">
            <div className="text-lg font-bold font-mono text-vc-cyan">{totalProtein}g</div>
            <div className="text-[10px] text-zinc-500">Protein</div>
            <div className="h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-vc-cyan rounded-full progress-fill" style={{ width: `${Math.min(100, (totalProtein / 200) * 100)}%` }} />
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold font-mono">{totalCarbs}g</div>
            <div className="text-[10px] text-zinc-500">Carbs</div>
            <div className="h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-vc-orange rounded-full progress-fill" style={{ width: `${Math.min(100, (totalCarbs / 200) * 100)}%` }} />
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold font-mono">{totalFat}g</div>
            <div className="text-[10px] text-zinc-500">Fat</div>
            <div className="h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-vc-yellow rounded-full progress-fill" style={{ width: `${Math.min(100, (totalFat / 80) * 100)}%` }} />
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold font-mono">{totalCal}</div>
            <div className="text-[10px] text-zinc-500">Calories</div>
            <div className="h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-vc-yellow to-vc-orange rounded-full progress-fill" style={{ width: `${Math.min(100, (totalCal / 2200) * 100)}%` }} />
            </div>
          </div>
        </div>
      </Card>

      {/* Today's Log */}
      {todayLog.length > 0 && (
        <Card title="Today's Log" icon="📋" accent="blue">
          <div className="space-y-1">
            {todayLog.map(f => (
              <div key={f.id} className="flex items-center gap-2 text-xs py-1.5 border-b border-vc-border last:border-0">
                <span className="text-zinc-500 font-mono w-12 flex-shrink-0">
                  {new Date(f.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-[10px] text-zinc-500 uppercase w-12 flex-shrink-0">{f.meal_type}</span>
                <span className="flex-1 text-zinc-300">{f.item_name}</span>
                <span className="text-vc-cyan font-mono font-semibold">{f.calories || 0}</span>
                <button onClick={() => deleteEntry(f.id)} className="text-zinc-600 hover:text-vc-red text-xs ml-1">✕</button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Meal Type + Search */}
      <div className="flex gap-2">
        <select
          className="bg-vc-card border border-vc-border rounded-xl px-3 py-2.5 text-sm flex-shrink-0"
          value={mealType}
          onChange={e => setMealType(e.target.value)}
        >
          <option value="breakfast">🌅 Breakfast</option>
          <option value="lunch">☀️ Lunch</option>
          <option value="dinner">🌙 Dinner</option>
          <option value="snack">🍿 Snack</option>
        </select>
        <input
          className="flex-1 bg-vc-card border border-vc-border rounded-xl px-3 py-2.5 text-sm"
          placeholder="Search favorites..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Quick Add Favorites */}
      <div className="text-sm font-bold tracking-tight">⚡ Quick Add Favorites</div>

      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat}>
          <div className="text-[11px] text-vc-cyan font-semibold uppercase tracking-wider mb-2 pl-1">{cat}</div>
          <div className="space-y-1.5">
            {items.map((item, idx) => (
              <button
                key={item.id || idx}
                onClick={() => quickLog(item)}
                className="w-full flex items-center justify-between p-3 bg-white/[0.02] border border-vc-border rounded-xl hover:bg-vc-cyan-dim hover:border-vc-cyan/20 transition-all text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg w-7 text-center">{item.emoji || "🍽️"}</span>
                  <div>
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className="text-[11px] text-zinc-500 font-mono">
                      {item.default_calories || "—"} cal
                      {item.default_protein ? ` • ${item.default_protein}g P` : ""}
                    </div>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-lg bg-vc-cyan-dim flex items-center justify-center text-vc-cyan text-sm font-bold flex-shrink-0">
                  +
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Custom Entry */}
      <Card title="Custom Food Entry" subtitle="Add anything — saves to your favorites" icon="✏️" accent="blue">
        {!customOpen ? (
          <button
            onClick={() => setCustomOpen(true)}
            className="w-full py-3 rounded-xl bg-white/[0.03] border border-vc-border text-sm text-zinc-400 hover:bg-vc-cyan-dim hover:border-vc-cyan/20 transition-all"
          >
            ➕ Add custom food
          </button>
        ) : (
          <div className="space-y-2">
            <input className="w-full p-3 rounded-xl bg-white/[0.03] border border-vc-border text-sm" placeholder="Food name" value={customName} onChange={e => setCustomName(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <input className="p-3 rounded-xl bg-white/[0.03] border border-vc-border text-sm" type="number" placeholder="Calories" value={customCal} onChange={e => setCustomCal(e.target.value)} />
              <input className="p-3 rounded-xl bg-white/[0.03] border border-vc-border text-sm" type="number" placeholder="Protein (g)" value={customProtein} onChange={e => setCustomProtein(e.target.value)} />
            </div>
            <button onClick={addCustom} className="w-full py-3 rounded-xl bg-gradient-to-r from-vc-cyan to-emerald-500 text-vc-bg font-semibold text-sm">
              💾 Add & Save to Favorites
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
