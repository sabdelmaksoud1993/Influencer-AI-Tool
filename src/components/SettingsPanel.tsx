"use client";

import { useState, useEffect } from "react";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyChange?: (hasKey: boolean) => void;
}

const STORAGE_KEY = "influencer_rapidapi_key";

function maskKey(key: string): string {
  if (!key || key.length < 8) return key ? "****" : "";
  return key.slice(0, 6) + "..." + key.slice(-4);
}

export function getStoredApiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEY) || "";
}

export default function SettingsPanel({ isOpen, onClose, onKeyChange }: SettingsPanelProps) {
  const [apiKey, setApiKey] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [maskedKey, setMaskedKey] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredApiKey();
      setHasKey(!!stored);
      setMaskedKey(maskKey(stored));
    }
  }, [isOpen]);

  const handleSave = () => {
    const trimmed = apiKey.trim();
    if (!trimmed) return;

    try {
      localStorage.setItem(STORAGE_KEY, trimmed);
      setHasKey(true);
      setMaskedKey(maskKey(trimmed));
      setApiKey("");
      setMessage("API key saved. Live data is now enabled.");
      setMessageType("success");
      onKeyChange?.(true);
    } catch {
      setMessage("Failed to save key to browser storage.");
      setMessageType("error");
    }
  };

  const handleRemove = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setHasKey(false);
      setMaskedKey("");
      setMessage("API key removed. Using demo data.");
      setMessageType("success");
      onKeyChange?.(false);
    } catch {
      setMessage("Failed to remove key.");
      setMessageType("error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative glass-card neon-border-purple p-6 sm:p-8 w-full max-w-lg mx-4 animate-fade-in-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#b026ff]/10 border border-[#b026ff]/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#b026ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-[family-name:var(--font-heading)] tracking-wide">
              Settings
            </h2>
            <p className="text-xs text-gray-500">Configure API keys for live data</p>
          </div>
        </div>

        {/* Current Status */}
        <div className={`rounded-xl p-4 mb-5 border ${hasKey ? "bg-[#39ff14]/5 border-[#39ff14]/20" : "bg-[#ffe600]/5 border-[#ffe600]/20"}`}>
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${hasKey ? "bg-[#39ff14] shadow-[0_0_6px_#39ff14]" : "bg-[#ffe600] shadow-[0_0_6px_#ffe600]"}`} />
            <span className={`text-xs font-bold uppercase tracking-wider ${hasKey ? "text-[#39ff14]" : "text-[#ffe600]"}`}>
              {hasKey ? "Live Mode" : "Demo Mode"}
            </span>
          </div>
          {hasKey ? (
            <p className="text-gray-400 text-xs">
              API Key: <code className="text-gray-300">{maskedKey}</code>
            </p>
          ) : (
            <p className="text-gray-400 text-xs">No API key configured. Using simulated data.</p>
          )}
        </div>

        {/* RapidAPI Key Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
              RapidAPI Key
            </label>
            <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
              One key works for both Instagram and TikTok. Get yours free at{" "}
              <a
                href="https://rapidapi.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00f0ff] hover:underline"
              >
                rapidapi.com
              </a>
              . Subscribe to:{" "}
              <span className="text-gray-400">Instagram (instagram120)</span> and{" "}
              <span className="text-gray-400">TikTok API (tiktok-api23)</span>.
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={hasKey ? "Enter new key to replace..." : "Paste your RapidAPI key here..."}
              className="w-full neon-input rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              className="flex-1 neon-button disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider"
            >
              Save Key
            </button>
            {hasKey && (
              <button
                onClick={handleRemove}
                className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#ff2d7b] border border-[#ff2d7b]/20 hover:border-[#ff2d7b]/40 hover:bg-[#ff2d7b]/5 transition-all"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Storage info */}
        <p className="text-[10px] text-gray-600 mt-4">
          Your key is stored in your browser only and never sent to our servers.
        </p>

        {/* Message */}
        {message && (
          <div className={`mt-4 rounded-xl px-4 py-3 text-xs border ${
            messageType === "success"
              ? "bg-[#39ff14]/5 border-[#39ff14]/20 text-[#39ff14]"
              : "bg-[#ff2d7b]/5 border-[#ff2d7b]/20 text-[#ff2d7b]"
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
