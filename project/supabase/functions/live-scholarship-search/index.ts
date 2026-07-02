import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ScholarshipResult {
  external_id: string;
  source: string;
  name: string;
  provider: string;
  amount: number;
  eligibility?: string;
  deadline?: string;
  state?: string;
  sport?: string;
  girls_only: boolean;
  hostel_support: boolean;
  application_mode?: string;
  description?: string;
  application_url?: string;
  min_age?: number;
  max_age?: number;
  raw_data?: Record<string, unknown>;
}

// Mock data sources - in production, these would call real APIs
async function fetchGovernmentScholarships(filters: {
  sport?: string;
  state?: string;
  girls_only?: boolean;
}): Promise<ScholarshipResult[]> {
  // Simulating government portal data
  // In production, this would scrape/integrate with:
  // - https://scholarships.gov.in/
  // - State education department portals
  const scholarships: ScholarshipResult[] = [
    {
      external_id: "gov_sports_001",
      source: "government",
      name: "National Sports Development Fund Scholarship",
      provider: "Ministry of Youth Affairs & Sports",
      amount: 120000,
      eligibility: "National level athletes with valid ID",
      deadline: "2025-08-31",
      state: null,
      sport: "All",
      girls_only: false,
      hostel_support: true,
      application_mode: "Online",
      description: "Financial assistance for national level athletes for training and equipment",
      application_url: "https://yas.nic.in/sports-development-fund",
      raw_data: { category: "sports_development", ministry: "Youth Affairs" }
    },
    {
      external_id: "gov_beti_001",
      source: "government",
      name: "Beti Bachao Beti Padhao Sports Scholarship",
      provider: "Ministry of Women & Child Development",
      amount: 60000,
      eligibility: "Girl athletes from rural areas, age 10-18",
      deadline: "2025-09-15",
      state: null,
      sport: "All",
      girls_only: true,
      hostel_support: true,
      application_mode: "Online",
      description: "Special scholarship for girl athletes from economically weaker sections",
      raw_data: { scheme: "BBBP", category: "women_welfare" }
    },
    {
      external_id: "gov_khelo_002",
      source: "khelo_india",
      name: "Khelo India Athlete Support Scheme",
      provider: "Sports Authority of India",
      amount: 100000,
      eligibility: "Selected Khelo India athletes",
      deadline: "2025-07-30",
      state: null,
      sport: "All",
      girls_only: false,
      hostel_support: true,
      application_mode: " nomination",
      description: "Annual scholarship for identified talented athletes under Khelo India",
      application_url: "https://kheloindia.gov.in",
      raw_data: { scheme: "Khelo India", level: "identified_talent" }
    }
  ];

  return scholarships.filter(s => {
    if (filters.sport && s.sport !== "All" && s.sport !== filters.sport) return false;
    if (filters.state && s.state && s.state !== filters.state) return false;
    if (filters.girls_only !== undefined && filters.girls_only && !s.girls_only) return false;
    return true;
  });
}

async function fetchPrivateFoundationScholarships(filters: {
  sport?: string;
  state?: string;
  girls_only?: boolean;
}): Promise<ScholarshipResult[]> {
  // Simulating private foundation data
  const scholarships: ScholarshipResult[] = [
    {
      external_id: "pvt_tata_001",
      source: "private_foundation",
      name: "Tata Sports Excellence Scholarship",
      provider: "Tata Trusts",
      amount: 150000,
      eligibility: "State/National level athletes, family income below 5L",
      deadline: "2025-10-01",
      state: null,
      sport: "All",
      girls_only: false,
      hostel_support: true,
      application_mode: "Online",
      description: "Comprehensive support for talented athletes from underserved communities",
      application_url: "https://tatatrusts.org/sports",
      raw_data: { foundation: "Tata Trusts", focus: "sports_excellence" }
    },
    {
      external_id: "pvt_reliance_001",
      source: "private_foundation",
      name: "Reliance Foundation Youth Sports Scholarship",
      provider: "Reliance Foundation",
      amount: 80000,
      eligibility: "Athletes age 12-25, rural/urban divide focus",
      deadline: "2025-09-30",
      state: null,
      sport: "All",
      girls_only: false,
      hostel_support: false,
      application_mode: "Online",
      description: "Support for young athletes in football, basketball, athletics",
      application_url: "https://reliancefoundation.org/sports",
      raw_data: { foundation: "Reliance Foundation", sports_focus: ["football", "basketball", "athletics"] }
    },
    {
      external_id: "pvt_jsw_001",
      source: "private_foundation",
      name: "JSW Sports Excellence Scholarship",
      provider: "JSW Foundation",
      amount: 200000,
      eligibility: "International level potential, age 14-25",
      deadline: "2025-11-15",
      state: null,
      sport: "All",
      girls_only: false,
      hostel_support: true,
      application_mode: "Invitation + Application",
      description: "High-performance training support for potential Olympic athletes",
      application_url: "https://jsw.in/sports",
      raw_data: { foundation: "JSW", focus: "olympic_potential" }
    }
  ];

  return scholarships.filter(s => {
    if (filters.sport && s.sport !== "All" && s.sport !== filters.sport) return false;
    if (filters.state && s.state && s.state !== filters.state) return false;
    if (filters.girls_only !== undefined && filters.girls_only && !s.girls_only) return false;
    return true;
  });
}

