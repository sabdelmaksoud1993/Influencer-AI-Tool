export interface InfluencerStats {
  followers: number;
  avgLikes: number;
  avgComments: number;
  engagementRate: number;
  engagementLabel: string;
  likesToCommentsRatio: number;
  estimatedReach: number;
  scoreOutOf100: number;
  recommendation: string;
  influencerTier: string;
  aiJudgment: string;
}

export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function calculateEngagementRate(
  avgLikes: number,
  avgComments: number,
  followers: number
): number {
  if (followers === 0) return 0;
  return ((avgLikes + avgComments) / followers) * 100;
}

// ── Influencer Tier Classification ─────────────────────────────
// Industry-standard tier classification
export function getInfluencerTier(followers: number): string {
  if (followers >= 10_000_000) return "Mega";       // 10M+
  if (followers >= 1_000_000) return "Macro";        // 1M-10M
  if (followers >= 100_000) return "Mid-Tier";       // 100K-1M
  if (followers >= 10_000) return "Micro";           // 10K-100K
  if (followers >= 1_000) return "Nano";             // 1K-10K
  return "Starter";
}

// ── Tier-Adjusted Engagement Benchmarks ────────────────────────
// Bigger accounts naturally have lower engagement rates.
// These are industry-standard benchmarks per tier.
function getTierBenchmarks(followers: number): { low: number; avg: number; good: number; excellent: number } {
  if (followers >= 10_000_000) {
    // Mega influencers: 0.5-1.5% is normal, >2% is exceptional
    return { low: 0.3, avg: 0.5, good: 1.0, excellent: 1.5 };
  }
  if (followers >= 1_000_000) {
    // Macro: 1-3% is normal
    return { low: 0.5, avg: 1.0, good: 2.0, excellent: 3.0 };
  }
  if (followers >= 100_000) {
    // Mid-tier: 1.5-4% is normal
    return { low: 0.8, avg: 1.5, good: 3.0, excellent: 5.0 };
  }
  if (followers >= 10_000) {
    // Micro: 3-6% is normal
    return { low: 1.0, avg: 3.0, good: 5.0, excellent: 8.0 };
  }
  // Nano: higher engagement expected
  return { low: 1.5, avg: 4.0, good: 7.0, excellent: 12.0 };
}

// ── Tier-Adjusted Engagement Label ─────────────────────────────
export function getEngagementLabel(rate: number, followers?: number): string {
  if (followers && followers > 0) {
    const bench = getTierBenchmarks(followers);
    if (rate >= bench.excellent) return "Excellent";
    if (rate >= bench.good) return "Good";
    if (rate >= bench.avg) return "Average";
    return "Low";
  }
  // Fallback without tier context
  if (rate < 1) return "Low";
  if (rate <= 3) return "Average";
  if (rate <= 6) return "Good";
  return "Excellent";
}

export function getLabelColor(label: string): string {
  switch (label) {
    case "Low":
      return "text-red-500";
    case "Average":
      return "text-yellow-500";
    case "Good":
      return "text-green-500";
    case "Excellent":
      return "text-emerald-400";
    default:
      return "text-gray-400";
  }
}

