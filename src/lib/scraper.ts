export interface ScrapedProfile {
  username: string;
  displayName: string;
  followers: number;
  avgLikes: number;
  avgComments: number;
  postCount: number;
  profilePicUrl?: string;
  bio?: string;
}

function extractUsername(url: string): string {
  const cleaned = url.split("?")[0].replace(/\/+$/, "");
  const parts = cleaned.split("/");
  return parts[parts.length - 1].replace(/^@/, "");
}

function detectPlatform(url: string): "instagram" | "tiktok" {
  if (url.toLowerCase().includes("tiktok")) return "tiktok";
  return "instagram";
}

// ── Instagram via RapidAPI (instagram120) ──────────────────────
async function scrapeInstagram(username: string, apiKey: string): Promise<ScrapedProfile> {
  if (!apiKey) throw new Error("NO_API_KEY");

  const host = "instagram120.p.rapidapi.com";

  // Fetch profile info
  const profileRes = await fetch(`https://${host}/api/instagram/profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": host,
    },
    body: JSON.stringify({ username }),
  });

  if (!profileRes.ok) {
    throw new Error(`Instagram API error: ${profileRes.status}`);
  }

  const profileData = await profileRes.json();
  const info = profileData.result;

  if (!info) {
    throw new Error("Instagram profile not found");
  }

  const followers = info.edge_followed_by?.count ?? 0;
  const displayName = info.full_name ?? username;
  const profilePicUrl = info.profile_pic_url_hd ?? info.profile_pic_url ?? undefined;
  const bio = info.biography ?? undefined;

  // Fetch recent posts for engagement data
  const postsRes = await fetch(`https://${host}/api/instagram/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": host,
    },
    body: JSON.stringify({ username, maxId: "" }),
  });

  let avgLikes = 0;
  let avgComments = 0;
  let postCount = 0;

  if (postsRes.ok) {
    const postsData = await postsRes.json();
    const edges = postsData.result?.edges ?? [];
    const recentPosts = edges.slice(0, 12);
    postCount = recentPosts.length;

    if (postCount > 0) {
      const totalLikes = recentPosts.reduce(
        (sum: number, edge: { node?: { like_count?: number } }) =>
          sum + (edge.node?.like_count ?? 0),
        0
      );
      const totalComments = recentPosts.reduce(
        (sum: number, edge: { node?: { comment_count?: number } }) =>
          sum + (edge.node?.comment_count ?? 0),
        0
      );
      avgLikes = Math.round(totalLikes / postCount);
      avgComments = Math.round(totalComments / postCount);
    }
  }

  return { username, displayName, followers, avgLikes, avgComments, postCount, profilePicUrl, bio };
}

// ── TikTok via RapidAPI (tiktok-api23) ────────────────────────
async function scrapeTikTok(username: string, apiKey: string): Promise<ScrapedProfile> {
  if (!apiKey) throw new Error("NO_API_KEY");

  const host = "tiktok-api23.p.rapidapi.com";

  // Fetch user info
  const profileRes = await fetch(
    `https://${host}/api/user/info?uniqueId=${encodeURIComponent(username)}`,
    {
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": host,
      },
    }
  );

  if (!profileRes.ok) {
    throw new Error(`TikTok API error: ${profileRes.status}`);
  }

  const profileData = await profileRes.json();
  const userInfo = profileData.userInfo?.user ?? {};
  const stats = profileData.userInfo?.stats ?? {};

  const followers = stats.followerCount ?? 0;
  const displayName = userInfo.nickname ?? username;
  const profilePicUrl = userInfo.avatarLarger ?? userInfo.avatarMedium ?? undefined;
  const bio = userInfo.signature ?? undefined;
  const secUid = userInfo.secUid;

  let avgLikes = 0;
  let avgComments = 0;
  let postCount = 0;

  // Fetch recent posts (requires secUid)
  if (secUid) {
    const postsRes = await fetch(
      `https://${host}/api/user/posts?secUid=${encodeURIComponent(secUid)}&count=12`,
      {
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": host,
        },
      }
    );

    if (postsRes.ok) {
      const postsData = await postsRes.json();
      const items = postsData.data?.itemList ?? [];
      const recentPosts = items.slice(0, 12);
      postCount = recentPosts.length;

      if (postCount > 0) {
        const totalLikes = recentPosts.reduce(
          (sum: number, item: { stats?: { diggCount?: number } }) =>
            sum + (item.stats?.diggCount ?? 0),
          0
        );
        const totalComments = recentPosts.reduce(
          (sum: number, item: { stats?: { commentCount?: number } }) =>
            sum + (item.stats?.commentCount ?? 0),
          0
        );
        avgLikes = Math.round(totalLikes / postCount);
        avgComments = Math.round(totalComments / postCount);
      }
    }
  }

  return { username, displayName, followers, avgLikes, avgComments, postCount, profilePicUrl, bio };
}

// ── Main entry point ────────────────────────────────────────────
export async function scrapeProfile(profileUrl: string, apiKey?: string): Promise<ScrapedProfile> {
  const key = apiKey || process.env.RAPIDAPI_KEY || "";
  const username = extractUsername(profileUrl);
  const platform = detectPlatform(profileUrl);

  if (platform === "tiktok") {
    return scrapeTikTok(username, key);
  }
  return scrapeInstagram(username, key);
}