async function fetchStateGovernmentScholarships(filters: {
  sport?: string;
  state?: string;
  girls_only?: boolean;
}): Promise<ScholarshipResult[]> {
  const stateScholarships: Record<string, ScholarshipResult[]> = {
    "Kerala": [
      {
        external_id: "state_kerala_001",
        source: "government",
        name: "Kerala State Sports Council Scholarship",
        provider: "Kerala State Sports Council",
        amount: 36000,
        eligibility: "Kerala residents, state level athletes",
        deadline: "2025-08-31",
        state: "Kerala",
        sport: "All",
        girls_only: false,
        hostel_support: true,
        application_mode: "Online",
        description: "Annual scholarship for sports development in Kerala"
      }
    ],
    "Karnataka": [
      {
        external_id: "state_karnataka_001",
        source: "government",
        name: "Karnataka Sports Scholarship Scheme",
        provider: "Department of Youth Empowerment & Sports, Karnataka",
        amount: 48000,
        eligibility: "Karnataka residents, represented state/nation",
        deadline: "2025-09-15",
        state: "Karnataka",
        sport: "All",
        girls_only: false,
        hostel_support: true,
        application_mode: "Online",
        description: "Financial assistance for Karnataka sports persons"
      }
    ],
    "Maharashtra": [
      {
        external_id: "state_maha_001",
        source: "government",
        name: "Chhatrapati Award Scholarship Maharashtra",
        provider: "Directorate of Sports and Youth Services, Maharashtra",
        amount: 60000,
        eligibility: "Maharashtra residents, state/national medalists",
        deadline: "2025-10-01",
        state: "Maharashtra",
        sport: "All",
        girls_only: false,
        hostel_support: true,
        application_mode: "Offline + Online",
        description: "Scholarship for Maharashtra state awardees"
      }
    ],
    "Tamil Nadu": [
      {
        external_id: "state_tn_001",
        source: "government",
        name: "Tamil Nadu Sports Development Authority Scholarship",
        provider: "SDAT Tamil Nadu",
        amount: 42000,
        eligibility: "Tamil Nadu residents, district level and above",
        deadline: "2025-09-30",
        state: "Tamil Nadu",
        sport: "All",
        girls_only: false,
        hostel_support: true,
        application_mode: "Online",
        description: "Support for Tamil Nadu athletes"
      }
    ]
  };

  if (filters.state && stateScholarships[filters.state]) {
    return stateScholarships[filters.state].filter(s => {
      if (filters.girls_only !== undefined && filters.girls_only && !s.girls_only) return false;
      return true;
    });
  }

  // Return all state scholarships if no specific state filter
  const allStateScholarships: ScholarshipResult[] = [];
  for (const scholarships of Object.values(stateScholarships)) {
    allStateScholarships.push(...scholarships);
  }
  return allStateScholarships;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const sport = url.searchParams.get("sport") || undefined;
    const state = url.searchParams.get("state") || undefined;
    const girls_only = url.searchParams.get("girls_only") === "true" ? true : undefined;
    const source = url.searchParams.get("source") || "all";

    const filters = { sport, state, girls_only };

    // Fetch from multiple sources in parallel
    const fetchPromises: Promise<ScholarshipResult[]>[] = [];

    if (source === "all" || source === "government") {
      fetchPromises.push(fetchGovernmentScholarships(filters));
      fetchPromises.push(fetchStateGovernmentScholarships(filters));
    }
    if (source === "all" || source === "khelo_india") {
      fetchPromises.push(fetchGovernmentScholarships(filters));
    }
    if (source === "all" || source === "private_foundation") {
      fetchPromises.push(fetchPrivateFoundationScholarships(filters));
    }

    const results = await Promise.all(fetchPromises);
    const allScholarships = results.flat();

    // Deduplicate by external_id
    const uniqueScholarships = Array.from(
      new Map(allScholarships.map(s => [s.external_id, s])).values()
    );

    // Sort by amount (descending) and deadline
    uniqueScholarships.sort((a, b) => {
      if (a.amount !== b.amount) return b.amount - a.amount;
      if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
      return 0;
    });

    return new Response(JSON.stringify({
      success: true,
      data: uniqueScholarships,
      count: uniqueScholarships.length,
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
