export default function MetricBox({ label, value, unit, change, changeType, progress, progressColor = "bg-vc-cyan", valueColor = "" }) {
  return (
    <div className="bg-white/[0.02] rounded-xl p-3 border border-vc-border">
      <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-xl font-bold font-mono tracking-tight ${valueColor}`}>
        {value}
        {unit && <span className="text-xs font-normal text-zinc-400 ml-0.5">{unit}</span>}
      </div>
      {change && (
        <div className={`text-[11px] mt-0.5 font-medium ${changeType === "up" ? "text-vc-cyan" : changeType === "down" ? "text-vc-red" : "text-zinc-500"}`}>
          {change}
        </div>
      )}
      {progress !== undefined && (
        <div className="h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden">
          <div className={`h-full rounded-full progress-fill ${progressColor}`} style={{ width: `${Math.min(100, progress)}%` }} />
        </div>
      )}
    </div>
  );
}
