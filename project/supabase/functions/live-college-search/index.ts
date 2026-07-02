import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CollegeResult {
  external_id: string;
  source: string;
  name: string;
  location?: string;
  state?: string;
  sports_quota: boolean;
  fee_concession: number;
  hostel: boolean;
  supported_sports: string[];
  quota_rules?: string;
  required_achievement_level?: string;
  academic_streams: string[];
  website_url?: string;
  contact_email?: string;
  contact_phone?: string;
  nirf_ranking?: number;
  raw_data?: Record<string, unknown>;
}

// Mock data sources - in production, these would call real APIs
async function fetchNirfColleges(filters: {
  state?: string;
  sports_quota?: boolean;
}): Promise<CollegeResult[]> {
  // Simulating NIRF ranking data
  // In production, this would integrate with:
  // - https://www.nirfindia.org/
  const colleges: CollegeResult[] = [
    {
      external_id: "nirf_001",
      source: "nirf",
      name: "Lady Shri Ram College for Women, Delhi",
      location: "New Delhi",
      state: "Delhi",
      sports_quota: true,
      fee_concession: 25,
      hostel: true,
      supported_sports: ["Badminton", "Basketball", "Table Tennis", "Athletics"],
      quota_rules: "Sports quota: 5% seats, state/national level achievement required",
      required_achievement_level: "state",
      academic_streams: ["Arts", "Science", "Commerce"],
      nirf_ranking: 2,
      website_url: "https://lsr.edu.in",
      contact_email: "sports@lsr.edu.in",
      raw_data: { nirf_category: "college", type: "women" }
    },
    {
      external_id: "nirf_002",
      source: "nirf",
      name: "St. Stephen's College, Delhi",
      location: "New Delhi",
      state: "Delhi",
      sports_quota: true,
      fee_concession: 20,
      hostel: true,
      supported_sports: ["Cricket", "Football", "Hockey", "Athletics", "Basketball"],
      quota_rules: "Sports quota: 5% seats, excellence in sports at recognized level",
      required_achievement_level: "district",
      academic_streams: ["Arts", "Science"],
      nirf_ranking: 4,
      website_url: "https://ststephens.edu",
      raw_data: { nirf_category: "college" }
    },
    {
      external_id: "nirf_003",
      source: "nirf",
      name: "Miranda House, Delhi",
      location: "New Delhi",
      state: "Delhi",
      sports_quota: true,
      fee_concession: 30,
      hostel: true,
      supported_sports: ["Badminton", "Volleyball", "Athletics", "Chess"],
      quota_rules: "Sports quota: 3% seats for women athletes",
      required_achievement_level: "state",
      academic_streams: ["Arts", "Science"],
      nirf_ranking: 1,
      website_url: "https://mirandahouse.ac.in",
      raw_data: { nirf_category: "college", type: "women" }
    },
    {
      external_id: "nirf_004",
      source: "nirf",
      name: "Loyola College, Chennai",
      location: "Chennai",
      state: "Tamil Nadu",
      sports_quota: true,
      fee_concession: 15,
      hostel: true,
      supported_sports: ["Football", "Cricket", "Athletics", "Basketball", "Volleyball"],
      quota_rules: "Sports quota: 5% seats, Tamil Nadu state sports certification accepted",
      required_achievement_level: "state",
      academic_streams: ["Arts", "Science", "Commerce"],
      nirf_ranking: 6,
      website_url: "https://loyolacollege.edu.in",
      raw_data: { nirf_category: "college" }
    }
  ];

  return colleges.filter(c => {
    if (filters.state && c.state !== filters.state) return false;
    if (filters.sports_quota !== undefined && filters.sports_quota && !c.sports_quota) return false;
    return true;
  });
}

async function fetchUgcColleges(filters: {
  state?: string;
  sports_quota?: boolean;
}): Promise<CollegeResult[]> {
  // Simulating UGC recognized colleges with sports programs
  const colleges: CollegeResult[] = [
    {
      external_id: "ugc_001",
      source: "ugc",
      name: "Fergusson College, Pune",
      location: "Pune",
      state: "Maharashtra",
      sports_quota: true,
      fee_concession: 20,
      hostel: true,
      supported_sports: ["Athletics", "Badminton", "Basketball", "Football", "Hockey", "Swimming"],
      quota_rules: "Sports quota: 5% seats, Maharashtra state level or above",
      required_achievement_level: "state",
      academic_streams: ["Arts", "Science", "Commerce"],
      nirf_ranking: 45,
      website_url: "https://fergusson.edu.in",
      raw_data: { ugc_recognition: "2(f)", naac_grade: "A" }
    },
    {
      external_id: "ugc_002",
      source: "ugc",
      name: "St. Xavier's College, Mumbai",
      location: "Mumbai",
      state: "Maharashtra",
      sports_quota: true,
      fee_concession: 15,
      hostel: false,
      supported_sports: ["Football", "Basketball", "Table Tennis", "Athletics"],
      quota_rules: "Sports quota: 3% seats, state level achievement in last 2 years",
      required_achievement_level: "state",
      academic_streams: ["Arts", "Science", "Commerce"],
      nirf_ranking: 20,
      website_url: "https://xaviers.edu",
      raw_data: { naac_grade: "A++" }
    },
    {
      external_id: "ugc_003",
      source: "ugc",
      name: "Christ University, Bangalore",
      location: "Bangalore",
      state: "Karnataka",
      sports_quota: true,
      fee_concession: 25,
      hostel: true,
      supported_sports: ["Athletics", "Badminton", "Basketball", "Football", "Cricket", "Volleyball"],
      quota_rules: "Sports quota: 5% seats, national/international level preferred",
      required_achievement_level: "state",
      academic_streams: ["Arts", "Science", "Commerce", "Management"],
      nirf_ranking: 10,
      website_url: "https://christuniversity.in",
      raw_data: { deemed_university: true, naac_grade: "A++" }
    },
    {
      external_id: "ugc_004",
      source: "ugc",
      name: "Madras Christian College, Chennai",
      location: "Chennai",
      state: "Tamil Nadu",
      sports_quota: true,
      fee_concession: 20,
      hostel: true,
      supported_sports: ["Cricket", "Hockey", "Football", "Athletics", "Badminton"],
      quota_rules: "Sports quota: 5% seats, district level minimum required",
      required_achievement_level: "district",
      academic_streams: ["Arts", "Science", "Commerce"],
      website_url: "https://mcc.edu.in",
      raw_data: { naac_grade: "A" }
    }
  ];

  return colleges.filter(c => {
    if (filters.state && c.state !== filters.state) return false;
    if (filters.sports_quota !== undefined && filters.sports_quota && !c.sports_quota) return false;
    return true;
  });
}

