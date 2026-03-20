"use client";

import { useRef } from "react";
import StatCard from "./StatCard";
import ProfileHeader from "./ProfileHeader";
import ExportButton from "./ExportButton";
import { getLabelColor } from "@/lib/calculations";

type AnalysisResult = {
  followers: number;
  avgLikes: number;
  avgComments: number;
  engagementRate: number;
  engagementLabel: string;
  likesToCommentsRatio: number;
  estimatedReach: number;
  scoreOutOf100: number;
  recommendation: string;
  platform: string;
  profileUrl: string;
  displayName?: string;
  profilePicUrl?: string;
  bio?: string;
};

interface CompareViewProps {
  data1: AnalysisResult;
  data2: AnalysisResult;
}

const Icons = {
  followers: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  likes: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  comments: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  engagement: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  reach: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  ratio: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
};

type MetricKey = "followers" | "avgLikes" | "avgComments" | "engagementRate" | "estimatedReach" | "scoreOutOf100";

const metrics: { key: MetricKey; label: string; icon: React.ReactNode; subtitle?: string; isRate?: boolean }[] = [
  { key: "followers", label: "Followers", icon: Icons.followers },
  { key: "avgLikes", label: "Avg. Likes", icon: Icons.likes, subtitle: "Per post" },
  { key: "avgComments", label: "Avg. Comments", icon: Icons.comments, subtitle: "Per post" },
  { key: "engagementRate", label: "Engagement Rate", icon: Icons.engagement, isRate: true },
  { key: "estimatedReach", label: "Est. Reach", icon: Icons.reach, subtitle: "Per post" },
  { key: "scoreOutOf100", label: "Overall Score", icon: Icons.ratio },
];

function getWinner(v1: number, v2: number): 1 | 2 | 0 {
  if (v1 > v2) return 1;
  if (v2 > v1) return 2;
  return 0;
}

export default function CompareView({ data1, data2 }: CompareViewProps) {
  const compareRef = useRef<HTMLDivElement>(null);

  // Count wins
  let wins1 = 0;
  let wins2 = 0;
  metrics.forEach(({ key }) => {
    const w = getWinner(data1[key], data2[key]);
    if (w === 1) wins1++;
    if (w === 2) wins2++;
  });

  const neonColors: ("cyan" | "pink" | "purple")[] = ["cyan", "pink", "purple", "cyan", "pink", "purple"];

  return (
    <div ref={compareRef} className="space-y-8 animate-fade-in-up">
      {/* Export */}
      <div className="flex justify-end">
        <ExportButton targetRef={compareRef} filename="influencer-compare" />
      </div>

      {/* Profiles side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
        {/* Vertical divider */}
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#00f0ff]/30 to-transparent" />

        <div className="glass-card neon-border-cyan p-5 rounded-2xl">
          <ProfileHeader {...data1} compact />
        </div>
        <div className="glass-card neon-border-pink p-5 rounded-2xl">
          <ProfileHeader {...data2} compact />
        </div>
      </div>

      {/* Metrics comparison */}
      <div className="space-y-3">
        {metrics.map(({ key, label, icon, subtitle, isRate }, i) => {
          const v1 = data1[key];
          const v2 = data2[key];
          const winner = getWinner(v1, v2);
          const color = neonColors[i % neonColors.length];

          return (
            <div key={key} className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-3 items-center">
              <StatCard
                label={label}
                value={isRate ? `${v1}%` : v1}
                subtitle={isRate ? data1.engagementLabel : subtitle}
                colorClass={isRate ? getLabelColor(data1.engagementLabel) : "text-white"}
                icon={icon}
                neonColor={color}
                isWinner={winner === 1}
                animate
              />

              <div className="hidden lg:flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{label}</span>
                {winner === 1 && <span className="text-[#39ff14] text-xs">&#x2190;</span>}
                {winner === 2 && <span className="text-[#39ff14] text-xs">&#x2192;</span>}
                {winner === 0 && <span className="text-gray-600 text-xs">=</span>}
              </div>

              <StatCard
                label={label}
                value={isRate ? `${v2}%` : v2}
                subtitle={isRate ? data2.engagementLabel : subtitle}
                colorClass={isRate ? getLabelColor(data2.engagementLabel) : "text-white"}
                icon={icon}
                neonColor={color}
                isWinner={winner === 2}
                animate
              />
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="glass-card neon-border-purple p-6 text-center">
        <h3 className="text-base font-bold text-white font-[family-name:var(--font-heading)] tracking-wide mb-3">
          Verdict
        </h3>
        <div className="flex items-center justify-center gap-6">
          <div className={`text-center ${wins1 > wins2 ? "text-[#39ff14]" : "text-gray-400"}`}>
            <p className="text-2xl font-bold">{wins1}</p>
            <p className="text-xs mt-1">{data1.displayName || "Profile 1"}</p>
          </div>
          <div className="text-gray-600 text-xs font-bold uppercase tracking-wider">vs</div>
          <div className={`text-center ${wins2 > wins1 ? "text-[#39ff14]" : "text-gray-400"}`}>
            <p className="text-2xl font-bold">{wins2}</p>
            <p className="text-xs mt-1">{data2.displayName || "Profile 2"}</p>
          </div>
        </div>
        <p className="text-gray-400 text-sm mt-4">
          {wins1 > wins2
            ? `${data1.displayName || "Profile 1"} leads in ${wins1} out of ${metrics.length} metrics`
            : wins2 > wins1
            ? `${data2.displayName || "Profile 2"} leads in ${wins2} out of ${metrics.length} metrics`
            : "Both profiles are evenly matched"}
        </p>
      </div>
    </div>
  );
}
