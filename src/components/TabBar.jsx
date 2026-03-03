const tabs = [
  { key: "dashboard", label: "Home", icon: "🏠" },
  { key: "food", label: "Food", icon: "🍽️" },
  { key: "ai", label: "Upload", icon: "🧠", fab: true },
  { key: "workouts", label: "Train", icon: "🏋️" },
  { key: "profile", label: "More", icon: "📊" },
];

export default function TabBar({ active, onChange }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-vc-bg/90 backdrop-blur-xl border-t border-vc-border z-50" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
      <div className="max-w-lg mx-auto flex justify-around items-center px-2">
        {tabs.map(t => t.fab ? (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className="w-[52px] h-[52px] -mt-6 rounded-full bg-gradient-to-br from-vc-cyan to-vc-blue flex items-center justify-center text-xl border-[3px] border-vc-bg shadow-lg shadow-vc-cyan/30 hover:scale-105 transition-transform animate-pulse-glow"
          >
            {t.icon}
          </button>
        ) : (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-colors ${active === t.key ? "text-vc-cyan" : "text-zinc-600 hover:text-zinc-400"}`}
          >
            <span className="text-lg leading-none">{t.icon}</span>
            <span className="text-[10px] font-medium">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
