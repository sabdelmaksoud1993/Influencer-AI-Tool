"use client";

import { useState } from "react";

interface AnalyzerFormProps {
  onAnalyze: (profileUrl: string) => void;
  onCompare?: (url1: string, url2: string) => void;
  isLoading: boolean;
  mode: "single" | "compare";
  onModeChange: (mode: "single" | "compare") => void;
}

export default function AnalyzerForm({
  onAnalyze,
  onCompare,
  isLoading,
  mode,
  onModeChange,
}: AnalyzerFormProps) {
  const [profileUrl, setProfileUrl] = useState("");
  const [compareUrl, setCompareUrl] = useState("");
  const [error, setError] = useState("");

  const detectPlatform = (url: string) => {
    if (url.toLowerCase().includes("tiktok")) return "TikTok";
    if (url.toLowerCase().includes("instagram") || url.toLowerCase().includes("instagr.am"))
      return "Instagram";
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!profileUrl.trim()) {
      setError("Please enter a profile URL");
      return;
    }

    const platform = detectPlatform(profileUrl);
    if (!platform) {
      setError("Please enter a valid Instagram or TikTok profile URL");
      return;
    }

    if (mode === "compare") {
      if (!compareUrl.trim()) {
        setError("Please enter a second profile URL to compare");
        return;
      }
      const platform2 = detectPlatform(compareUrl);
      if (!platform2) {
        setError("Second URL must be a valid Instagram or TikTok profile URL");
        return;
      }
      onCompare?.(profileUrl, compareUrl);
    } else {
      onAnalyze(profileUrl);
    }
  };

  const platform1 = detectPlatform(profileUrl);
  const platform2 = detectPlatform(compareUrl);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Mode Toggle */}
      <div className="flex items-center justify-center gap-1 p-1 glass-card rounded-xl w-fit mx-auto">
        <button
          type="button"
          onClick={() => onModeChange("single")}
          className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
            mode === "single"
              ? "neon-button text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Analyze
        </button>
        <button
          type="button"
          onClick={() => onModeChange("compare")}
          className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
            mode === "compare"
              ? "neon-button text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Compare
        </button>
      </div>

      {/* Primary URL Input */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
          {mode === "compare" ? "Profile 1" : "Profile URL"}
        </label>
        <div className="relative">
          <input
            type="text"
            value={profileUrl}
            onChange={(e) => setProfileUrl(e.target.value)}
            placeholder="https://instagram.com/username"
            className="w-full neon-input rounded-xl px-4 py-3.5 text-white placeholder-gray-600 text-sm"
          />
          {platform1 && (
            <span
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                platform1 === "Instagram"
                  ? "bg-[#ff2d7b]/10 text-[#ff2d7b] border-[#ff2d7b]/30"
                  : "bg-[#00f0ff]/10 text-[#00f0ff] border-[#00f0ff]/30"
              }`}
            >
              {platform1}
            </span>
          )}
        </div>
      </div>

      {/* Compare URL Input */}
      {mode === "compare" && (
        <div className="animate-slide-down">
          <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
            Profile 2
          </label>
          <div className="relative">
            <input
              type="text"
              value={compareUrl}
              onChange={(e) => setCompareUrl(e.target.value)}
              placeholder="https://instagram.com/username2"
              className="w-full neon-input rounded-xl px-4 py-3.5 text-white placeholder-gray-600 text-sm"
            />
            {platform2 && (
              <span
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                  platform2 === "Instagram"
                    ? "bg-[#ff2d7b]/10 text-[#ff2d7b] border-[#ff2d7b]/30"
                    : "bg-[#00f0ff]/10 text-[#00f0ff] border-[#00f0ff]/30"
                }`}
              >
                {platform2}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="neon-border-pink rounded-xl px-4 py-3">
          <p className="text-[#ff2d7b] text-sm">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full neon-button disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-sm uppercase tracking-wider"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {mode === "compare" ? "Comparing profiles..." : "Analyzing profile..."}
          </span>
        ) : mode === "compare" ? (
          "Compare Profiles"
        ) : (
          "Analyze"
        )}
      </button>
    </form>
  );
}
