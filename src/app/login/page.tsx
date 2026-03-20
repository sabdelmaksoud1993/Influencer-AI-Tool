"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Please enter your access code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Always redirect based on role (code prefix), ignore callbackUrl if it doesn't match
      const trimmed = code.trim();
      let redirect: string;
      if (trimmed.startsWith("CRC-")) redirect = "/member";
      else if (trimmed.startsWith("VNU-")) redirect = "/venue";
      else redirect = "/admin";

      const result = await signIn("credentials", {
        code: code.trim(),
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid access code. Please check and try again.");
      } else if (result?.ok) {
        window.location.href = redirect;
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(600px circle at 50% 30%, rgba(233, 30, 140, 0.06), transparent 60%)",
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-5 h-5 rounded-full bg-[var(--purple)]" />
              <div className="w-4 h-4 rounded-full bg-[var(--pink)]" />
            </div>
            <h1
              className="text-2xl font-extrabold tracking-[0.3em] text-white uppercase"
              style={{ letterSpacing: "0.3em" }}
            >
              GLOW PASS
            </h1>
          </Link>
          <p
            className="text-xs mt-3 tracking-widest uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            Access the City. Capture the Glow.
          </p>
        </div>

        {/* Login Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          <h2 className="text-lg font-bold text-white mb-1">Sign In</h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            Enter your access code to continue
          </p>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError("");
                }}
                placeholder="CRC-XXXXXXXX / VNU-XXXXXXXX / Admin Password"
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-gray-500 outline-none transition-all focus:ring-2"
                style={{
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border)",
                  // focus ring handled via onFocus/onBlur
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--pink)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--border)")
                }
                autoFocus
              />
            </div>

            {error && (
              <div
                className="mb-4 px-4 py-3 rounded-xl text-sm"
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#ef4444",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, var(--pink), var(--purple))",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Info cards */}
          <div className="mt-8 space-y-3">
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                background: "rgba(233, 30, 140, 0.05)",
                border: "1px solid rgba(233, 30, 140, 0.15)",
              }}
            >
              <span className="text-lg">👑</span>
              <div>
                <p className="text-xs font-semibold text-white">Creator?</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  Use your CRC- access code
                </p>
              </div>
            </div>
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                background: "rgba(108, 92, 231, 0.05)",
                border: "1px solid rgba(108, 92, 231, 0.15)",
              }}
            >
              <span className="text-lg">🏢</span>
              <div>
                <p className="text-xs font-semibold text-white">Venue?</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  Use your VNU- access code
                </p>
              </div>
            </div>
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--border)",
              }}
            >
              <span className="text-lg">🔐</span>
              <div>
                <p className="text-xs font-semibold text-white">Admin?</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  Use your admin password
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Apply link */}
        <div className="text-center mt-6">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Don't have access?{" "}
            <Link
              href="/apply"
              className="font-semibold hover:underline"
              style={{ color: "var(--pink)" }}
            >
              Apply to join
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
          <div className="w-8 h-8 border-2 border-[var(--pink)] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