// ── Smart Influencer Score (Tier-Aware) ────────────────────────
export function calculateInfluencerScore(
  engagementRate: number,
  followers: number,
  avgLikes: number,
  avgComments: number
): number {
  if (followers === 0) return 0;

  const bench = getTierBenchmarks(followers);

  // 1. Tier-Adjusted Engagement Score (0-30 points)
  // How well does this influencer perform RELATIVE TO THEIR TIER?
  let engagementScore = 0;
  if (engagementRate >= bench.excellent) {
    engagementScore = 30;
  } else if (engagementRate >= bench.good) {
    engagementScore = 22 + ((engagementRate - bench.good) / (bench.excellent - bench.good)) * 8;
  } else if (engagementRate >= bench.avg) {
    engagementScore = 15 + ((engagementRate - bench.avg) / (bench.good - bench.avg)) * 7;
  } else if (engagementRate >= bench.low) {
    engagementScore = 5 + ((engagementRate - bench.low) / (bench.avg - bench.low)) * 10;
  } else {
    engagementScore = (engagementRate / bench.low) * 5;
  }

  // 2. Absolute Reach Power (0-25 points)
  // Raw influence power — how many people actually see and interact
  let reachScore = 0;
  if (avgLikes >= 5_000_000) reachScore = 25;
  else if (avgLikes >= 1_000_000) reachScore = 20 + ((avgLikes - 1_000_000) / 4_000_000) * 5;
  else if (avgLikes >= 100_000) reachScore = 14 + ((avgLikes - 100_000) / 900_000) * 6;
  else if (avgLikes >= 10_000) reachScore = 8 + ((avgLikes - 10_000) / 90_000) * 6;
  else if (avgLikes >= 1_000) reachScore = 3 + ((avgLikes - 1_000) / 9_000) * 5;
  else reachScore = (avgLikes / 1_000) * 3;

  // 3. Audience Scale Bonus (0-20 points)
  // Logarithmic scale — having 600M followers IS inherently valuable
  let audienceScore = 0;
  if (followers > 0) {
    // log10(600M) ≈ 8.78, log10(1K) ≈ 3
    const logFollowers = Math.log10(followers);
    audienceScore = Math.min(((logFollowers - 2) / 7) * 20, 20);
  }

  // 4. Interaction Quality (0-15 points)
  // Comments-to-likes ratio indicates genuine conversation
  let interactionScore = 0;
  if (avgLikes > 0) {
    const commentRatio = avgComments / avgLikes;
    // A 1-5% comment-to-like ratio is healthy
    if (commentRatio >= 0.05) interactionScore = 15;
    else if (commentRatio >= 0.02) interactionScore = 10 + ((commentRatio - 0.02) / 0.03) * 5;
    else if (commentRatio >= 0.005) interactionScore = 5 + ((commentRatio - 0.005) / 0.015) * 5;
    else interactionScore = (commentRatio / 0.005) * 5;
  }

  // 5. Celebrity / Authority Bonus (0-10 points)
  // Massive accounts have brand authority that transcends raw engagement %
  let authorityBonus = 0;
  if (followers >= 100_000_000) {
    authorityBonus = 10; // Global icon status
  } else if (followers >= 50_000_000) {
    authorityBonus = 8;
  } else if (followers >= 10_000_000) {
    authorityBonus = 5;
  } else if (followers >= 1_000_000) {
    authorityBonus = 3;
  }

  const total = engagementScore + reachScore + audienceScore + interactionScore + authorityBonus;
  return Math.min(Math.round(total), 100);
}

