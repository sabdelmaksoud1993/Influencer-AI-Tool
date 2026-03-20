import { NextRequest, NextResponse } from "next/server";
import { analyzeInfluencer } from "@/lib/calculations";
import { scrapeProfile } from "@/lib/scraper";
import { getMockData } from "@/lib/mockData";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileUrl } = body;

    if (!profileUrl || typeof profileUrl !== "string") {
      return NextResponse.json(
        { error: "Profile URL is required" },
        { status: 400 }
      );
    }

    // API key: prefer header from client, fall back to server env var
    const clientKey = request.headers.get("x-api-key") || "";
    const apiKey = clientKey || process.env.RAPIDAPI_KEY || "";

    const platform = profileUrl.toLowerCase().includes("tiktok")
      ? "TikTok"
      : "Instagram";

    let followers: number;
    let likes: number[];
    let comments: number[];
    let displayName: string | undefined;
    let profilePicUrl: string | undefined;
    let bio: string | undefined;
    let dataSource: "live" | "demo";

    try {
      const scraped = await scrapeProfile(profileUrl, apiKey);
      followers = scraped.followers;
      likes = [scraped.avgLikes];
      comments = [scraped.avgComments];
      displayName = scraped.displayName;
      profilePicUrl = scraped.profilePicUrl;
      bio = scraped.bio;
      dataSource = "live";
    } catch {
      const mock = getMockData(profileUrl);
      followers = mock.followers;
      likes = mock.likes;
      comments = mock.comments;
      displayName = mock.displayName;
      bio = mock.bio;
      dataSource = "demo";
    }

    const stats = analyzeInfluencer(followers, likes, comments);

    return NextResponse.json({
      ...stats,
      platform,
      profileUrl,
      displayName,
      profilePicUrl,
      bio,
      dataSource,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 }
    );
  }
}
