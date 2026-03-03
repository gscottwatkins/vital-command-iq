import { useState } from "react";

const SUGGESTIONS = [
  "Program a KB workout",
  "What should I eat for dinner?",
  "Am I recovered for heavy lifting?",
  "Analyze my BP trends",
];

const RESPONSES = {
  kb: "Based on your 78% recovery, here's today's KB session:\n\nKB Swings — 4×15 (moderate weight)\nGoblet Squats — 3×12 (controlled tempo)\nHalos — 3×8 each direction\nSA Rows — 3×10/side\nFloor Press — 3×10\nFarmer Carries — 2×40yd\n\nRest 60-90s between sets. Strong form, not maxing out. Finish with 10 min sauna. 🔔",
  dinner: "High-protein picks:\n\n🐟 Grilled Salmon (350 cal, 40g P) + steamed broccoli (55 cal) + side salad comeback (180 cal) = 585 cal\n\nOr Two Rivers filet (480 cal, 48g P) + salad (180 cal) = 660 cal if eating out.\n\nBoth keep you near target with 40+ grams protein. 💪",
  recover: "Recovery 78% (green) + HRV 48ms (above baseline) + CPAP AHI 1.2 (excellent sleep quality) = you're cleared for structured strength.\n\nI'd suggest KB or DB work at moderate intensity. Keep strain under 14. Avoid max-effort barbell today — save that for a 85%+ recovery day. 💪",
  bp: "AM reading 122/78 is solid — well within normal. WHOOP MD estimate (118/74) tracks closely, validating both readings.\n\nAt 280 lbs your BP was likely significantly elevated. At 210 with consistent training, your cardiovascular health is dramatically improved. Keep logging AM/PM for best trend data. ❤️",
  weight: "280 → 210 = 70 lbs down while maintaining 168 lbs muscle mass. That's elite-level recomp.\n\nYou're 15 lbs from goal (82% there). At current rate: 8-10 weeks. Visceral fat at 8 is a massive health win.\n\nKeep protein at 200g to protect that muscle. 🏆",
  default: "I know your profile — structured, data-driven, strength over aesthetics. What can I help with? Training programming, nutrition, recovery analysis, or device data.",
};

function getResponse(msg) {
  const l = msg.toLowerCase();
  if (l.includes("kb") || l.includes("kettlebell")) return RESPONSES.kb;
  if (l.includes("dinner") || l.includes("eat")) return RESPONSES.dinner;
  if (l.includes("recover") || l.includes("heavy") || l.includes("lift")) return RESPONSES.recover;
  if (l.includes("bp") || l.includes("blood")) return RESPONSES.bp;
  if (l.includes("weight") || l.includes("progress")) return RESPONSES.weight;
  return RESPONSES.default;
}

export default function AICoach() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hey Scott. 78% recovery, 48ms HRV, AHI 1.2 — you're in the green. It's a strength day. What do you want to hit? I can program KB, DB, or barbell work based on how you're feeling." },
  ]);
  const [input, setInput] = useState("");
  const [showSugs, setShowSugs] = useState(true);

  const send = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setInput("");
    setShowSugs(false);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "bot", text: getResponse(msg) }]);
    }, 500);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 right-4 z-[80] w-[52px] h-[52px] rounded-full bg-gradient-to-br from-vc-cyan to-emerald-600 border-none text-vc-bg text-xl flex items-center justify-center shadow-lg shadow-vc-cyan/30 hover:scale-105 transition-transform"
        style={{ animation: "pulseGlow 3s ease-in-out infinite" }}
      >
        🧠
      </button>

      {/* Coach Panel */}
      {open && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div className="w-full max-w-lg max-h-[75vh] bg-vc-card rounded-t-2xl overflow-hidden animate-slide-up flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-vc-border flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="text-[15px] font-bold flex items-center gap-2">🧠 AI Coach</div>
                <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400 text-sm">✕</button>
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5">Knows your training profile, devices, and goals</div>
            </div>

            {/* Chat */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={m.role === "bot"
                  ? "p-3 bg-vc-cyan-dim rounded-[4px_14px_14px_14px] border border-vc-cyan/10"
                  : "p-3 bg-vc-blue-dim rounded-[14px_4px_14px_14px] border border-vc-blue/10 ml-[15%]"
                }>
                  <p className="text-xs leading-relaxed whitespace-pre-line">{m.text}</p>
                  <div className="text-[9px] text-zinc-500 mt-1">{m.role === "bot" ? "AI Coach" : "You"}</div>
                </div>
              ))}
            </div>

            {/* Suggestions */}
            {showSugs && (
              <div className="flex gap-1.5 flex-wrap px-4 pb-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="text-[10px] px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-vc-border text-zinc-400 hover:bg-vc-cyan-dim hover:border-vc-cyan/20 hover:text-vc-cyan transition-all">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-2.5 border-t border-vc-border flex gap-2 flex-shrink-0" style={{ paddingBottom: "max(10px, env(safe-area-inset-bottom))" }}>
              <input
                className="flex-1 px-3 py-2.5 bg-white/[0.03] border border-vc-border rounded-full text-sm text-white focus:outline-none focus:border-vc-cyan/40"
                placeholder="Ask your coach..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
              />
              <button onClick={() => send()} className="w-10 h-10 rounded-full bg-vc-cyan flex items-center justify-center text-vc-bg text-sm flex-shrink-0">➤</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
