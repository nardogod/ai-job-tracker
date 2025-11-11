/**
 * /api/arbetsformedlingen
 * Search jobs from official Swedish Employment Service
 */

import { NextRequest, NextResponse } from "next/server";
import { ArbetsformedlingenService } from "@/lib/services/arbetsformedlingen";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keywords, region, searchType, offset = 0 } = body;

    const service = new ArbetsformedlingenService();

    let jobs;

    if (searchType === "market") {
      // AI/ML Market Specific - search with AI/ML keywords
      if (keywords && Array.isArray(keywords)) {
        // Custom keywords provided
        const allJobs = [];
        for (const keyword of keywords) {
          const result = await service.searchJobs({
            q: keyword,
            region: region || "",
            limit: 20,
            offset: offset,
          });
          allJobs.push(...result.jobs);
        }
        jobs = Array.from(new Map(allJobs.map((j) => [j.id, j])).values());
      } else {
        // Default: AI/ML jobs in specified region
        const aiKeywords = [
          "AI Engineer",
          "Machine Learning",
          "Data Scientist",
          "ML Engineer",
          "LLM",
          "Artificial Intelligence",
        ];
        const allJobs = [];
        for (const keyword of aiKeywords) {
          const result = await service.searchJobs({
            q: keyword,
            region: region || "",
            limit: 20,
            offset: offset,
          });
          allJobs.push(...result.jobs);
        }
        jobs = Array.from(new Map(allJobs.map((j) => [j.id, j])).values());
      }
    } else {
      // General Jobs - search all jobs in region
      const result = await service.searchJobs({
        q: "", // Empty query = all jobs
        region: region || "",
        limit: 100,
        offset: offset,
      });
      jobs = result.jobs;
    }

    // Filter by region if specified (check workplace_address)
    let filteredJobs = jobs;
    if (region && region !== "") {
      // Map region codes to region names for filtering
      const regionMap: { [key: string]: string[] } = {
        "01": ["Stockholm", "Stockholms län"],
        "12": ["Göteborg", "Västra Götalands län", "Gothenburg"],
        "13": ["Malmö", "Skåne län", "Skåne"],
        "14": ["Uppsala", "Uppsalas län"],
        "18": ["Örebro", "Örebro län"],
      };

      const regionNames = regionMap[region];
      if (regionNames) {
        filteredJobs = jobs.filter((job) => {
          const jobRegion = (job.workplace_address?.region || "").toLowerCase();
          const jobMunicipality = (
            job.workplace_address?.municipality || ""
          ).toLowerCase();

          // Check if job matches any of the region names
          return regionNames.some((name) => {
            const lowerName = name.toLowerCase();
            return (
              jobRegion.includes(lowerName) ||
              jobMunicipality.includes(lowerName) ||
              jobRegion.includes(region.toLowerCase())
            );
          });
        });
      }
    }

    // Convert to ScrapedJob format
    let scrapedJobs = filteredJobs.map((job) =>
      service.convertToScrapedJob(job)
    );

    // Filter AI/ML jobs if searchType is "market"
    if (searchType === "market") {
      scrapedJobs = scrapedJobs.filter((job) => {
        const title = job.title.toLowerCase();
        const description = job.description?.toLowerCase() || "";
        const text = `${title} ${description}`;

        // AI/ML keywords (must be tech-related and specific)
        const aiKeywords = [
          // AI/ML specific
          "ai",
          "ml",
          "machine learning",
          "artificial intelligence",
          "data scientist",
          "data engineer",
          "ml engineer",
          "ai engineer",
          "deep learning",
          "neural network",
          "nlp",
          "natural language processing",
          "computer vision",
          "generative ai",
          "llm",
          "large language model",
          "prompt engineer",
          "datavetare", // data scientist
          "dataingenjör", // data engineer
          // Software development (specific)
          "systemutvecklare", // system developer
          "mjukvaruutvecklare", // software developer
          "fullstackutvecklare", // fullstack developer
          "fullstack utvecklare", // fullstack developer
          "backendutvecklare", // backend developer
          "backend utvecklare", // backend developer
          "frontendutvecklare", // frontend developer
          "frontend utvecklare", // frontend developer
          "webbutvecklare", // web developer
          "webb utvecklare", // web developer
          "applikationsutvecklare", // application developer
          "applikations utvecklare", // application developer
          "mjukvaruarkitekt", // software architect
          "systemarkitekt", // system architect
          "developer lead", // developer lead
          "fullstack", // fullstack
          "full stack", // full stack
          "backend", // backend
          "frontend", // frontend
          // Software engineering (specific)
          "systemingenjör", // system engineer
          "mjukvaruingenjör", // software engineer
          "it-ingenjör", // IT engineer
          // Network engineering (specific)
          "nätverksingenjör", // network engineer
          "network engineer", // network engineer
          // Database (specific)
          "databasingenjör", // database engineer
          "databasadministratör", // database administrator
          // Platform development (specific)
          "plattformsutvecklare", // platform developer
          // Programming (specific)
          "programmerare", // programmer
          // Test automation (specific)
          "testautomatiserare", // test automation
          "test automation", // test automation
          "embedded test engineer", // embedded test engineer
          // Technologies (specific)
          ".net",
          "c#",
          "javascript",
          "typescript",
          "python",
          "java",
          "react",
          "node",
          "node.js",
          // Cloud/DevOps (specific)
          "cloud",
          "devops",
          "cyber",
          "cybersäkerhet", // cybersecurity
          "it-säkerhet", // IT security
          // IT (specific)
          "it", // IT (but must be in tech context)
          "information technology",
          "informationsteknologi",
          // Development (specific)
          "systemutveckling", // system development
          "mjukvaruutveckling", // software development
          "webbutveckling", // web development
          "applikationsutveckling", // application development
        ];

        // Non-AI terms to exclude (expanded list)
        const nonAITerms = [
          "bagare", // baker
          "konditor", // confectioner
          "tandläkare", // dentist
          "sjuksköterska", // nurse
          "barnsjuksköterska", // pediatric nurse
          "undersköterska", // assistant nurse
          "läkare", // doctor
          "underläkare", // junior doctor
          "st-läkare", // ST doctor
          "kock", // chef
          "servitör", // waiter
          "servitris", // waitress
          "butik", // shop
          "butiksbiträde", // shop assistant
          "butikssäljare", // shop salesperson
          "butiksmedarbetare", // shop employee
          "chaufför", // driver
          "truckförare", // forklift driver
          "städare", // cleaner
          "lokalvårdare", // janitor
          "vaktmästare", // janitor
          "murare", // mason
          "snickare", // carpenter
          "elektriker", // electrician
          "rörmokare", // plumber
          "förskollärare", // preschool teacher
          "lärare", // teacher
          "säljare", // salesperson
          "säljchef", // sales manager
          "säljande", // selling
          "vi söker säljare", // we're looking for salespeople
          "mobilabonnemang", // mobile subscription
          "receptionist", // receptionist
          "produktionsplanerare", // production planner
          "affärsutvecklare", // business developer (when combined with sales)
          "barnskötare", // childcare worker
          "utbildad barnskötare", // trained childcare worker
          "restaurangvärd", // restaurant host
          "värdinna", // hostess
          "lagledare", // warehouse leader
          "psykolog", // psychologist
          "ekonomiassistent", // accounting assistant
          "ekonomi controller", // accounting controller
          "kurator", // counselor
          "säsongsarbetare", // seasonal worker
          "parkarbetare", // park worker
          "gräsklippning", // lawn mowing
          "fastighetsskötsel", // property maintenance
          "barnmorska", // midwife
          "svetsare", // welder
          "montörer", // assemblers
          "bilmontörer", // car assemblers
          "bilmekaniker", // car mechanic
          "produktionstekniker", // production technician
          "verkstadstekniker", // workshop technician
          "kriminalvårdsinspektör", // prison inspector
          "personlig assistent", // personal assistant
          "teamledare", // team leader (non-tech)
          "nationalekonom", // economist
          "samhällsvetare", // social scientist
          "eventpersonal", // event staff
          "utbildningssamordnare", // education coordinator
          "cnc-operatör", // CNC operator
          "tomte", // santa/elf
          "underhållstekniker", // maintenance technician
          "tvättoperatör", // laundry operator
          "lagerarbetare", // warehouse worker
          "lagermedarbetare", // warehouse employee
          "kundrådgivare", // customer advisor
          "lånehandläggare", // loan handler
          "socialsekreterare", // social secretary
          "socionom", // social worker
          "fysioterapeut", // physiotherapist
          "sjukgymnast", // physiotherapist
          "bowlinghallspersonal", // bowling hall staff
          "studiehandledare", // study supervisor
          "jurist", // lawyer (unless combined with tech)
          "biträdande jurist", // assistant lawyer
          "gruppledare", // group leader
          "administratör", // administrator (non-tech)
          "kvalitetstekniker", // quality technician (non-tech)
          "speciallärare", // special teacher
          "boendepersonal", // residential staff
          "skiftlags", // shift team
          "klar med plugget", // done with school
          "klart med plugget", // done with school
          "börja jobba", // start working
          "börja jobba hos oss", // start working with us
          "redan i sommar", // already this summer
          "vi söker", // we're looking for (generic)
          "vi söker säljare", // we're looking for salespeople
          "mobilabonnemang", // mobile subscription
          "jobba hos oss", // work with us
          "sommarjobb", // summer job
          "sommar jobb", // summer job
          "extra jobb", // extra job
          "extrajobb", // extra job
          "deltid", // part-time
          "heltid", // full-time
          "vikariat", // temporary position
          "vikarie", // substitute
          "konsultuppdrag", // consulting assignment (non-tech)
          "konsultuppdrag - administratör", // consulting assignment - administrator
          "kontrollant", // controller/inspector
          "taxi", // taxi
          "uber", // uber
          "bolt", // bolt
          "verksamhetsutveckling", // business development (non-tech)
          "laboratory engineer", // laboratory engineer (not AI/ML)
          "bagare", // baker
          "konditor", // confectioner
          "tandläkare", // dentist
          "fundraiser", // fundraiser
          "f2f fundraiser", // face-to-face fundraiser
          "chaufför", // driver
          "driftchef", // operations manager (non-tech)
          "frukt", // fruit
          "grönt", // green/greens
          "bageri", // bakery
          "fondtillsyn", // fund supervision
          "lagstiftning", // legislation
          "timanställda", // hourly employees
          "sjuksköterskor", // nurses
          "montör", // assembler
          "telefonförsäljare", // telemarketer
          "personlig assistent", // personal assistant
          "handläggare", // case worker
          "klimatklivsenheten", // climate unit
          "bilförsäljare", // car salesperson
          "digital bilförsäljare", // digital car salesperson
          "drifttekniker", // operations technician (non-tech)
          "skolbibliotekarie", // school librarian
          "semestervikariat", // vacation substitute
          "veterinär", // veterinarian
          "gruppchef", // group manager
          "rekondare", // reconditioner
          "hållbarhetssamordnare", // sustainability coordinator
          "kock", // chef
          "street food", // street food
          "fastighetsförvaltare", // property manager
          "hr-konsult", // HR consultant
          "utredare", // investigator
          "datahantering", // data handling (non-tech)
          "mikrodata", // microdata (non-tech)
          "arbetsterapeut", // occupational therapist
          "teamledare", // team leader (non-tech)
          "köttavdelningen", // meat department
          "livsmedelsbutik", // grocery store
          "försäljning", // sales
          "commercial partnerships", // commercial partnerships
          "ekonomiassistent", // accounting assistant
          "business central", // business central (accounting software, not AI/ML)
          "mjukvaruingenjörer", // software engineers (this should be included, but let's check)
          "elektronikingenjörer", // electronics engineers (not necessarily AI/ML)
          "barnvakt", // babysitter
          "nanny", // nanny
          "specialistläkare", // specialist doctor
          "allmänmedicin", // general medicine
          "systemförvaltare", // system administrator (non-tech)
          "ekonomi", // economy/accounting
          "konsult / interim", // consultant / interim
          ".net", // .NET (this should be included)
          "field sales", // field sales
          "avtalsförvaltare", // contract manager
          "serviceförvaltningen", // service administration
          "inköp", // procurement
          "snickare", // carpenter
          "intensivvårdssjuksköterska", // intensive care nurse
          "diskare", // dishwasher
          "extrajobb som chaufför", // extra job as driver
          "mobile core operations", // mobile core operations (not AI/ML)
          "anestesi", // anesthesia
          "operationssjuksköterska", // operating room nurse
          "hjullastare", // wheel loader
          "c2", // C2 license
          "dagskift", // day shift
          "lyhörd", // responsive
          "huddinge", // huddinge (location)
          "heldygnsvården", // 24-hour care
          "fastighetstekniker", // property technician (non-tech)
          "barnpassning", // childcare
          "receptionist", // receptionist
          "dialysklinik", // dialysis clinic
          "samordnare", // coordinator
          "hemtjänst", // home care
          "järfälla rehab", // järfälla rehab
          "beroendemottagning", // addiction clinic
          "projektledare", // project manager (non-tech)
          "installationsarbeten", // installation work
          "hr assistant", // HR assistant
          "redovisningsansvarig", // accounting manager
          "sspf", // SSPF (unknown acronym)
          "verksjurister", // legal officers
          "servicemålare", // service painter
          "målare", // painter
          "flyttledare", // moving manager
          "fritidshem", // after-school care
          "spansktalande", // Spanish-speaking
          "distriktsköterska", // district nurse
          "operativ inköpare", // operational buyer
          "högteknologiskt", // high-tech (but not necessarily AI/ML)
          "sälj", // sales (standalone)
          "nordics coverage executive director", // executive director (not tech)
          "teknisk fastighetsförvaltare", // technical property manager (not tech)
          "fastighetsförvaltare", // property manager
          "systemförvaltare", // system administrator (non-tech, just maintenance)
          "systemförvaltare - ekonomi", // system administrator - economy
          "mobile core operations", // mobile core operations (not AI/ML)
          "mobile core operations engineers", // mobile core operations engineers (not AI/ML)
          "elektronikingenjörer", // electronics engineers (not necessarily AI/ML)
          "elektronikingenjör", // electronics engineer (not necessarily AI/ML)
          "postdoktor", // postdoc
          "biopysic", // biophysics (not AI/ML)
          "biophysics", // biophysics (not AI/ML)
        ];

        // Exclude non-AI jobs first (check these first)
        // Use case-insensitive matching for better accuracy
        const textLower = text.toLowerCase();
        for (const term of nonAITerms) {
          const termLower = term.toLowerCase();
          // Use word boundary matching for better accuracy
          const regex = new RegExp(`\\b${termLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          if (regex.test(textLower)) {
            return false;
          }
        }

        // Special case: exclude "utvecklare" or "ingenjör" if combined with non-tech terms
        const hasGenericDeveloper =
          textLower.includes("utvecklare") || textLower.includes("ingenjör");
        if (hasGenericDeveloper) {
          // Check if it's a tech-related developer/engineer
          const techTerms = [
            "systemutvecklare",
            "mjukvaruutvecklare",
            "fullstackutvecklare",
            "backendutvecklare",
            "frontendutvecklare",
            "webbutvecklare",
            "applikationsutvecklare",
            "systemingenjör",
            "mjukvaruingenjör",
            "dataingenjör",
            "it-ingenjör",
            "nätverksingenjör",
            "databasingenjör",
            "produktionstekniker",
            "verkstadstekniker",
            "underhållstekniker",
            "kvalitetstekniker",
            "fastighetstekniker",
          ];

          // If it's a generic "utvecklare" or "ingenjör" without tech context, exclude
          const hasTechContext = techTerms.some((techTerm) =>
            textLower.includes(techTerm)
          );
          if (!hasTechContext) {
            // Check if it's combined with non-tech terms
            const nonTechCombos = [
              "produktions",
              "verkstads",
              "underhålls",
              "kvalitets",
              "fastighets",
              "exploaterings",
              "verksamhetsutveckling", // business development (non-tech)
              "elektronik", // electronics (not necessarily AI/ML)
            ];
            if (nonTechCombos.some((combo) => textLower.includes(combo))) {
              return false;
            }
          }
        }

        // STRICT: Must contain at least one specific tech/AI/ML keyword
        // This ensures we only show tech-related jobs
        let hasTechKeyword = false;
        for (const keyword of aiKeywords) {
          // Use word boundary matching for better accuracy
          const keywordLower = keyword.toLowerCase();
          const regex = new RegExp(
            `\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
            "i"
          );
          if (regex.test(textLower)) {
            hasTechKeyword = true;
            break;
          }
        }

        // If no tech keyword found, exclude
        if (!hasTechKeyword) {
          return false;
        }

        // Additional check: if it contains "it" or "it-", make sure it's in a tech context
        if (
          textLower.includes(" it ") ||
          textLower.includes(" it-") ||
          textLower.includes(" it,") ||
          textLower.includes(" it.")
        ) {
          // Check if it's combined with non-tech terms that would exclude it
          const nonTechITContexts = [
            "hr it",
            "it support",
            "it helpdesk",
            "it service",
            "it supporttekniker",
            "it servicedesk",
          ];
          // If it's a generic IT support role, exclude
          for (const context of nonTechITContexts) {
            if (textLower.includes(context)) {
              return false;
            }
          }
        }

        // Additional check: exclude if it contains "systemförvaltare" (system administrator - non-tech)
        if (textLower.includes("systemförvaltare")) {
          // Only exclude if it's not combined with tech terms
          const techContexts = [
            "systemutvecklare",
            "mjukvaruutvecklare",
            "systemingenjör",
            "mjukvaruingenjör",
          ];
          const hasTechContext = techContexts.some((techTerm) =>
            textLower.includes(techTerm)
          );
          if (!hasTechContext) {
            return false;
          }
        }

        // Additional check: exclude if it contains "elektronikingenjör" (electronics engineer - not necessarily AI/ML)
        if (textLower.includes("elektronikingenjör")) {
          // Only include if it's combined with AI/ML terms
          const aiMLContexts = [
            "ai",
            "ml",
            "machine learning",
            "artificial intelligence",
            "data scientist",
            "data engineer",
            "ml engineer",
            "ai engineer",
          ];
          const hasAIMLContext = aiMLContexts.some((aiMLTerm) =>
            textLower.includes(aiMLTerm)
          );
          if (!hasAIMLContext) {
            return false;
          }
        }

        // Additional check: exclude if it contains "mobile core operations" (not AI/ML)
        if (textLower.includes("mobile core operations")) {
          return false;
        }

        return true;
      });
    }

    return NextResponse.json({
      jobs: scrapedJobs,
      company: "Arbetsförmedlingen (Multiple Companies)",
      count: scrapedJobs.length,
      source: "Official Swedish Employment Service API",
    });
  } catch (error) {
    console.error("Error in /api/arbetsformedlingen:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs from Arbetsförmedlingen" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/arbetsformedlingen",
    description:
      "Search jobs from official Swedish Employment Service (Arbetsförmedlingen)",
    source: "https://jobtechdev.se",
    note: "Free public API, no authentication required",
  });
}