async function fetchSaiInstitutes(filters: {
  state?: string;
}): Promise<CollegeResult[]> {
  // SAI (Sports Authority of India) recognized institutes
  const institutes: CollegeResult[] = [
    {
      external_id: "sai_001",
      source: "sai",
      name: "Sports Authority of India, Bengaluru",
      location: "Bengaluru",
      state: "Karnataka",
      sports_quota: true,
      fee_concession: 100,
      hostel: true,
      supported_sports: ["Athletics", "Swimming", "Badminton", "Boxing", "Wrestling", "Weightlifting"],
      quota_rules: "Selection through SAI trials, full scholarship available",
      required_achievement_level: "state",
      academic_streams: [],
      website_url: "https://sportsauthorityofindia.nic.in",
      contact_email: "sai.bengaluru@sai.gov.in",
      raw_data: { institute_type: "SAI", full_scholarship: true }
    },
    {
      external_id: "sai_002",
      source: "sai",
      name: "Netaji Subhas National Institute of Sports, Patiala",
      location: "Patiala",
      state: "Punjab",
      sports_quota: true,
      fee_concession: 100,
      hostel: true,
      supported_sports: ["Athletics", "Football", "Hockey", "Boxing", " Wrestling", "Weightlifting", "Gymnastics"],
      quota_rules: "Diploma and certificate courses, national level athletes",
      required_achievement_level: "national",
      academic_streams: ["Sports Science", "Sports Medicine"],
      website_url: "https://nsnis.org",
      contact_email: "info@nsnis.org",
      nirf_ranking: null,
      raw_data: { institute_type: "NSNIS", prestige: "national_institute" }
    },
    {
      external_id: "sai_003",
      source: "sai",
      name: "Lakshmibai National College of Physical Education, Thiruvananthapuram",
      location: "Thiruvananthapuram",
      state: "Kerala",
      sports_quota: true,
      fee_concession: 80,
      hostel: true,
      supported_sports: ["Athletics", "Badminton", "Football", "Basketball", "Volleyball", "Swimming"],
      quota_rules: "Physical education degrees, sports quota available",
      required_achievement_level: "state",
      academic_streams: ["Physical Education", "Sports Science"],
      website_url: "https://lncpe.gov.in",
      raw_data: { institute_type: "LNCPE", under_sai: true }
    }
  ];

  return institutes.filter(c => {
    if (filters.state && c.state !== filters.state) return false;
    return true;
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const state = url.searchParams.get("state") || undefined;
    const sports_quota = url.searchParams.get("sports_quota") === "true" ? true : undefined;
    const source = url.searchParams.get("source") || "all";

    const filters = { state, sports_quota };

    // Fetch from multiple sources in parallel
    const fetchPromises: Promise<CollegeResult[]>[] = [];

    if (source === "all" || source === "nirf") {
      fetchPromises.push(fetchNirfColleges(filters));
    }
    if (source === "all" || source === "ugc") {
      fetchPromises.push(fetchUgcColleges(filters));
    }
    if (source === "all" || source === "sai") {
      fetchPromises.push(fetchSaiInstitutes(filters));
    }

    const results = await Promise.all(fetchPromises);
    const allColleges = results.flat();

    // Deduplicate by external_id
    const uniqueColleges = Array.from(
      new Map(allColleges.map(c => [c.external_id, c])).values()
    );

    // Sort by NIRF ranking (nulls last), then by name
    uniqueColleges.sort((a, b) => {
      if (a.nirf_ranking && b.nirf_ranking) return a.nirf_ranking - b.nirf_ranking;
      if (a.nirf_ranking) return -1;
      if (b.nirf_ranking) return 1;
      return a.name.localeCompare(b.name);
    });

    return new Response(JSON.stringify({
      success: true,
      data: uniqueColleges,
      count: uniqueColleges.length,
      cached_at: new Date().toISOString(),
      filters_applied: filters
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
