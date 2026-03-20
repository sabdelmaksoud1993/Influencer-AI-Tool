"use client";

import { useState, RefObject } from "react";

interface ExportButtonProps {
  targetRef: RefObject<HTMLDivElement | null>;
  filename?: string;
}

/**
 * Apply inline style fixes for export and return a cleanup function.
 */
function applyExportStyles(root: HTMLElement): () => void {
  const restoreFns: (() => void)[] = [];

  // Hide export button
  root.querySelectorAll("[data-export-hide]").forEach((el) => {
    const h = el as HTMLElement;
    const orig = h.style.display;
    h.style.display = "none";
    restoreFns.push(() => { h.style.display = orig; });
  });

  // Fix all elements
  root.querySelectorAll("*").forEach((el) => {
    const h = el as HTMLElement;
    const cs = window.getComputedStyle(h);

    // Replace backdrop-filter with solid background
    if (cs.backdropFilter && cs.backdropFilter !== "none") {
      const origBg = h.style.background;
      const origBdf = h.style.backdropFilter;
      const origWbdf = h.style.getPropertyValue("-webkit-backdrop-filter");
      h.style.background = "#0c0c14";
      h.style.backdropFilter = "none";
      h.style.setProperty("-webkit-backdrop-filter", "none");
      restoreFns.push(() => {
        h.style.background = origBg;
        h.style.backdropFilter = origBdf;
        h.style.setProperty("-webkit-backdrop-filter", origWbdf);
      });
    }

    // Remove text-shadow (causes colored boxes behind SVG icons)
    if (cs.textShadow && cs.textShadow !== "none") {
      const orig = h.style.textShadow;
      h.style.textShadow = "none";
      restoreFns.push(() => { h.style.textShadow = orig; });
    }

    // Kill animations
    if (cs.animationName && cs.animationName !== "none") {
      const orig = h.style.animation;
      h.style.animation = "none";
      restoreFns.push(() => { h.style.animation = orig; });
    }
  });

  return () => restoreFns.forEach((fn) => fn());
}

export default function ExportButton({ targetRef, filename = "influencer-stats" }: ExportButtonProps) {
  const [isCapturing, setIsCapturing] = useState(false);

  const handleExport = async () => {
    if (!targetRef.current || isCapturing) return;

    setIsCapturing(true);
    let restore: (() => void) | null = null;

    try {
      const { toPng } = await import("html-to-image");
      const node = targetRef.current;

      // Apply inline style overrides
      restore = applyExportStyles(node);

      // Wait for styles to apply
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      const rect = node.getBoundingClientRect();
      const scale = 2;

      const dataUrl = await toPng(node, {
        backgroundColor: "#050508",
        pixelRatio: scale,
        width: rect.width,
        height: rect.height,
        canvasWidth: rect.width * scale,
        canvasHeight: rect.height * scale,
        filter: (el: Node) => {
          if (el instanceof Element) {
            const tag = el.tagName?.toLowerCase();
            if (tag === "script" || tag === "noscript") return false;
            if ((el as HTMLElement).dataset?.exportHide !== undefined) return false;
          }
          return true;
        },
      });

      restore();
      restore = null;

      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export failed:", err);
      restore?.();

      // Fallback: try toBlob from dom-to-image-more
      try {
        const domtoimage = await import("dom-to-image-more");
        const node = targetRef.current!;
        restore = applyExportStyles(node);
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

        const blob = await domtoimage.toBlob(node, { bgcolor: "#050508" });
        restore();
        restore = null;

        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.download = `${filename}.png`;
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      } catch (fallbackErr) {
        console.error("Fallback export also failed:", fallbackErr);
        restore?.();
      }
    } finally {
      restore?.();
      setIsCapturing(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isCapturing}
      className="glass-card px-4 py-2 text-xs font-medium text-[#00f0ff] border border-[#00f0ff]/20 hover:border-[#00f0ff]/40 hover:shadow-[0_0_12px_rgba(0,240,255,0.15)] transition-all duration-300 flex items-center gap-2 disabled:opacity-50 rounded-xl"
    >
      {isCapturing ? (
        <>
          <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Capturing...
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export PNG
        </>
      )}
    </button>
  );
}
