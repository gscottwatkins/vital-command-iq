export default function Card({ title, subtitle, icon, accent, badge, badgeColor, right, children, onClick, className = "" }) {
  const accentColors = {
    cyan: "from-vc-cyan to-vc-blue",
    blue: "from-vc-blue to-vc-cyan",
    orange: "from-vc-orange to-vc-yellow",
    purple: "from-vc-purple to-vc-pink",
    red: "from-vc-red to-vc-orange",
    yellow: "from-vc-yellow to-vc-orange",
    pink: "from-vc-pink to-vc-purple",
  };

  const badgeColors = {
    cyan: "bg-vc-cyan-dim text-vc-cyan",
    green: "bg-vc-cyan-dim text-vc-cyan",
    orange: "bg-vc-orange-dim text-vc-orange",
    red: "bg-vc-red-dim text-vc-red",
    purple: "bg-vc-purple-dim text-vc-purple",
    yellow: "bg-vc-yellow-dim text-vc-yellow",
    blue: "bg-vc-blue-dim text-vc-blue",
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-vc-card border border-vc-border p-4 transition-all duration-200 ${onClick ? "cursor-pointer hover:bg-vc-card-hover hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30" : ""} ${className}`}
    >
      {accent && (
        <div className={`card-accent bg-gradient-to-r ${accentColors[accent] || accentColors.cyan}`} />
      )}

      {(title || icon || badge) && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            {icon && (
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${accent ? `bg-vc-${accent}-dim` : "bg-vc-cyan-dim"}`}>
                {icon}
              </div>
            )}
            <div>
              {title && <div className="text-sm font-semibold tracking-tight">{title}</div>}
              {subtitle && <div className="text-[11px] text-zinc-500 mt-0.5">{subtitle}</div>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {badge && (
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold font-mono ${badgeColors[badgeColor] || badgeColors.cyan}`}>
                {badge}
              </span>
            )}
            {right}
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