// ── AI Judgment (Context-Aware Analysis) ───────────────────────
export function getAIJudgment(
  score: number,
  engagementRate: number,
  followers: number,
  avgLikes: number,
  avgComments: number
): string {
  const tier = getInfluencerTier(followers);
  const bench = getTierBenchmarks(followers);
  const tierLabel = getEngagementLabel(engagementRate, followers);
  const absLikes = avgLikes.toLocaleString();

  // Mega influencers with "low" raw % but massive absolute reach
  if (tier === "Mega" && engagementRate < 2 && avgLikes > 1_000_000) {
    return `Despite a ${engagementRate}% engagement rate (which looks low at face value), this is a Mega-tier influencer averaging ${absLikes} likes per post. At this scale, even a fraction of a percent translates to millions of interactions. Their brand authority and global reach make raw engagement % misleading — this is a top-tier partner for awareness and mass-market campaigns.`;
  }

  // Mega with genuinely good engagement — rare and exceptional
  if (tier === "Mega" && tierLabel === "Good" || tierLabel === "Excellent") {
    return `Exceptional. A Mega-tier influencer with ${tierLabel.toLowerCase()} engagement for their tier (${engagementRate}%) is extremely rare. This indicates an unusually loyal, active audience at massive scale — a premium partnership opportunity.`;
  }

  // Macro influencers
  if (tier === "Macro" && tierLabel === "Good") {
    return `Strong Macro-tier performer. ${engagementRate}% engagement at ${(followers / 1_000_000).toFixed(1)}M followers is above the tier benchmark of ${bench.avg}%. This influencer has built genuine audience loyalty at scale — ideal for brand partnerships that need both reach and authenticity.`;
  }

  if (tier === "Macro" && tierLabel === "Low") {
    return `Caution: This Macro-tier account has below-average engagement (${engagementRate}% vs the ${bench.avg}% tier benchmark). At ${(followers / 1_000_000).toFixed(1)}M followers, low engagement may indicate bought followers, disengaged audience, or content fatigue. Investigate audience authenticity before investing.`;
  }

  // Mid-tier — the sweet spot
  if (tier === "Mid-Tier" && engagementRate >= bench.good) {
    return `Sweet spot. Mid-tier influencers with ${engagementRate}% engagement rate often deliver the best ROI — large enough for meaningful reach, small enough for authentic audience relationships. Strong recommendation for performance-driven campaigns.`;
  }

  // Micro influencers with high engagement
  if ((tier === "Micro" || tier === "Nano") && engagementRate >= bench.good) {
    return `Hidden gem. This ${tier.toLowerCase()} influencer punches above their weight with ${engagementRate}% engagement (${tierLabel.toLowerCase()} for their tier). Their tight-knit community drives real action — perfect for niche targeting, authentic storytelling, and high-conversion campaigns.`;
  }

  // Micro/Nano with low engagement — concerning
  if ((tier === "Micro" || tier === "Nano") && tierLabel === "Low") {
    return `Red flag. Small accounts are expected to have higher engagement, but ${engagementRate}% is below the ${bench.avg}% benchmark for ${tier.toLowerCase()} influencers. This suggests limited audience interest or possible inauthentic followers. Not recommended unless the niche alignment is exceptionally strong.`;
  }

  // Generic fallbacks based on score
  if (score >= 75) {
    return `Top performer. With a score of ${score}/100, this influencer demonstrates strong metrics across the board for their tier. Their audience engagement, reach, and interaction quality all indicate a high-value partnership opportunity.`;
  }
  if (score >= 55) {
    return `Solid choice. Scoring ${score}/100, this influencer shows healthy metrics relative to their ${tier.toLowerCase()} tier. Good for campaigns that match their audience demographic and content style.`;
  }
  if (score >= 35) {
    return `Proceed with caution. At ${score}/100, the metrics are moderate for a ${tier.toLowerCase()} influencer. Consider a small test campaign before committing significant budget. Look into audience demographics and content alignment.`;
  }
  return `Not recommended at this time. A score of ${score}/100 suggests significant concerns about audience quality or engagement authenticity. The engagement rate of ${engagementRate}% falls below the ${bench.low}% minimum benchmark for ${tier.toLowerCase()} influencers.`;
}

// ── Legacy Recommendation (short version) ──────────────────────
export function getRecommendation(score: number, engagementRate: number, followers: number): string {
  if (followers === 0) return "No data available to make a recommendation.";

  const tier = getInfluencerTier(followers);

  if (score >= 75) {
    return "Highly recommended. Top-tier metrics for this influencer category.";
  }
  if (score >= 55) {
    return "Recommended. Solid performer with healthy audience engagement.";
  }
  if (score >= 35) {
    if (tier === "Mega" || tier === "Macro") {
      return "Worth considering for awareness campaigns. Massive reach compensates for moderate engagement rates.";
    }
    return "Consider with caution. Best for niche campaigns or smaller budgets.";
  }
  return "Not recommended. Investigate audience authenticity before investing.";
}

export function analyzeInfluencer(
  followers: number,
  likes: number[],
  comments: number[]
): InfluencerStats {
  const avgLikes = calculateAverage(likes);
  const avgComments = calculateAverage(comments);
  const engagementRate = calculateEngagementRate(avgLikes, avgComments, followers);
  const engagementLabel = getEngagementLabel(engagementRate, followers);
  const likesToCommentsRatio = avgComments > 0 ? avgLikes / avgComments : 0;
  const estimatedReach = Math.round(followers * (engagementRate / 100) * 3);
  const roundedRate = Math.round(engagementRate * 100) / 100;
  const scoreOutOf100 = calculateInfluencerScore(engagementRate, followers, avgLikes, avgComments);
  const recommendation = getRecommendation(scoreOutOf100, engagementRate, followers);
  const influencerTier = getInfluencerTier(followers);
  const aiJudgment = getAIJudgment(scoreOutOf100, roundedRate, followers, Math.round(avgLikes), Math.round(avgComments));

  return {
    followers,
    avgLikes: Math.round(avgLikes),
    avgComments: Math.round(avgComments),
    engagementRate: Math.round(engagementRate * 100) / 100,
    engagementLabel,
    likesToCommentsRatio: Math.round(likesToCommentsRatio * 10) / 10,
    estimatedReach,
    scoreOutOf100,
    recommendation,
    influencerTier,
    aiJudgment,
  };
}
