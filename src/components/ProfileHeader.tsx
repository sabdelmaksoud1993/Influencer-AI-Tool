"use client";

import { useState } from "react";
import ScoreGauge from "./ScoreGauge";

interface ProfileHeaderProps {
  displayName?: string;
  profilePicUrl?: string;
  bio?: string;
  platform: string;
  profileUrl: string;
  scoreOutOf100: number;
  compact?: boolean;
}

export default function ProfileHeader({
  displayName,
  profilePicUrl,
  bio,
  platform,
  profileUrl,
  scoreOutOf100,
  compact = false,
}: ProfileHeaderProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const isInstagram = platform === "Instagram";
  const platformColor = isInstagram ? "#ff2d7b" : "#00f0ff";
  const platformBorder = isInstagram ? "border-[#ff2d7b]/30" : "border-[#00f0ff]/30";
  const platformBg = isInstagram ? "bg-[#ff2d7b]/10" : "bg-[#00f0ff]/10";
  const platformText = isInstagram ? "text-[#ff2d7b]" : "text-[#00f0ff]";

  const initials = (displayName || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const showImage = profilePicUrl && !imgFailed;
  const proxyUrl = profilePicUrl
    ? `/api/proxy-image?url=${encodeURIComponent(profilePicUrl)}`
    : "";

  const sizeClass = compact ? "w-14 h-14" : "w-20 h-20";

  const handleImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    // Detect the 1x1 transparent pixel fallback from our proxy
    if (img.naturalWidth <= 1 || img.naturalHeight <= 1) {
      setImgFailed(true);
    }
  };

  return (
    <div className={`flex items-center gap-4 sm:gap-6 ${compact ? "" : "flex-wrap"}`}>
      {/* Avatar */}
      <div className="relative shrink-0">
        <div
          className="rounded-full p-[2px]"
          style={{
            background: `linear-gradient(135deg, ${platformColor}, #b026ff)`,
            boxShadow: `0 0 15px ${platformColor}40`,
          }}
        >
          {showImage ? (
            <img
              src={proxyUrl}
              alt={displayName || "Profile"}
              className={`${sizeClass} rounded-full object-cover border-2 border-[#050508]`}
              onError={() => setImgFailed(true)}
              onLoad={handleImgLoad}
              crossOrigin="anonymous"
            />
          ) : (
            <div
              className={`${sizeClass} rounded-full flex items-center justify-center border-2 border-[#050508] bg-gradient-to-br from-[#1a1a2e] to-[#0d0d1a]`}
            >
              <span className={`${compact ? "text-sm" : "text-lg"} font-bold text-white/60`}>{initials}</span>
            </div>
          )}
        </div>
        {/* Platform indicator */}
        <div
          className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#050508]"
          style={{ backgroundColor: platformColor, boxShadow: `0 0 8px ${platformColor}` }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h2
          className={`${compact ? "text-lg" : "text-xl sm:text-2xl"} font-bold text-white font-[family-name:var(--font-heading)] tracking-wide`}
        >
          {displayName || "Analysis Results"}
        </h2>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${platformBg} ${platformText} ${platformBorder} border`}
          >
            {isInstagram ? (
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            ) : (
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .54.04.79.12v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 0010.86 4.48 6.3 6.3 0 001.86-4.49V8.74a8.26 8.26 0 004.84 1.56V6.84a4.84 4.84 0 01-1.12-.15z"/>
              </svg>
            )}
            {platform}
          </span>
          {!compact && (
            <span className="text-gray-600 text-xs truncate max-w-[200px] sm:max-w-xs">
              {profileUrl}
            </span>
          )}
        </div>

        {bio && !compact && (
          <p className="text-gray-400 text-sm mt-2 line-clamp-2 leading-relaxed">{bio}</p>
        )}
      </div>

      {/* Score */}
      <div className="shrink-0">
        <ScoreGauge score={scoreOutOf100} size={compact ? 100 : 140} />
      </div>
    </div>
  );
}
