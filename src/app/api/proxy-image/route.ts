import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL parameter required" }, { status: 400 });
  }

  // Only allow proxying from known CDN domains
  const allowedDomains = [
    "cdninstagram.com",
    "instagram.com",
    "fbcdn.net",
    "tiktokcdn.com",
    "tiktok.com",
    "p16-sign.tiktokcdn-us.com",
    "p16-sign-sg.tiktokcdn.com",
    "p77-sign-sg.tiktokcdn.com",
  ];

  try {
    const parsedUrl = new URL(url);
    const isAllowed = allowedDomains.some((domain) =>
      parsedUrl.hostname.endsWith(domain)
    );

    if (!isAllowed) {
      return NextResponse.json({ error: "Domain not allowed" }, { status: 403 });
    }

    const imageRes = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: parsedUrl.hostname.includes("tiktok")
          ? "https://www.tiktok.com/"
          : "https://www.instagram.com/",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!imageRes.ok) {
      // Return a transparent 1x1 pixel as fallback
      const transparentPixel = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64"
      );
      return new NextResponse(transparentPixel, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=60",
        },
      });
    }

    const contentType = imageRes.headers.get("content-type") || "image/jpeg";
    const buffer = await imageRes.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    // Return transparent pixel on any error
    const transparentPixel = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    );
    return new NextResponse(transparentPixel, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=60",
      },
    });
  }
}
