import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface MatchRequest {
  user_id: string;
  athlete_profile: {
    sport?: string;
    level?: string;
    state?: string;
    age?: number;
    achievements?: Array<{ title: string; level: string }>;
    goals?: string;
  };
  match_type: "scholarship" | "college";
  items: Array<{
    id: string;
    name: string;
    eligibility?: string;
    sport?: string;
    state?: string;
    min_age?: number;
    max_age?: number;
    required_achievement_level?: string;
    girls_only?: boolean;
    supported_sports?: string[];
  }>;
}

interface MatchResult {
  id: string;
  match_score: number;
  match_reasons: string[];
  recommendation: string;
}

function calculateMatchScore(
  athlete: MatchRequest["athlete_profile"],
  item: MatchRequest["items"][0]
): { score: number; reasons: string[] } {
  let score = 50; // Base score
  const reasons: string[] = [];

  // Sport match (high priority)
  if (item.sport && (item.sport === "All" || item.sport === athlete.sport)) {
    score += 20;
    reasons.push(`Matches your sport: ${athlete.sport || "various sports"}`);
  }

  // State match
  if (item.state && item.state === athlete.state) {
    score += 15;
    reasons.push(`Available in your state: ${athlete.state}`);
  }

  // Level match
  if (item.required_achievement_level && athlete.level) {
    const levelPriority = ["district", "state", "national", "international"];
    const athleteLevelIndex = levelPriority.indexOf(athlete.level.toLowerCase());
    const requiredLevelIndex = levelPriority.indexOf(item.required_achievement_level.toLowerCase());

    if (athleteLevelIndex >= requiredLevelIndex) {
      score += 15;
      reasons.push(`Your ${athlete.level} level meets the ${item.required_achievement_level} requirement`);
    } else {
      score -= 10;
      reasons.push(`Requires ${item.required_achievement_level} level (you're at ${athlete.level})`);
    }
  }

  // Age eligibility
  if (athlete.age) {
    if (item.min_age && athlete.age < item.min_age) {
      score -= 20;
      reasons.push(`Age requirement: minimum ${item.min_age} years`);
    } else if (item.max_age && athlete.age > item.max_age) {
      score -= 20;
      reasons.push(`Age requirement: maximum ${item.max_age} years`);
    } else {
      score += 10;
      reasons.push("Meets age eligibility criteria");
    }
  }

  // Girls-only bonus for female athletes (simulated)
  if (item.girls_only) {
    score += 5;
    reasons.push("Exclusive scholarship for girl athletes");
  }

  // Sports quota for colleges
  if (item.supported_sports && item.supported_sports.length > 0 && athlete.sport) {
    if (item.supported_sports.includes(athlete.sport) || item.supported_sports.includes("All")) {
      score += 10;
      reasons.push(`College supports your sport: ${athlete.sport}`);
    }
  }

  // Goals alignment (simulated AI analysis)
  if (athlete.goals) {
    const goalsLower = athlete.goals.toLowerCase();
    if (goalsLower.includes("professional") || goalsLower.includes("international")) {
      score += 5;
      reasons.push("Aligns with your competitive goals");
    }
    if (goalsLower.includes("education") || goalsLower.includes("college")) {
      score += 5;
      reasons.push("Supports your educational aspirations");
    }
  }

  // Cap score at 100
  score = Math.min(100, Math.max(0, score));

  return { score, reasons };
}

function generateRecommendation(matchScore: number, reasons: string[]): string {
  if (matchScore >= 80) {
    return "Excellent match! Highly recommended - this opportunity aligns perfectly with your profile.";
  } else if (matchScore >= 60) {
    return "Good match! This opportunity suits your profile well. Consider applying.";
  } else if (matchScore >= 40) {
    return "Moderate match. Some requirements may need attention before applying.";
  } else {
    return "Low match. This opportunity may not be the best fit for your current profile.";
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({
        success: false,
        error: "Method not allowed. Use POST."
      }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const body: MatchRequest = await req.json();

    if (!body.user_id || !body.athlete_profile || !body.items || body.items.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: "Missing required fields: user_id, athlete_profile, items"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Calculate match scores for each item
    const matchResults: MatchResult[] = body.items.map(item => {
      const { score, reasons } = calculateMatchScore(body.athlete_profile, item);
      return {
        id: item.id,
        match_score: score,
        match_reasons: reasons,
        recommendation: generateRecommendation(score, reasons)
      };
    });

    // Sort by match score (descending)
    matchResults.sort((a, b) => b.match_score - a.match_score);

    // Top matches (score >= 70)
    const topMatches = matchResults.filter(m => m.match_score >= 70);

    // Potential matches (score 40-69)
    const potentialMatches = matchResults.filter(m => m.match_score >= 40 && m.match_score < 70);

    return new Response(JSON.stringify({
      success: true,
      data: {
        all_matches: matchResults,
        top_matches: topMatches,
        potential_matches: potentialMatches,
        match_type: body.match_type,
        summary: {
          total_analyzed: matchResults.length,
          excellent_matches: matchResults.filter(m => m.match_score >= 80).length,
          good_matches: matchResults.filter(m => m.match_score >= 60 && m.match_score < 80).length,
          moderate_matches: matchResults.filter(m => m.match_score >= 40 && m.match_score < 60).length
        }
      },
      analyzed_at: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
