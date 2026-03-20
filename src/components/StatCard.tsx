"use client";

import AnimatedNumber from "./AnimatedNumber";

type NeonColor = "cyan" | "pink" | "purple";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  colorClass?: string;
  icon: React.ReactNode;
  neonColor?: NeonColor;
  animate?: boolean;
  isWinner?: boolean;
}

const neonStyles: Record<NeonColor, { border: string; icon: string; glow: string }> = {
  cyan: {
    border: "hover:border-[#00f0ff]/40 hover:shadow-[0_0_15px_rgba(0,240,255,0.15)]",
    icon: "text-[#00f0ff]",
    glow: "bg-[#00f0ff]",
  },
  pink: {
    border: "hover:border-[#ff2d7b]/40 hover:shadow-[0_0_15px_rgba(255,45,123,0.15)]",
    icon: "text-[#ff2d7b]",
    glow: "bg-[#ff2d7b]",
  },
  purple: {
    border: "hover:border-[#b026ff]/40 hover:shadow-[0_0_15px_rgba(176,38,255,0.15)]",
    icon: "text-[#b026ff]",
    glow: "bg-[#b026ff]",
  },
};

export default function StatCard({
  label,
  value,
  subtitle,
  colorClass = "text-white",
  icon,
  neonColor = "cyan",
  animate = true,
  isWinner = false,
}: StatCardProps) {
  const styles = neonStyles[neonColor];

  return (
    <div
      className={`
        glass-card p-5 transition-all duration-500 group relative overflow-hidden
        border border-white/[0.06]
        ${styles.border}
        ${isWinner ? "winner-glow" : ""}
        animate-fade-in-up
      `}
    >
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${styles.glow} opacity-30 group-hover:opacity-60 transition-opacity`} />

      {/* Winner badge */}
      {isWinner && (
        <div className="absolute top-2 right-2 text-[#39ff14] text-xs font-bold flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      )}

      <div className="flex items-center gap-2.5 mb-3">
        <div className={`${styles.icon} neon-glow-text-subtle transition-all duration-300`}>
          {icon}
        </div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
      </div>

      <p className={`text-2xl sm:text-3xl font-bold ${colorClass} tracking-tight`}>
        {typeof value === "number" && animate ? (
          <AnimatedNumber value={value} />
        ) : typeof value === "number" ? (
          value.toLocaleString()
        ) : (
          value
        )}
      </p>

      {subtitle && (
        <p className="text-xs text-gray-500 mt-1.5">{subtitle}</p>
      )}
    </div>
  );
}
