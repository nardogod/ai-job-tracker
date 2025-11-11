"use client";

import { useState, useEffect } from "react";
import { JobSearchForm } from "@/components/forms/JobSearchForm";

interface ScrapedJob {
  title: string;
  company: string;
  location: string;
  url: string;
  description?: string;
  posted_date?: Date;
  cost?: {
    requests: number;
    source: string; // 'lever', 'greenhouse', etc.
  };
}

interface ApiUsage {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd: number;
}

// Profile Form Component
function ProfileFormComponent({
  onSubmit,
  onCancel,
  initialData,
}: {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    experience_years: initialData?.experience_years || 0,
    skills: initialData?.skills?.join(", ") || "",
    location_preference: initialData?.location_preference || "Stockholm, Sweden",
    visa_status: initialData?.visa_status || "has_permit",
    languages: initialData?.languages || { English: "fluent" },
    company_size_preference: initialData?.company_size_preference || "any",
    remote_preference: initialData?.remote_preference || "flexible",
    min_salary: initialData?.min_salary || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const skillsArray = formData.skills
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Ensure languages is properly formatted as an object
    const languages = typeof formData.languages === 'object' && formData.languages !== null && !Array.isArray(formData.languages)
      ? formData.languages
      : { English: "fluent" };

    onSubmit({
      name: formData.name,
      email: formData.email,
      experience_years: Number(formData.experience_years),
      skills: skillsArray,
      location_preference: formData.location_preference,
      visa_status: formData.visa_status,
      languages: languages,
      company_size_preference: formData.company_size_preference,
      remote_preference: formData.remote_preference,
      min_salary: formData.min_salary ? Number(formData.min_salary) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Experience (years) *
        </label>
        <input
          type="number"
          required
          min="0"
          value={formData.experience_years}
          onChange={(e) =>
            setFormData({
              ...formData,
              experience_years: Number(e.target.value),
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Skills (comma-separated) *
        </label>
        <input
          type="text"
          required
          placeholder="Python, TypeScript, Machine Learning, LLMs"
          value={formData.skills}
          onChange={(e) =>
            setFormData({ ...formData, skills: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location Preference *
        </label>
        <input
          type="text"
          required
          value={formData.location_preference}
          onChange={(e) =>
            setFormData({ ...formData, location_preference: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Visa Status
        </label>
        <select
          value={formData.visa_status}
          onChange={(e) =>
            setFormData({ ...formData, visa_status: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="has_permit">Has Permit</option>
          <option value="needs_sponsorship">Needs Sponsorship</option>
          <option value="eu_citizen">EU Citizen</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Remote Preference
        </label>
        <select
          value={formData.remote_preference}
          onChange={(e) =>
            setFormData({ ...formData, remote_preference: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="office">Office</option>
          <option value="hybrid">Hybrid</option>
          <option value="remote">Remote</option>
          <option value="flexible">Flexible</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Min Salary (SEK/year, optional)
        </label>
        <input
          type="number"
          min="0"
          value={formData.min_salary}
          onChange={(e) =>
            setFormData({ ...formData, min_salary: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Save Profile
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function HomePage() {
  const [jobs, setJobs] = useState<ScrapedJob[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalUsage, setTotalUsage] = useState<ApiUsage | null>(null);
  const [jobUsage, setJobUsage] = useState<Map<string, ApiUsage>>(new Map());
  const [isSwedenFilterActive, setIsSwedenFilterActive] = useState(true);
  const [searchErrors, setSearchErrors] = useState<string[]>([]);
  const [arbetsSearchType, setArbetsSearchType] = useState<
    "general" | "market"
  >("general");
  const [arbetsCity, setArbetsCity] = useState<string>("01"); // Stockholm by default
  const [arbetsOffset, setArbetsOffset] = useState<number>(0);
  const [hasMoreJobs, setHasMoreJobs] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [dateFilter, setDateFilter] = useState<string>("all"); // "all", "today", "yesterday", "7days", "30days", "custom"
  const [customDays, setCustomDays] = useState<number>(7);
  const [selectedCategory, setSelectedCategory] = useState<string>("all"); // "all" or category name
  const [experienceFilter, setExperienceFilter] = useState<string>("all"); // "all", "junior", "mid", "senior", "lead", "intern"
  const [loadingAllJobs, setLoadingAllJobs] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<{
    current: number;
    total: number | null;
  }>({ current: 0, total: null });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const filterSwedenJobs = (jobs: ScrapedJob[]): ScrapedJob[] => {
    return jobs.filter((job) => {
      const loc = job.location.toLowerCase();
      return (
        loc.includes("sweden") ||
        loc.includes("stockholm") ||
        loc.includes("gothenburg") ||
        loc.includes("göteborg") ||
        loc.includes("malmö") ||
        loc.includes("malmo") ||
        loc.includes("uppsala") ||
        loc.includes("örebro")
      );
    });
  };

  const detectJobSource = (url: string): string => {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      if (hostname.includes("lever.co")) return "Lever";
      if (hostname.includes("greenhouse.io")) return "Greenhouse";
      if (hostname.includes("workable.com")) return "Workable";
      if (hostname.includes("ashbyhq.com")) return "Ashby";
      if (hostname.includes("king.com")) return "King";
      if (hostname.includes("spotify.com")) return "Spotify";
      if (hostname.includes("arbetsformedlingen.se"))
        return "Arbetsförmedlingen";
      return "Custom";
    } catch {
      return "Custom";
    }
  };

  // Categorize jobs by niche/category
  const categorizeJob = (job: ScrapedJob): string => {
    const title = job.title.toLowerCase();
    const description = (job.description || "").toLowerCase();
    const text = `${title} ${description}`;

    // STEP 1: Check for high-confidence IT/Technology terms FIRST (before exclusions)
    const highConfidenceITTerms = [
      "systemadministratör", "system administrator",
      "it-specialist", "it specialist",
      "it-ingenjör", "it engineer",
      "it-tekniker", "it technician",
      "it-administratör", "it administrator",
      "it-arkitekt", "it architect",
      "it-support", "it support",
      "data engineer", "dataingenjör",
      "data scientist", "datascientist", "datavetare",
      "data analyst", "dataanalytiker",
      "systemutvecklare", "system developer",
      "mjukvaruutvecklare", "software developer",
      "webbutvecklare", "web developer",
      "applikationsutvecklare", "application developer",
      "systemingenjör", "system engineer",
      "mjukvaruingenjör", "software engineer",
      "nätverksingenjör", "network engineer",
      "databasingenjör", "database engineer",
      "nätverkstekniker", "network technician",
      "systemtekniker", "system technician",
      "databasadministratör", "database administrator",
      "systemarkitekt", "system architect",
      "mjukvaruarkitekt", "software architect",
      "plattformsutvecklare", "platform developer",
      "fullstack", "full stack", "fullstackutvecklare",
      "backendutvecklare", "backend developer",
      "frontendutvecklare", "frontend developer",
      "apputvecklare", "app developer",
      "mobilutvecklare", "mobile developer",
      "devops", "devops engineer",
      "cloud engineer", "cloud architect",
      "cybersecurity", "cybersäkerhet",
      "it-säkerhet", "it security",
      "helpdesk", "help desk",
    ];

    // Check for IT context with network/backend (separate check)
    const hasNetworkInITContext = 
      (text.includes("nätverk") || text.includes("network")) &&
      (text.includes("windows") || text.includes("linux") || text.includes("backend"));

    // Check high-confidence IT terms (but exclude if it's financial system admin)
    const hasHighConfidenceIT = highConfidenceITTerms.some((term) => text.includes(term)) || hasNetworkInITContext;
    
    if (hasHighConfidenceIT) {
      // Exclude if it's a financial/administrative system
      if (!(text.includes("systemförvaltare") && text.includes("ekonomi")) &&
          !(text.includes("ekonomisystem") && text.includes("förvaltare"))) {
        return "IT/Technology";
      }
    }

    // STEP 2: Check for systemförvaltare with ekonomi (Administrative, not IT)
    if (text.includes("systemförvaltare") && text.includes("ekonomi")) {
      // Will be categorized as Administrative below
    } else if (text.includes("systemförvaltare") && 
               !text.includes("ekonomi") && 
               !text.includes("vård") && 
               !text.includes("sjukvård")) {
      // Systemförvaltare without ekonomi/vård context is likely IT
      return "IT/Technology";
    }

    // STEP 3: Check for non-IT engineering terms (exclude from IT)
    const nonITEngineeringTerms = [
      "byggingenjör", "construction engineer",
      "projektingenjör", "project engineer",
      "byggprojektingenjör", "construction project engineer",
      "samhällsbyggnadsprojekt", "community building project",
      "byggprojekt", "construction project",
      "byggnad", "building", "bygg", "construction",
      "väg", "road", "vägbyggnad", "road construction",
      "bro", "bridge", "brobyggnad", "bridge construction",
      "anläggning", "facility", "anläggningsingenjör", "facility engineer",
      "miljöingenjör", "environmental engineer",
      "processingenjör", "process engineer",
      "produktionsingenjör", "production engineer",
      "verkstadsingenjör", "workshop engineer",
      "maskiningenjör", "mechanical engineer",
      "elinstallatör", "electrical installer",
      "elektriker", "electrician",
      "vvs-ingenjör", "plumbing engineer",
      "rörmokare", "plumber",
      "fordon", "vehicle", "fordonsbranschen", "automotive industry",
      "bil", "car", "bilmekaniker", "car mechanic",
      "chaufför", "driver", "körning", "driving",
      "kundservice", "customer service", "kundservicemedarbetare", "customer service worker",
      "kommunikatör", "communicator", "kommunikation", "communication",
      "regeringskansliet", "government office",
      "äldreomsorg", "elderly care", "avdelningschef", "department manager",
      // Financial/administrative systems (not IT)
      "ekonomisystem", "financial system",
      "redovisningssystem", "accounting system",
      "vårdsystem", "care system",
      "sjukvårdssystem", "healthcare system",
    ];
    
    // If it contains non-IT engineering terms, skip IT check
    const hasNonITTerms = nonITEngineeringTerms.some((term) => text.includes(term));
    
    if (!hasNonITTerms) {
      // STEP 4: Check for other IT/Technology keywords (medium confidence)
      // Exclude non-IT contexts for "backend" and "data"
      const hasBackendInNonITContext = 
        text.includes("backend") && 
        (text.includes("production") || text.includes("produktion") || 
         text.includes("warehouse") || text.includes("lager") ||
         text.includes("logistics") || text.includes("logistik"));
      
      const hasDataInNonITContext = 
        text.includes("data") && 
        (text.includes("entry") || text.includes("inmatning") ||
         text.includes("collection") || text.includes("insamling") ||
         text.includes("input") || text.includes("inmatning"));
      
      if (!hasBackendInNonITContext && !hasDataInNonITContext) {
        const techKeywords = [
          "developer", "utvecklare",
          "programmer", "programmerare",
          "software", "mjukvaru",
          "backendutvecklare", "backend developer",
          "frontend", "frontendutvecklare", "frontend developer",
          "data science", "datavetenskap",
          "ai", "ml", "machine learning", "artificial intelligence",
          "maskininlärning", "artificiell intelligens",
          "deep learning", "djupinlärning",
          "neural network", "neurala nätverk",
          "nlp", "natural language processing",
          "computer vision", "datorseende",
          "generative ai", "generativ ai",
          "gpt", "llm", "large language model",
          "prompt engineer", "promptingenjör",
          "cloud", "cloud engineer", "cloud architect",
          "cyber", "cybersecurity", "cybersäkerhet",
          "säkerhetsspecialist", "security specialist",
          "nätverksspecialist", "network specialist",
          "infrastruktur", "infrastructure",
          // Programming languages/frameworks (context-specific)
          "python", "java", "javascript", "typescript",
          "react", "angular", "vue", "node.js",
          "sql", "nosql", "mongodb", "postgresql",
          "docker", "kubernetes", "terraform",
          "agile", "scrum", "kanban",
        ];
        
        // Check for "backend" in IT context (with IT terms)
        const hasBackendInITContext = 
          text.includes("backend") &&
          (text.includes("developer") || text.includes("utvecklare") ||
           text.includes("engineer") || text.includes("ingenjör") ||
           text.includes("software") || text.includes("mjukvaru") ||
           text.includes("api") || text.includes("server") ||
           text.includes("database") || text.includes("databas"));
        
        // Check if network is in IT context (with IT terms, not transportation)
        const hasNetworkInITContext = 
          (text.includes("nätverk") || text.includes("network")) &&
          (text.includes("windows") || text.includes("linux") || text.includes("backend") || 
           text.includes("it") || text.includes("system") || text.includes("server")) &&
          !text.includes("transport") && !text.includes("logistik") && !text.includes("chaufför");
        
        // Check for network in IT context (not transportation)
        const hasNetworkNotTransport = 
          (text.includes("nätverk") || text.includes("network")) &&
          !text.includes("transport") && 
          !text.includes("logistik") && 
          !text.includes("chaufför") &&
          !text.includes("driver");
        
        if (hasBackendInITContext || hasNetworkInITContext || hasNetworkNotTransport || 
            techKeywords.some((keyword) => text.includes(keyword))) {
          return "IT/Technology";
        }
      }
    }

    // Kitchen/Gastronomy
    const kitchenKeywords = [
      "kock",
      "chef",
      "cook",
      "kitchen",
      "köket",
      "restaurang",
      "restaurant",
      "matlagning",
      "cooking",
      "bakery",
      "bageri",
      "pastry",
      "bagare",
      "konditor",
    ];
    if (kitchenKeywords.some((keyword) => text.includes(keyword))) {
      return "Kitchen/Gastronomy";
    }

    // Service/Hospitality
    const serviceKeywords = [
      "servitör",
      "servitris",
      "waiter",
      "waitress",
      "receptionist",
      "reception",
      "kundservice",
      "customer service",
      "kundrådgivare",
      "customer advisor",
      "butik",
      "shop",
      "säljare",
      "salesperson",
      "försäljning",
      "sales",
      "värdinna",
      "hostess",
      "restaurangvärd",
      "restaurant host",
    ];
    if (serviceKeywords.some((keyword) => text.includes(keyword))) {
      return "Service/Hospitality";
    }

    // Healthcare
    const healthKeywords = [
      "sjuksköterska",
      "nurse",
      "läkare",
      "doctor",
      "physician",
      "specialistläkare",
      "specialist doctor",
      "barnsjuksköterska",
      "pediatric nurse",
      "undersköterska",
      "assistant nurse",
      "barnmorska",
      "midwife",
      "fysioterapeut",
      "physiotherapist",
      "sjukgymnast",
      "tandläkare",
      "dentist",
      "veterinär",
      "veterinarian",
      "vård",
      "care",
      "sjukvård",
      "healthcare",
      "medicin",
      "medicine",
      "vårdcentral",
      "health center",
      "sjukhus",
      "hospital",
      "klinik",
      "clinic",
      // Personal assistant in healthcare context
      (text.includes("personlig assistent") && (text.includes("vård") || text.includes("omsorg") || text.includes("sjuk") || text.includes("handikapp") || text.includes("funktionsnedsättning"))),
    ];
    if (healthKeywords.some((keyword) => {
      if (typeof keyword === "boolean") return keyword;
      return text.includes(keyword);
    })) {
      return "Healthcare";
    }

    // Education
    const educationKeywords = [
      "lärare",
      "teacher",
      "professor",
      "utbildare",
      "educator",
      "pedagog",
      "förskollärare",
      "preschool teacher",
      "speciallärare",
      "special teacher",
      "studiehandledare",
      "study supervisor",
      "utbildningssamordnare",
      "education coordinator",
    ];
    if (educationKeywords.some((keyword) => text.includes(keyword))) {
      return "Education";
    }

    // Sales
    const salesKeywords = [
      "säljchef",
      "sales manager",
      "säljchef",
      "försäljning",
      "sales",
      "affärsutvecklare",
      "business developer",
      "säljande",
      "selling",
    ];
    if (salesKeywords.some((keyword) => text.includes(keyword))) {
      return "Sales";
    }

    // Administrative
    // Exclude personal assistant (should be Healthcare/Other)
    if (text.includes("personlig assistent") && 
        !text.includes("vård") && 
        !text.includes("omsorg") && 
        !text.includes("sjuk") && 
        !text.includes("handikapp") && 
        !text.includes("funktionsnedsättning")) {
      // Will be categorized as Other below
    } else {
      // Check for financial/administrative systems first
      const hasFinancialSystem = 
        (text.includes("systemförvaltare") && text.includes("ekonomi")) ||
        (text.includes("ekonomisystem") && text.includes("förvaltare"));
      
      const adminKeywords = [
        "administratör",
        "administrator",
        "ekonomiassistent",
        "accounting assistant",
        "ekonomi",
        "accounting",
        "redovisning",
        "bookkeeping",
        "sekretär",
        "secretary",
        "assistent",
        "assistant",
        "kontor",
        "office",
        "handläggare",
        "case worker",
        // Financial/administrative systems
        "ekonomisystem",
        "financial system",
        "redovisningssystem",
        "accounting system",
        "systemförvaltare",
        "system administrator",
        "ekonomiförvaltare",
        "financial administrator",
        "ekonomi controller",
        "financial controller",
        "ekonom",
        "economist",
        "ekonomiplanerare",
        "financial planner",
        "ekonomistyrning",
        "financial management",
      ];
      
      // Check for "controller" in financial context (not IT/game controller)
      const hasControllerInFinancialContext = 
        text.includes("controller") &&
        (text.includes("ekonomi") || text.includes("financial") || 
         text.includes("redovisning") || text.includes("accounting") ||
         text.includes("ekonom") || text.includes("economist"));
      
      if (hasFinancialSystem || hasControllerInFinancialContext || 
          adminKeywords.some((keyword) => text.includes(keyword))) {
        return "Administrative";
      }
    }

    // Construction/Maintenance
    const constructionKeywords = [
      "bygg",
      "construction",
      "snickare",
      "carpenter",
      "elektriker",
      "electrician",
      "murare",
      "mason",
      "rörmokare",
      "plumber",
      "vvs-montör",
      "vvs assembler",
      "vvs-installatör",
      "vvs installer",
      "vvs-tekniker",
      "vvs technician",
      "vvs",
      "plumbing",
      "måleri",
      "painting",
      "underhåll",
      "maintenance",
      "underhållstekniker",
      "maintenance technician",
      "fastighet",
      "property",
      "fastighetstekniker",
      "property technician",
      "fastighetsskötare",
      "property caretaker",
      "byggarbetare",
      "construction worker",
      "byggprojekt",
      "construction project",
      "anläggning",
      "facility",
      "anläggningsingenjör",
      "facility engineer",
    ];
    if (constructionKeywords.some((keyword) => text.includes(keyword))) {
      return "Construction/Maintenance";
    }

    // Transportation/Logistics
    const transportKeywords = [
      "chaufför",
      "driver",
      "truckförare",
      "forklift driver",
      "förare",
      "logistik",
      "logistics",
      "lager",
      "warehouse",
      "lagerarbetare",
      "warehouse worker",
      "transport",
      "körare",
      "driver",
    ];
    if (transportKeywords.some((keyword) => text.includes(keyword))) {
      return "Transportation/Logistics";
    }

    // Production/Manufacturing
    // Exclude VVS (plumbing) - should be Construction/Maintenance
    if (text.includes("vvs")) {
      // Already handled in Construction/Maintenance
    } else {
      const productionKeywords = [
        "produktion",
        "production",
        "montör",
        "assembler",
        "montörer",
        "assemblers",
        "produktionstekniker",
        "production technician",
        "produktionsingenjör",
        "production engineer",
        "verkstad",
        "workshop",
        "verkstadstekniker",
        "workshop technician",
        "svetsare",
        "welder",
        "operatör",
        "operator",
        "cnc",
        "processoperatör",
        "process operator",
        "mättekniker",
        "measurement technician",
        "verkstadsansvarig",
        "workshop manager",
        "industriarbetare",
        "industrial worker",
        "fabriksarbetare",
        "factory worker",
        "produktionsmedarbetare",
        "production worker",
        "produktionspersonal",
        "production staff",
      ];
      if (productionKeywords.some((keyword) => text.includes(keyword))) {
        return "Production/Manufacturing";
      }
    }

    // Other
    return "Other";
  };

  // Detect experience level from job title/description
  const detectExperienceLevel = (job: ScrapedJob): string => {
    const title = job.title.toLowerCase();
    const description = (job.description || "").toLowerCase();
    const text = `${title} ${description}`;

    // Intern/Estágio
    if (
      text.includes("intern") ||
      text.includes("praktikant") ||
      text.includes("praktik") ||
      text.includes("estágio") ||
      text.includes("trainee") ||
      text.includes("student")
    ) {
      return "intern";
    }

    // Junior/Entry Level
    if (
      text.includes("junior") ||
      text.includes("entry") ||
      text.includes("nybörjare") ||
      text.includes("nyexaminerad") ||
      text.includes("graduate") ||
      text.includes("assistant")
    ) {
      return "junior";
    }

    // Senior
    if (
      text.includes("senior") ||
      text.includes("erfaren") ||
      text.includes("experienced") ||
      text.includes("expert") ||
      text.includes("specialist")
    ) {
      return "senior";
    }

    // Lead/Manager
    if (
      text.includes("lead") ||
      text.includes("ledare") ||
      text.includes("manager") ||
      text.includes("chef") ||
      text.includes("director") ||
      text.includes("head") ||
      text.includes("ansvarig") ||
      text.includes("responsible")
    ) {
      return "lead";
    }

    // Mid/Pleno (if not junior or senior, assume mid-level)
    if (
      text.includes("mid") ||
      text.includes("medel") ||
      text.includes("pleno")
    ) {
      return "mid";
    }

    // Default to "not specified" if no level detected
    return "not_specified";
  };

  // Check if job is AI/ML related (more precise detection)
  const isAIJob = (job: ScrapedJob): boolean => {
    const title = job.title.toLowerCase();
    const description = (job.description || "").toLowerCase();
    const text = `${title} ${description}`;

    // Non-AI/ML terms that should exclude the job
    const nonAITerms = [
      "bagare",
      "baker",
      "konditor",
      "confectioner",
      "tandläkare",
      "dentist",
      "sjuksköterska",
      "nurse",
      "läkare",
      "doctor",
      "kock",
      "chef",
      "cook",
      "servitör",
      "waiter",
      "servitris",
      "waitress",
      "butik",
      "shop",
      "butiksbiträde",
      "shop assistant",
      "chaufför",
      "driver",
      "truckförare",
      "forklift driver",
      "städare",
      "cleaner",
      "vaktmästare",
      "janitor",
      "murare",
      "mason",
      "snickare",
      "carpenter",
      "elektriker",
      "electrician",
      "rörmokare",
      "plumber",
      "montör",
      "assembler",
      "svetsare",
      "welder",
      "produktion",
      "production",
      "verkstad",
      "workshop",
      "lager",
      "warehouse",
      "lagerarbetare",
      "warehouse worker",
      "bygg",
      "construction",
      "byggarbetare",
      "construction worker",
      "farmaceut",
      "pharmacist",
      "apotek",
      "pharmacy",
      "lärare",
      "teacher",
      "förskollärare",
      "preschool teacher",
      "psykolog",
      "psychologist",
      "kurator",
      "counselor",
      "socialsekreterare",
      "social secretary",
      "handläggare",
      "case worker",
      "administratör",
      "administrator",
      "sekretär",
      "secretary",
      "receptionist",
      "reception",
      "kundservice",
      "customer service",
      "säljare",
      "salesperson",
      "försäljning",
      "sales",
      "restaurang",
      "restaurant",
      "hotell",
      "hotel",
      "vård",
      "care",
      "omsorg",
      "hemtjänst",
      "home care",
      "barnvakt",
      "babysitter",
      "personlig assistent",
      "personal assistant",
      "fysioterapeut",
      "physiotherapist",
      "sjukgymnast",
      "tandhygienist",
      "dental hygienist",
      "tandsköterska",
      "dental nurse",
      "veterinär",
      "veterinarian",
      "djursjukhus",
      "animal hospital",
      "brandman",
      "firefighter",
      "polis",
      "police",
      "mekaniker",
      "mechanic",
      "bil",
      "car",
      "fordon",
      "vehicle",
      "kvalitetstekniker",
      "quality technician",
      "kvalitetschef",
      "quality manager",
      "miljöinspektör",
      "environmental inspector",
      "projektledare",
      "project manager",
      "projektingenjör",
      "project engineer",
      "planerare",
      "planner",
      "koordinator",
      "coordinator",
      "ekonom",
      "economist",
      "controller",
      "redovisning",
      "accounting",
      "jurist",
      "lawyer",
      "advokat",
      "attorney",
      "präst",
      "priest",
      "pastor",
      "kyrka",
      "church",
      "konservator",
      "conservator",
      "museum",
      "forskare",
      "researcher",
      "forskning",
      "research",
      "universitetslektor",
      "university lecturer",
      "doktorand",
      "phd student",
      "student",
      "studiehandledare",
      "study supervisor",
      "utbildningssamordnare",
      "education coordinator",
      "speciallärare",
      "special teacher",
      "specialpedagog",
      "special educator",
      "fritidshem",
      "after-school care",
      "fritidspedagog",
      "förskola",
      "preschool",
      "grundskola",
      "elementary school",
      "gymnasium",
      "high school",
      "högskola",
      "college",
      "kriminalvårdare",
      "prison guard",
      "anstalt",
      "prison",
      "gruppledare",
      "group leader",
      "behandlingspedagog",
      "boendestödjare",
      "residential support",
      "stödassistent",
      "lokalvårdare",
      "janitor",
      "städare",
      "cleaner",
      "köksbiträde",
      "kitchen assistant",
      "restaurangbiträde",
      "barista",
      "bartender",
      "bar",
      "butikssäljare",
      "shop salesperson",
      "butiksmedarbetare",
      "terminalarbetare",
      "terminal worker",
      "taxiförare",
      "taxi driver",
      "förare",
      "driver",
      "lastmaskinförare",
      "crane operator",
      "maskinoperatör",
      "machine operator",
      "cnc-operatör",
      "cnc operator",
      "operatör",
      "operator",
      "produktionsmedarbetare",
      "production worker",
      "produktionspersonal",
      "industriarbetare",
      "industrial worker",
      "fabriksarbetare",
      "underhållstekniker",
      "maintenance technician",
      "underhållsingenjör",
      "fastighetstekniker",
      "property technician",
      "fastighetsskötare",
      "byggarbetare",
      "construction worker",
      "måleri",
      "painting",
      "målare",
      "painter",
      "rörmokare",
      "plumber",
      "vvs",
      "plumbing",
      "svetsning",
      "welding",
      "montage",
      "assembly",
      "industrimålare",
      "industrial painter",
      "lackerare",
      "skräddare",
      "tailor",
      "sömmerska",
      "frisör",
      "hairdresser",
      "frisörska",
      "massör",
      "masseur",
      "massage",
      "nagelteknolog",
      "nail technician",
      "nagel",
      "nail",
      "kosmetolog",
      "cosmetologist",
      "skönhet",
      "beauty",
      "hundfrisör",
      "dog groomer",
      "hundtrim",
      "hundvakt",
      "dog sitter",
      "kattvakt",
      "cat sitter",
      "barnpassning",
      "childcare",
      "undersköterska",
      "assistant nurse",
      "vårdbiträde",
      "barnmorska",
      "midwife",
      "barnmorsk",
      "operationssjuksköterska",
      "operating room nurse",
      "or nurse",
      "distriktsläkare",
      "district doctor",
      "vårdcentral",
      "health center",
      "specialistläkare",
      "specialist doctor",
    ];

    // Check for non-AI terms first (exclude these)
    for (const term of nonAITerms) {
      if (text.includes(term)) {
        return false;
      }
    }

    // AI/ML specific keywords (must be present)
    const aiKeywords = [
      // Direct AI/ML terms
      "ai",
      "ml",
      "machine learning",
      "artificial intelligence",
      "deep learning",
      "neural network",
      "neural networks",
      "nlp",
      "natural language processing",
      "computer vision",
      "image recognition",
      "generative ai",
      "genai",
      "gpt",
      "llm",
      "large language model",
      "prompt engineer",
      "prompt engineering",
      "data scientist",
      "datascientist",
      "datavetare",
      "data engineer",
      "dataingenjör",
      "data engineering",
      "ml engineer",
      "mlingenjör",
      "machine learning engineer",
      "ai engineer",
      "aiingenjör",
      "artificial intelligence engineer",
      "ml researcher",
      "ai researcher",
      "research scientist",
      "data science",
      "datavetenskap",
      "maskininlärning",
      "artificiell intelligens",
      "djupinlärning",
      "neurala nätverk",
      "språkbehandling",
      "datorseende",
      "generativ ai",
      "stort språkmodell",
      "promptingenjör",
      "mlforskare",
      "aiforskare",
      "forskningsvetare",
      // Tech terms that indicate AI/ML
      "algorithm",
      "algoritm",
      "model",
      "modell",
      "modelling",
      "modellering",
      "prediction",
      "prediktion",
      "predictive",
      "classification",
      "klassificering",
      "regression",
      "clustering",
      "klustring",
      "recommendation system",
      "rekommendationssystem",
      "recommendation engine",
      "rekommendationsmotor",
      "chatbot",
      "chattbot",
      "virtual assistant",
      "virtuell assistent",
      "voice recognition",
      "röstigenkänning",
      "speech recognition",
      "taligenkänning",
      "image processing",
      "bildbehandling",
      "video processing",
      "videobehandling",
      "pattern recognition",
      "mönsterigenkänning",
      "data mining",
      "datautvinning",
      "big data",
      "stordata",
      "data analytics",
      "dataanalys",
      "business intelligence",
      "affärsintelligens",
      "data warehouse",
      "datavarehus",
      "data lake",
      "datalag",
      "etl",
      "data pipeline",
      "datapipeline",
      "feature engineering",
      "featureingenjör",
      "model training",
      "modellträning",
      "model deployment",
      "modellimplementering",
      "mlops",
      "machine learning operations",
      "aiops",
      "artificial intelligence operations",
      "automl",
      "automated machine learning",
      "reinforcement learning",
      "förstärkningsinlärning",
      "supervised learning",
      "övervakad inlärning",
      "unsupervised learning",
      "oövervakad inlärning",
      "semi-supervised learning",
      "semiövervakad inlärning",
      "transfer learning",
      "överföringsinlärning",
      "federated learning",
      "federerad inlärning",
      "edge ai",
      "edge ml",
      "robotics",
      "robotik",
      "autonomous systems",
      "autonoma system",
      "intelligent systems",
      "intelligenta system",
      "cognitive computing",
      "kognitiv databehandling",
      "expert systems",
      "expertsystem",
      "knowledge graph",
      "kunskapsgraf",
      "transformer",
      "bert",
      "gpt-2",
      "gpt-3",
      "gpt-4",
      "chatgpt",
      "claude",
      "llama",
      "palm",
      "word embeddings",
      "ordembeddningar",
      "word2vec",
      "glove",
      "fasttext",
      "sentiment analysis",
      "sentimentanalys",
      "text classification",
      "textklassificering",
      "text summarization",
      "textsammanfattning",
      "text generation",
      "textgenerering",
      "language modeling",
      "språkmodellering",
      "machine translation",
      "maskinöversättning",
      "text-to-speech",
      "text-till-tal",
      "facial recognition",
      "ansiktsigenkänning",
      "face detection",
      "ansiktsdetektering",
      "object detection",
      "objektdetektering",
      "image segmentation",
      "bildsegmentering",
      "computer vision",
      "datorseende",
    ];

    // Check for AI/ML keywords
    for (const keyword of aiKeywords) {
      if (text.includes(keyword)) {
        return true;
      }
    }

    return false;
  };

  // Get categorized jobs
  const getCategorizedJobs = (
    jobs: ScrapedJob[]
  ): { [category: string]: ScrapedJob[] } => {
    const categorized: { [category: string]: ScrapedJob[] } = {};

    jobs.forEach((job) => {
      const category = categorizeJob(job);
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(job);
    });

    return categorized;
  };

  // Get experience level distribution for a category
  const getExperienceDistribution = (
    jobs: ScrapedJob[]
  ): { [level: string]: number } => {
    const distribution: { [level: string]: number } = {
      intern: 0,
      junior: 0,
      mid: 0,
      senior: 0,
      lead: 0,
      not_specified: 0,
    };

    jobs.forEach((job) => {
      const level = detectExperienceLevel(job);
      distribution[level] = (distribution[level] || 0) + 1;
    });

    return distribution;
  };

  // Filter jobs by category
  const filterJobsByCategory = (jobs: ScrapedJob[]): ScrapedJob[] => {
    if (selectedCategory === "all") {
      return jobs;
    }
    return jobs.filter((job) => categorizeJob(job) === selectedCategory);
  };

  // Filter jobs by experience level
  const filterJobsByExperience = (jobs: ScrapedJob[]): ScrapedJob[] => {
    if (experienceFilter === "all") {
      return jobs;
    }
    return jobs.filter(
      (job) => detectExperienceLevel(job) === experienceFilter
    );
  };

  const filterJobsByDate = (jobs: ScrapedJob[]): ScrapedJob[] => {
    if (dateFilter === "all") {
      return jobs;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);
    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);

    return jobs.filter((job) => {
      if (!job.posted_date) return false;

      const postedDate =
        job.posted_date instanceof Date
          ? job.posted_date
          : new Date(job.posted_date);

      const jobDate = new Date(
        postedDate.getFullYear(),
        postedDate.getMonth(),
        postedDate.getDate()
      );

      switch (dateFilter) {
        case "today":
          return jobDate.getTime() === today.getTime();
        case "yesterday":
          return jobDate.getTime() === yesterday.getTime();
        case "7days":
          return jobDate >= last7Days;
        case "30days":
          return jobDate >= last30Days;
        case "custom":
          const customDate = new Date(today);
          customDate.setDate(customDate.getDate() - customDays);
          return jobDate >= customDate;
        default:
          return true;
      }
    });
  };

  // Get filtered jobs (applies all filters)
  const getFilteredJobs = (): ScrapedJob[] => {
    let filtered = jobs;
    filtered = filterJobsByCategory(filtered);
    filtered = filterJobsByExperience(filtered);
    filtered = filterJobsByDate(filtered);
    return filtered;
  };

  const getTimeAgo = (date: Date): string => {
    // Validate date
    if (!date || isNaN(date.getTime())) {
      return "Invalid date";
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    // Handle future dates (probably timezone issue or data error)
    // If date is in the future but less than 24 hours, treat as "Today"
    // If more than 24 hours in the future, also treat as "Today" (data error)
    if (diffMs < 0) {
      const futureHours = Math.abs(Math.floor(diffMs / (1000 * 60 * 60)));
      if (futureHours < 24) {
        return "Today";
      }
      // If more than 24 hours in future, it's likely a data error, show as "Today"
      return "Today";
    }

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSeconds < 60) return "Just now";
    if (diffMinutes < 60)
      return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    if (diffWeeks < 4)
      return `${diffWeeks} week${diffWeeks !== 1 ? "s" : ""} ago`;
    if (diffMonths < 12)
      return `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;
    return `${diffYears} year${diffYears !== 1 ? "s" : ""} ago`;
  };

  const handleArbetsSearch = async () => {
    setLoading(true);
    setLoadingAllJobs(true);
    setSearchErrors([]);
    setArbetsOffset(0);
    setSelectedCategory("all");
    setExperienceFilter("all");
    setDateFilter("all");

    const allJobs: ScrapedJob[] = [];
    let currentOffset = 0;
    let hasMore = true;
    let totalLoaded = 0;

    try {
      // Load all jobs automatically
      while (hasMore) {
        setLoadingProgress({ current: totalLoaded, total: null });

        const response = await fetch("/api/arbetsformedlingen", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            searchType: arbetsSearchType,
            region: arbetsCity,
            offset: currentOffset,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch jobs");
        }

        // Convert posted_date strings to Date objects
        const newJobs = data.jobs.map((job: ScrapedJob) => ({
          ...job,
          posted_date: job.posted_date
            ? job.posted_date instanceof Date
              ? job.posted_date
              : new Date(job.posted_date)
            : undefined,
        }));

        // Remove duplicates by URL
        const existingUrls = new Set(allJobs.map((j) => j.url));
        const uniqueNewJobs = newJobs.filter(
          (j: ScrapedJob) => !existingUrls.has(j.url)
        );

        allJobs.push(...uniqueNewJobs);
        totalLoaded = allJobs.length;
        currentOffset += 100;

        // Update jobs state progressively
        setJobs([...allJobs]);

        // Check if there are more jobs
        // If we got less than 100 jobs, we've reached the end
        hasMore = newJobs.length === 100 && uniqueNewJobs.length > 0;

        // Small delay to avoid overwhelming the API
        if (hasMore) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }

      setJobs(allJobs);
      setCompanies(["Arbetsförmedlingen (Multiple Companies)"]);
      setHasMoreJobs(false);
      setLoadingProgress({ current: totalLoaded, total: totalLoaded });
    } catch (error) {
      setSearchErrors([
        `Arbetsförmedlingen API: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      ]);
      setHasMoreJobs(false);
      // Keep whatever jobs we managed to load
      if (allJobs.length > 0) {
        setJobs(allJobs);
        setCompanies(["Arbetsförmedlingen (Multiple Companies)"]);
      }
    } finally {
      setLoading(false);
      setLoadingAllJobs(false);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMoreJobs) return;

    setLoadingMore(true);
    setSearchErrors([]);

    try {
      const response = await fetch("/api/arbetsformedlingen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          searchType: arbetsSearchType,
          region: arbetsCity,
          offset: arbetsOffset,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch more jobs");
      }

      // Convert posted_date strings to Date objects
      const newJobs = data.jobs.map((job: ScrapedJob) => ({
        ...job,
        posted_date: job.posted_date
          ? job.posted_date instanceof Date
            ? job.posted_date
            : new Date(job.posted_date)
          : undefined,
      }));

      // Append new jobs to existing ones
      setJobs((prevJobs) => {
        // Remove duplicates by URL
        const existingUrls = new Set(prevJobs.map((j) => j.url));
        const uniqueNewJobs = newJobs.filter(
          (j: ScrapedJob) => !existingUrls.has(j.url)
        );
        return [...prevJobs, ...uniqueNewJobs];
      });

      // Check if there are more jobs to load
      // If we got less than 100 jobs, we've reached the end
      setHasMoreJobs(newJobs.length === 100);
      setArbetsOffset((prev) => prev + 100); // Next offset for next "Load More"
    } catch (error) {
      setSearchErrors([
        `Arbetsförmedlingen API: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      ]);
      setHasMoreJobs(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleJobsFound = (
    foundJobs: ScrapedJob[],
    companyName: string,
    filterSweden: boolean = true,
    error?: string
  ) => {
    setLoading(true);
    setIsSwedenFilterActive(filterSweden);
    setHasMoreJobs(false); // Reset hasMoreJobs for non-Arbetsförmedlingen searches

    if (error) {
      setSearchErrors((prev) => [...prev, error]);
    }

    // Adicionar custo a cada job (1 request por busca)
    // Convert posted_date strings to Date objects
    const jobsWithCost = foundJobs.map((job) => ({
      ...job,
      posted_date: job.posted_date
        ? job.posted_date instanceof Date
          ? job.posted_date
          : new Date(job.posted_date)
        : undefined,
      cost: {
        requests: 1,
        source: detectJobSource(job.url),
      },
    }));

    // Filter jobs based on Sweden filter option
    const filteredJobs = filterSweden
      ? filterSwedenJobs(jobsWithCost)
      : jobsWithCost;

    // Remove duplicates by title
    const uniqueJobs = Array.from(
      new Map(filteredJobs.map((job) => [job.title, job])).values()
    );

    setJobs(uniqueJobs);
    setCompanies([companyName]);
    setLoading(false);
  };

  const handleMultipleJobsFound = (
    allJobs: ScrapedJob[],
    companyNames: string[],
    filterSweden: boolean = true,
    errors?: string[]
  ) => {
    setLoading(true);
    setIsSwedenFilterActive(filterSweden);
    setHasMoreJobs(false); // Reset hasMoreJobs for non-Arbetsförmedlingen searches

    if (errors && errors.length > 0) {
      setSearchErrors((prev) => [...prev, ...errors]);
    }

    // Adicionar custo a cada job (1 request por busca)
    // Convert posted_date strings to Date objects
    const jobsWithCost = allJobs.map((job) => ({
      ...job,
      posted_date: job.posted_date
        ? job.posted_date instanceof Date
          ? job.posted_date
          : new Date(job.posted_date)
        : undefined,
      cost: {
        requests: 1,
        source: detectJobSource(job.url),
      },
    }));

    // Filter jobs based on Sweden filter option
    const filteredJobs = filterSweden
      ? filterSwedenJobs(jobsWithCost)
      : jobsWithCost;

    // Remove duplicates by title (across all companies)
    const uniqueJobs = Array.from(
      new Map(
        filteredJobs.map((job) => [job.title + job.company, job])
      ).values()
    );

    setJobs(uniqueJobs);
    setCompanies(companyNames);
    setLoading(false);
  };

  // Load profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const data = await response.json();
          if (data.profile) {
            setProfile(data.profile);
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };
    loadProfile();
  }, []);

  const handleSaveProfile = async (profileData: any) => {
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setShowProfileModal(false);
        alert("✅ Profile saved successfully!");
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.error || "Failed to save profile"}`);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("❌ Failed to save profile");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🤖</span>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  AI Job Tracker
                </h1>
                <p className="mt-1 text-gray-600">
                  Find AI/ML engineering jobs in Sweden 🇸🇪
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowProfileModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create Profile
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search Form - Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🔍</span>
                <h2 className="text-xl font-bold text-gray-900">Search Jobs</h2>
              </div>

              <JobSearchForm
                onJobsFound={handleJobsFound}
                onMultipleJobsFound={handleMultipleJobsFound}
              />

              {/* Arbetsförmedlingen Quick Search */}
              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border-2 border-yellow-300">
                <h3 className="text-sm font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                  🇸🇪 Swedish Jobs (Official)
                </h3>
                <p className="text-xs text-yellow-800 mb-3">
                  Search jobs from <strong>Arbetsförmedlingen</strong> (Swedish
                  Employment Service)
                </p>

                {/* Search Type Filter */}
                <div className="mb-3">
                  <label
                    htmlFor="arbetsSearchType"
                    className="block text-xs font-medium text-yellow-900 mb-1"
                  >
                    Search Type:
                  </label>
                  <select
                    id="arbetsSearchType"
                    value={arbetsSearchType}
                    onChange={(e) =>
                      setArbetsSearchType(
                        e.target.value as "general" | "market"
                      )
                    }
                    disabled={loading}
                    className="w-full px-3 py-2 text-sm border border-yellow-300 rounded-md bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 disabled:bg-gray-100"
                  >
                    <option value="general">General Jobs (All)</option>
                    <option value="market">AI/ML Market Specific</option>
                  </select>
                </div>

                {/* City Filter */}
                <div className="mb-3">
                  <label
                    htmlFor="arbetsCity"
                    className="block text-xs font-medium text-yellow-900 mb-1"
                  >
                    City/Region:
                  </label>
                  <select
                    id="arbetsCity"
                    value={arbetsCity}
                    onChange={(e) => setArbetsCity(e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 text-sm border border-yellow-300 rounded-md bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 disabled:bg-gray-100"
                  >
                    <option value="01">Stockholm</option>
                    <option value="12">Gothenburg (Göteborg)</option>
                    <option value="13">Malmö</option>
                    <option value="14">Uppsala</option>
                    <option value="18">Örebro</option>
                    <option value="">All Sweden</option>
                  </select>
                </div>

                <button
                  onClick={handleArbetsSearch}
                  disabled={loading}
                  className="w-full px-4 py-2.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all font-medium text-sm shadow-sm disabled:bg-gray-400"
                >
                  {loading ? "🔄 Searching..." : "🇸🇪 Search Jobs"}
                </button>
                <p className="text-xs text-yellow-700 mt-2">
                  Source: Official government API (free)
                </p>
              </div>

              {/* Supported Platforms */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <span>💡</span> Supported Platforms
                </h3>
                <ul className="text-xs text-blue-800 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span> Lever
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span> Greenhouse
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span> Workable
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span> Ashby
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span> Custom pages
                  </li>
                </ul>
              </div>

              {/* Example URLs */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  ✅ Verified URLs:
                </p>
                <div className="space-y-1 text-xs">
                  <p className="text-blue-600 truncate">
                    jobs.lever.co/spotify
                  </p>
                  <p className="text-blue-600 truncate">jobs.lever.co/klarna</p>
                  <p className="text-blue-600 truncate">
                    jobs.ashbyhq.com/king
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Results - Main Area */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="animate-spin text-6xl mb-4">⏳</div>
                <p className="text-gray-600 mb-2">Loading jobs...</p>
                {loadingAllJobs && loadingProgress.current > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">
                      {loadingProgress.current} jobs loaded
                      {loadingProgress.total && ` of ${loadingProgress.total}`}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{
                          width: loadingProgress.total
                            ? `${
                                (loadingProgress.current /
                                  loadingProgress.total) *
                                100
                              }%`
                            : "50%",
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-200">
                <div className="text-7xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No Jobs Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Search for AI/ML jobs from Swedish companies
                </p>
                <div className="inline-block text-left">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Example URLs:
                  </p>
                  <div className="space-y-1 text-sm bg-gray-50 p-4 rounded-lg">
                    <p className="text-blue-600">
                      https://jobs.lever.co/spotify
                    </p>
                    <p className="text-blue-600">
                      https://jobs.lever.co/klarna
                    </p>
                    <p className="text-blue-600">
                      https://jobs.ashbyhq.com/king
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Search Errors */}
                {searchErrors.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-yellow-900 mb-2">
                      ⚠️ Some searches failed:
                    </h3>
                    <ul className="text-xs text-yellow-800 space-y-1">
                      {searchErrors.map((err, i) => (
                        <li key={i}>• {err}</li>
                      ))}
                    </ul>
                    <button
                      onClick={() => setSearchErrors([])}
                      className="mt-2 text-xs text-yellow-700 hover:text-yellow-900 underline"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Category Cards - Show when jobs are loaded */}
                {jobs.length > 0 &&
                  companies.includes(
                    "Arbetsförmedlingen (Multiple Companies)"
                  ) && (
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span>📂</span>
                        <span>Job Categories</span>
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {/* All Categories Card */}
                        <button
                          onClick={() => setSelectedCategory("all")}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            selectedCategory === "all"
                              ? "border-blue-600 bg-blue-50 shadow-md"
                              : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
                          }`}
                        >
                          <div className="text-2xl mb-2">📋</div>
                          <div className="font-bold text-gray-900">All</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {jobs.length} jobs
                          </div>
                        </button>

                        {/* Category Cards */}
                        {Object.entries(getCategorizedJobs(jobs))
                          .sort(([, a], [, b]) => b.length - a.length)
                          .map(([category, categoryJobs]) => {
                            const distribution =
                              getExperienceDistribution(categoryJobs);
                            return (
                              <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`p-4 rounded-lg border-2 transition-all text-left ${
                                  selectedCategory === category
                                    ? "border-blue-600 bg-blue-50 shadow-md"
                                    : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
                                }`}
                              >
                                <div className="text-2xl mb-2">
                                  {category === "IT/Technology" && "💻"}
                                  {category === "Kitchen/Gastronomy" && "👨‍🍳"}
                                  {category === "Service/Hospitality" && "🤝"}
                                  {category === "Healthcare" && "🏥"}
                                  {category === "Education" && "📚"}
                                  {category === "Sales" && "💰"}
                                  {category === "Administrative" && "📊"}
                                  {category === "Construction/Maintenance" &&
                                    "🔧"}
                                  {category === "Transportation/Logistics" &&
                                    "🚚"}
                                  {category === "Production/Manufacturing" &&
                                    "🏭"}
                                  {category === "Other" && "📦"}
                                </div>
                                <div className="font-bold text-gray-900 text-sm">
                                  {category}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  {categoryJobs.length} jobs
                                </div>
                                {selectedCategory === category && (
                                  <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                                    <div>Junior: {distribution.junior}</div>
                                    <div>Mid: {distribution.mid}</div>
                                    <div>Senior: {distribution.senior}</div>
                                    <div>Lead: {distribution.lead}</div>
                                  </div>
                                )}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
                  <div className="flex items-center gap-4 flex-wrap">
                    {/* Experience Filter */}
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <span>🎯</span>
                      <span>Experience level:</span>
                    </label>
                    <select
                      value={experienceFilter}
                      onChange={(e) => setExperienceFilter(e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All levels</option>
                      <option value="intern">Intern/Trainee</option>
                      <option value="junior">Junior</option>
                      <option value="mid">Mid-level</option>
                      <option value="senior">Senior</option>
                      <option value="lead">Lead/Manager</option>
                      <option value="not_specified">Not specified</option>
                    </select>

                    {/* Date Filter */}
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <span>📅</span>
                      <span>Date:</span>
                    </label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All jobs</option>
                      <option value="today">Today</option>
                      <option value="yesterday">Yesterday</option>
                      <option value="7days">Last 7 days</option>
                      <option value="30days">Last 30 days</option>
                      <option value="custom">Custom (X days)</option>
                    </select>
                    {dateFilter === "custom" && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={customDays}
                          onChange={(e) =>
                            setCustomDays(parseInt(e.target.value) || 7)
                          }
                          className="w-20 px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Days"
                        />
                        <span className="text-sm text-gray-600">days ago</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Results Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">
                        {selectedCategory !== "all"
                          ? selectedCategory
                          : companies.length === 1
                          ? companies[0]
                          : `${companies.length} Companies`}
                      </h2>
                      <p className="text-blue-100">
                        <span className="font-bold text-2xl">
                          {getFilteredJobs().length}
                        </span>{" "}
                        job{getFilteredJobs().length !== 1 ? "s" : ""}{" "}
                        {isSwedenFilterActive ? "in Sweden 🇸🇪" : "found"}
                        {(selectedCategory !== "all" ||
                          experienceFilter !== "all" ||
                          dateFilter !== "all") && (
                          <span className="text-blue-200 text-sm ml-2">
                            (of {jobs.length} total)
                          </span>
                        )}
                      </p>
                      {selectedCategory !== "all" && (
                        <p className="text-blue-200 text-sm mt-2">
                          Category: {selectedCategory}
                        </p>
                      )}
                      {experienceFilter !== "all" && (
                        <p className="text-blue-200 text-sm mt-1">
                          Level:{" "}
                          {experienceFilter === "intern"
                            ? "Intern"
                            : experienceFilter === "junior"
                            ? "Junior"
                            : experienceFilter === "mid"
                            ? "Mid-level"
                            : experienceFilter === "senior"
                            ? "Senior"
                            : experienceFilter === "lead"
                            ? "Lead/Manager"
                            : "Not specified"}
                        </p>
                      )}
                      {companies.length > 1 && selectedCategory === "all" && (
                        <p className="text-blue-200 text-sm mt-2">
                          {companies.join(", ")}
                        </p>
                      )}
                    </div>
                    <div className="text-6xl">🎯</div>
                  </div>
                </div>

                {/* Job Cards */}
                {getFilteredJobs().map((job, index) => (
                  <div
                    key={`${job.url}-${index}`}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 border border-gray-200 overflow-hidden"
                  >
                    <div className="p-6">
                      {/* Title & Badge */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <h3 className="text-xl font-bold text-gray-900 flex-1 leading-tight">
                          {job.title}
                        </h3>
                        {isAIJob(job) && (
                          <span className="flex-shrink-0 px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-xs font-bold">
                            AI/ML
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                        <span className="flex items-center gap-1">
                          <span className="text-lg">📍</span>
                          <span className="font-medium">{job.location}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-lg">🏢</span>
                          <span className="font-medium">{job.company}</span>
                        </span>
                        {job.posted_date && (
                          <span className="flex items-center gap-1">
                            <span className="text-lg">📅</span>
                            <span className="font-medium text-gray-500">
                              {getTimeAgo(
                                job.posted_date instanceof Date
                                  ? job.posted_date
                                  : new Date(job.posted_date)
                              )}
                            </span>
                          </span>
                        )}
                      </div>

                      {/* Cost Info */}
                      {job.cost && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 pt-3 border-t border-gray-100">
                          <span className="font-medium">Search Cost:</span>
                          <span className="px-2 py-1 bg-green-50 text-green-700 rounded">
                            💰 {job.cost.requests} request
                            {job.cost.requests > 1 ? "s" : ""} •{" "}
                            {job.cost.source}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-green-600 font-medium">
                            FREE
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all text-center font-medium text-sm shadow-sm"
                        >
                          🔗 View Job
                        </a>
                        <button
                          onClick={async (e) => {
                            const button = e.currentTarget;
                            try {
                              // Show loading state
                              button.disabled = true;
                              button.textContent = "⏳ Analyzing...";

                              // Extract basic requirements from job title and description
                              const extractRequirements = (title: string, description?: string): string[] => {
                                const requirements: string[] = [];
                                const text = `${title} ${description || ''}`.toLowerCase();
                                
                                // Common tech skills
                                const techSkills = [
                                  'python', 'typescript', 'javascript', 'java', 'c++', 'c#', 'go', 'rust',
                                  'machine learning', 'ai', 'ml', 'deep learning', 'llm', 'nlp',
                                  'react', 'node.js', 'docker', 'kubernetes', 'aws', 'gcp', 'azure',
                                  'sql', 'nosql', 'mongodb', 'postgresql', 'redis',
                                  'data science', 'data engineering', 'analytics'
                                ];
                                
                                // Check for tech skills in title/description
                                techSkills.forEach(skill => {
                                  if (text.includes(skill)) {
                                    requirements.push(skill.charAt(0).toUpperCase() + skill.slice(1));
                                  }
                                });
                                
                                // Check for experience level
                                if (text.match(/\d+\+?\s*(years?|yrs?)/i)) {
                                  const expMatch = text.match(/(\d+\+?\s*(?:years?|yrs?))/i);
                                  if (expMatch) {
                                    requirements.push(`${expMatch[1]} experience`);
                                  }
                                } else if (text.includes('senior') || text.includes('lead')) {
                                  requirements.push('5+ years experience');
                                } else if (text.includes('junior') || text.includes('entry')) {
                                  requirements.push('0-2 years experience');
                                }
                                
                                // If no requirements found, use a default based on title
                                if (requirements.length === 0) {
                                  if (text.includes('engineer') || text.includes('developer')) {
                                    requirements.push('Software engineering experience');
                                  } else if (text.includes('scientist') || text.includes('researcher')) {
                                    requirements.push('Research or data science experience');
                                  } else if (text.includes('analyst') || text.includes('analytics')) {
                                    requirements.push('Analytics experience');
                                  } else {
                                    requirements.push('Relevant experience in field');
                                  }
                                }
                                
                                return requirements.slice(0, 5); // Limit to 5 requirements
                              };

                              const requirements = extractRequirements(job.title, job.description);

                              // Call analyze API
                              const response = await fetch("/api/analyze", {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                  job: {
                                    title: job.title,
                                    company: job.company,
                                    location: job.location,
                                    remote_type: "hybrid", // Default, can be improved
                                    description:
                                      job.description ||
                                      `${job.title} at ${job.company}`,
                                    requirements: requirements,
                                    url: job.url,
                                  },
                                  save: false,
                                }),
                              });

                              const data = await response.json();

                              if (!response.ok) {
                                throw new Error(
                                  data.error || "Failed to analyze job"
                                );
                              }

                              // Get the first match (since we're analyzing a single job)
                              const matchScore = data.matches && data.matches.length > 0 
                                ? data.matches[0] 
                                : null;

                              // Update total usage and job-specific usage
                              if (data.apiUsage) {
                                // Store usage for this specific job
                                setJobUsage((prev) => {
                                  const newMap = new Map(prev);
                                  newMap.set(job.url, data.apiUsage);
                                  return newMap;
                                });

                                // Update total usage
                                if (totalUsage) {
                                  setTotalUsage({
                                    input_tokens:
                                      totalUsage.input_tokens +
                                      data.apiUsage.input_tokens,
                                    output_tokens:
                                      totalUsage.output_tokens +
                                      data.apiUsage.output_tokens,
                                    total_tokens:
                                      totalUsage.total_tokens +
                                      data.apiUsage.total_tokens,
                                    cost_usd:
                                      totalUsage.cost_usd +
                                      data.apiUsage.cost_usd,
                                  });
                                } else {
                                  setTotalUsage(data.apiUsage);
                                }
                              }

                              // Show results
                              const mockNote = data.usingMock ? "\n\n⚠️ Using MOCK analysis (API key not configured)" : "";
                              alert(
                                `✅ Analysis Complete!${mockNote}\n\n` +
                                  `Match Score: ${
                                    matchScore?.overall_score || "N/A"
                                  }%\n` +
                                  `Recommendation: ${
                                    matchScore?.recommendation || "N/A"
                                  }\n` +
                                  (matchScore?.details ? `\nDetails: ${matchScore.details.substring(0, 200)}${matchScore.details.length > 200 ? '...' : ''}\n` : '') +
                                  `\n💰 API Usage:\n` +
                                  `   Input Tokens: ${
                                    data.apiUsage?.input_tokens?.toLocaleString(
                                      "en-US"
                                    ) || 0
                                  }\n` +
                                  `   Output Tokens: ${
                                    data.apiUsage?.output_tokens?.toLocaleString(
                                      "en-US"
                                    ) || 0
                                  }\n` +
                                  `   Total Tokens: ${
                                    data.apiUsage?.total_tokens?.toLocaleString(
                                      "en-US"
                                    ) || 0
                                  }\n` +
                                  `   Cost: $${
                                    data.apiUsage?.cost_usd?.toFixed(4) ||
                                    "0.0000"
                                  } USD`
                              );
                            } catch (error) {
                              console.error("Error analyzing job:", error);
                              alert(
                                `❌ Error: ${
                                  error instanceof Error
                                    ? error.message
                                    : "Failed to analyze job"
                                }`
                              );
                            } finally {
                              // Reset button
                              button.disabled = false;
                              button.textContent = "🤖 Analyze Match";
                            }
                          }}
                          className="flex-1 px-4 py-2.5 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all text-center font-medium text-sm"
                        >
                          🤖 Analyze Match
                        </button>
                      </div>

                      {/* Source and API Usage Info for this job */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        {/* Source */}
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">Source:</p>
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                          >
                            {(() => {
                              try {
                                const urlObj = new URL(job.url);
                                return urlObj.hostname.replace("www.", "");
                              } catch {
                                return job.url;
                              }
                            })()}
                          </a>
                        </div>

                        {/* API Usage Info */}
                        {jobUsage.has(job.url) &&
                          (() => {
                            const usage = jobUsage.get(job.url)!;
                            const urlObj = new URL(job.url);
                            const siteName = urlObj.hostname.replace(
                              "www.",
                              ""
                            );
                            return (
                              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                                <p className="text-sm text-gray-700">
                                  <span className="font-semibold">
                                    💰 Analysis Cost:
                                  </span>{" "}
                                  This job from{" "}
                                  <span className="font-medium text-blue-600">
                                    {siteName}
                                  </span>{" "}
                                  cost{" "}
                                  <span className="font-bold text-green-600">
                                    ${usage.cost_usd.toFixed(4)} USD
                                  </span>
                                </p>
                                <div className="mt-2 flex gap-4 text-xs text-gray-600">
                                  <span>
                                    📊{" "}
                                    {usage.input_tokens.toLocaleString("en-US")}{" "}
                                    input tokens
                                  </span>
                                  <span>
                                    📤{" "}
                                    {usage.output_tokens.toLocaleString(
                                      "en-US"
                                    )}{" "}
                                    output tokens
                                  </span>
                                  <span>
                                    🔢{" "}
                                    {usage.total_tokens.toLocaleString("en-US")}{" "}
                                    total tokens
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                      </div>
                    </div>
                  </div>
                ))}

                {/* No jobs after filters message */}
                {getFilteredJobs().length === 0 && jobs.length > 0 && (
                  <div className="mt-6 text-center bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <p className="text-sm text-yellow-800">
                      ⚠️ No jobs found for the selected filters.
                    </p>
                    <p className="text-xs text-yellow-700 mt-2">
                      Total jobs available: {jobs.length}
                    </p>
                    <div className="mt-4 flex gap-2 justify-center">
                      <button
                        onClick={() => {
                          setSelectedCategory("all");
                          setExperienceFilter("all");
                          setDateFilter("all");
                        }}
                        className="px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* API Usage Footer */}
      {totalUsage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-md p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span>💰</span> API Usage & Cost
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Input Tokens</p>
                    <p className="text-xl font-bold text-gray-900">
                      {totalUsage.input_tokens.toLocaleString("en-US")}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Output Tokens</p>
                    <p className="text-xl font-bold text-gray-900">
                      {totalUsage.output_tokens.toLocaleString("en-US")}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Tokens</p>
                    <p className="text-xl font-bold text-blue-600">
                      {totalUsage.total_tokens.toLocaleString("en-US")}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Estimated Cost</p>
                    <p className="text-xl font-bold text-green-600">
                      ${totalUsage.cost_usd.toFixed(4)} USD
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Creation Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Create Your Profile
                </h2>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <ProfileFormComponent
                onSubmit={handleSaveProfile}
                onCancel={() => setShowProfileModal(false)}
                initialData={profile}
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 font-medium">
              🚀 Built with Next.js, TypeScript, TDD & Claude AI
            </p>
            <p className="mt-2 text-sm text-gray-500">
              ✅ 34 tests passing | 🇸🇪 Sweden-focused | 🤖 AI-powered analysis
            </p>
            {totalUsage && (
              <p className="mt-2 text-xs text-gray-400">
                💰 Total API cost: ${totalUsage.cost_usd.toFixed(4)} USD |
                Tokens: {totalUsage.total_tokens.toLocaleString("en-US")}
              </p>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
