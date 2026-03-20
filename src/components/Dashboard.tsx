"use client";

import { useRef } from "react";
import StatCard from "./StatCard";
import ProfileHeader from "./ProfileHeader";
import ExportButton from "./ExportButton";
import { getLabelColor } from "@/lib/calculations";

interface DashboardProps {
  data: {
    followers: number;
    avgLikes: number;
    avgComments: number;
    engagementRate: number;
    engagementLabel: string;
    likesToCommentsRatio: number;
    estimatedReach: number;
    scoreOutOf100: number;
    recommendation: string;
    influencerTier?: string;
    aiJudgment?: string;
    platform: string;
    profileUrl: string;
    displayName?: string;
    profilePicUrl?: string;
    bio?: string;
  };
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

const neonColors: ("cyan" | "pink" | "purple")[] = ["cyan", "pink", "purple", "cyan", "pink", "purple"];

export default function Dashboard({ data }: DashboardProps) {
  const dashboardRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={dashboardRef} className="space-y-8 animate-fade-in-up">
      {/* Header with profile + export */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <ProfileHeader
            displayName={data.displayName}
            profilePicUrl={data.profilePicUrl}
            bio={data.bio}
            platform={data.platform}
            profileUrl={data.profileUrl}
            scoreOutOf100={data.scoreOutOf100}
          />
        </div>
        <div className="shrink-0 mt-1" data-export-hide>
          <ExportButton targetRef={dashboardRef} filename={data.displayName || "influencer-stats"} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        <StatCard
          label="Followers"
          value={data.followers}
          icon={Icons.followers}
          neonColor={neonColors[0]}
        />
        <StatCard
          label="Avg. Likes"
          value={data.avgLikes}
          subtitle="Per post"
          icon={Icons.likes}
          neonColor={neonColors[1]}
        />
        <StatCard
          label="Avg. Comments"
          value={data.avgComments}
          subtitle="Per post"
          icon={Icons.comments}
          neonColor={neonColors[2]}
        />
        <StatCard
          label="Engagement Rate"
          value={`${data.engagementRate}%`}
          subtitle={data.engagementLabel}
          colorClass={getLabelColor(data.engagementLabel)}
          icon={Icons.engagement}
          neonColor={neonColors[3]}
          animate={false}
        />
        <StatCard
          label="Est. Reach"
          value={data.estimatedReach}
          subtitle="Per post"
          icon={Icons.reach}
          neonColor={neonColors[4]}
        />
        <StatCard
          label="Likes-to-Comments"
          value={`${data.likesToCommentsRatio}:1`}
          subtitle="Ratio"
          icon={Icons.ratio}
          neonColor={neonColors[5]}
          animate={false}
        />
      </div>

      {/* AI Judgment */}
      {data.aiJudgment && (
        <div className="glass-card neon-border-cyan p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#00f0ff] shadow-[0_0_10px_#00f0ff]" />
          <div className="pl-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#00f0ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="text-sm font-bold text-white font-[family-name:var(--font-heading)] tracking-wide uppercase">
                  AI Analysis
                </h3>
              </div>
              {data.influencerTier && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20">
                  {data.influencerTier} Influencer
                </span>
              )}
            </div>
            <p className="text-gray-300 leading-relaxed text-sm">{data.aiJudgment}</p>
          </div>
        </div>
      )}

      {/* Quick Recommendation */}
      <div className="glass-card neon-border-purple p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#b026ff] shadow-[0_0_10px_#b026ff]" />
        <h3 className="text-xs font-bold text-white mb-1.5 pl-4 font-[family-name:var(--font-heading)] tracking-wide uppercase">
          Verdict
        </h3>
        <p className="text-gray-400 leading-relaxed text-sm pl-4">{data.recommendation}</p>
      </div>
    </div>
  );
}
