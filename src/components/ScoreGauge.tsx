"use client";

import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

export default function ScoreGauge({ score, size = 150 }: ScoreGaugeProps) {
  const { value: animatedScore } = useAnimatedCounter(score, 1800);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const filled = (animatedScore / 100) * circumference;
  const empty = circumference - filled;

  const getColor = () => {
    if (score >= 75) return "#39ff14"; // neon green
    if (score >= 55) return "#00f0ff"; // neon cyan
    if (score >= 35) return "#ff2d7b"; // neon pink
    return "#ff4444";
  };

  const color = getColor();

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* Neon glow filter */}
        <defs>
          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="7"
        />

        {/* Progress circle with neon glow */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeDasharray={`${filled} ${empty}`}
          strokeDashoffset={circumference / 4}
          strokeLinecap="round"
          filter="url(#neonGlow)"
          className="transition-all duration-1000 ease-out"
        />

        {/* Score text */}
        <text
          x="60"
          y="53"
          textAnchor="middle"
          fill="white"
          fontSize="28"
          fontWeight="bold"
          fontFamily="var(--font-heading), sans-serif"
        >
          {animatedScore}
        </text>
        <text
          x="60"
          y="73"
          textAnchor="middle"
          fill="rgba(255,255,255,0.3)"
          fontSize="11"
        >
          /100
        </text>
      </svg>
      <p
        className="text-xs text-gray-400 mt-1 font-medium uppercase tracking-widest"
        style={{ color, textShadow: `0 0 10px ${color}` }}
      >
        Influencer Score
      </p>
    </div>
  );
}
