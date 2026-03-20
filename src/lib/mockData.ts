interface MockProfile {
  followers: number;
  likes: number[];
  comments: number[];
  displayName: string;
  bio?: string;
  profilePicUrl?: string;
}

const knownProfiles: Record<string, MockProfile> = {
  cristiano: {
    displayName: "Cristiano Ronaldo",
    bio: "Football legend. SiuuuU!",
    followers: 636000000,
    likes: [12500000, 9800000, 15200000, 8700000, 11300000, 13600000, 10100000, 14800000, 9500000, 11900000],
    comments: [185000, 142000, 210000, 125000, 168000, 195000, 150000, 198000, 135000, 172000],
  },
  leomessi: {
    displayName: "Leo Messi",
    bio: "Official Instagram account",
    followers: 504000000,
    likes: [11000000, 8500000, 14000000, 9200000, 10800000, 12500000, 7800000, 13200000, 9900000, 11500000],
    comments: [120000, 95000, 175000, 105000, 130000, 145000, 88000, 160000, 110000, 135000],
  },
  kyliejenner: {
    displayName: "Kylie Jenner",
    bio: "CEO of Kylie Cosmetics",
    followers: 399000000,
    likes: [5200000, 4800000, 6100000, 4500000, 5800000, 5000000, 6500000, 4200000, 5500000, 5900000],
    comments: [52000, 48000, 65000, 42000, 58000, 50000, 70000, 38000, 55000, 62000],
  },
  therock: {
    displayName: "Dwayne Johnson",
    bio: "Mana. Gratitude. Tequila.",
    followers: 395000000,
    likes: [3800000, 4200000, 3500000, 4800000, 3200000, 4500000, 3900000, 4100000, 3600000, 4300000],
    comments: [28000, 32000, 25000, 38000, 22000, 35000, 29000, 31000, 26000, 33000],
  },
  khloekardashian: {
    displayName: "Khloe Kardashian",
    bio: "mommy x2",
    followers: 311000000,
    likes: [2800000, 3100000, 2500000, 3400000, 2900000, 2700000, 3200000, 2600000, 3000000, 2850000],
    comments: [22000, 25000, 18000, 28000, 23000, 20000, 26000, 19000, 24000, 21000],
  },
  khaby: {
    displayName: "Khaby Lame",
    bio: "If u wanna laugh u r in the right place",
    followers: 162500000,
    likes: [8500000, 12000000, 6800000, 15000000, 9200000, 11000000, 7300000, 13200000, 10500000, 8900000],
    comments: [85000, 120000, 68000, 150000, 92000, 110000, 73000, 132000, 105000, 89000],
  },
  charlidamelio: {
    displayName: "Charli D'Amelio",
    bio: "dancer & creator",
    followers: 155000000,
    likes: [4500000, 5200000, 3800000, 6100000, 4900000, 5500000, 4200000, 5800000, 4600000, 5100000],
    comments: [45000, 52000, 38000, 61000, 49000, 55000, 42000, 58000, 46000, 51000],
  },
};

const defaultProfiles: Record<string, MockProfile> = {
  instagram: {
    displayName: "Sample Instagram Creator",
    bio: "Content creator & storyteller",
    followers: 52400,
    likes: [1200, 980, 1450, 1100, 890, 1320, 1050, 1180, 950, 1280],
    comments: [85, 62, 110, 78, 55, 95, 70, 88, 60, 92],
  },
  tiktok: {
    displayName: "Sample TikTok Creator",
    bio: "Making content that matters",
    followers: 128000,
    likes: [8500, 12000, 6800, 9200, 15000, 7300, 11000, 8900, 10500, 13200],
    comments: [320, 480, 250, 380, 620, 290, 450, 360, 410, 520],
  },
};

function extractUsername(url: string): string {
  const cleaned = url.split("?")[0].replace(/\/+$/, "");
  const parts = cleaned.split("/");
  const username = parts[parts.length - 1].replace(/^@/, "").toLowerCase();
  return username;
}

export function getMockData(profileUrl: string): MockProfile {
  const username = extractUsername(profileUrl);

  if (knownProfiles[username]) {
    return knownProfiles[username];
  }

  const isTikTok =
    profileUrl.toLowerCase().includes("tiktok") ||
    profileUrl.toLowerCase().includes("tik tok");

  return isTikTok ? defaultProfiles.tiktok : defaultProfiles.instagram;
}

export function getAvailableMockProfiles(): { username: string; displayName: string; platform: string }[] {
  return Object.entries(knownProfiles).map(([username, profile]) => {
    const isTikTok = ["khaby", "charlidamelio"].includes(username);
    return {
      username,
      displayName: profile.displayName,
      platform: isTikTok ? "TikTok" : "Instagram",
    };
  });
}
