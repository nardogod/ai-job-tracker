/**
 * Arbetsförmedlingen API Service
 * Official Swedish Employment Service API
 *
 * API Docs: https://jobtechdev.se/docs/apis/jobsearch/
 */

import axios from "axios";

export interface ArbetsJob {
  id: string;
  headline: string;
  employer: {
    name: string;
  };
  workplace_address: {
    municipality: string;
    region: string;
  };
  description: {
    text: string;
  };
  application_details: {
    url: string;
  };
  publication_date: string;
}

export interface ArbetsSearchParams {
  q?: string; // Search query (e.g., "AI Engineer", "Machine Learning")
  region?: string; // Region code (e.g., "01" for Stockholm)
  limit?: number; // Max results (default: 100, max: 100)
  offset?: number; // Pagination offset
}

export class ArbetsformedlingenService {
  private readonly BASE_URL = "https://jobsearch.api.jobtechdev.se";

  /**
   * Search jobs from Arbetsförmedlingen
   */
  async searchJobs(params: ArbetsSearchParams): Promise<{
    jobs: ArbetsJob[];
    total: number;
  }> {
    try {
      const response = await axios.get(`${this.BASE_URL}/search`, {
        params: {
          q: params.q || "",
          region: params.region || "",
          limit: params.limit || 100,
          offset: params.offset || 0,
        },
        timeout: 15000,
      });

      const data = response.data;

      return {
        jobs: data.hits || [],
        total: data.total?.value || 0,
      };
    } catch (error) {
      console.error("Arbetsförmedlingen API error:", error);
      return {
        jobs: [],
        total: 0,
      };
    }
  }

  /**
   * Search AI/ML jobs in Stockholm
   */
  async searchAIJobsStockholm(): Promise<ArbetsJob[]> {
    const keywords = [
      "AI Engineer",
      "Machine Learning",
      "Data Scientist",
      "ML Engineer",
      "LLM",
      "Artificial Intelligence",
    ];

    const allJobs: ArbetsJob[] = [];

    // Search for each keyword
    for (const keyword of keywords) {
      const result = await this.searchJobs({
        q: keyword,
        region: "01", // Stockholm region code
        limit: 20,
      });

      allJobs.push(...result.jobs);
    }

    // Remove duplicates by ID
    const uniqueJobs = Array.from(
      new Map(allJobs.map((job) => [job.id, job])).values()
    );

    return uniqueJobs;
  }

  /**
   * Simple Swedish to English translation for common job titles
   */
  private translateSwedishTitle(swedishTitle: string): string {
    // Common Swedish job title translations (word by word)
    const wordTranslations: { [key: string]: string } = {
      utvecklare: "Developer",
      utveckling: "Development",
      ingenjör: "Engineer",
      ingenjörs: "Engineering",
      data: "Data",
      system: "System",
      mjukvaru: "Software",
      webb: "Web",
      applikations: "Application",
      backend: "Backend",
      frontend: "Frontend",
      fullstack: "Full Stack",
      ai: "AI",
      "ai-lösningar": "AI Solutions",
      "ai-lösning": "AI Solution",
      maskininlärning: "Machine Learning",
      datavetare: "Data Scientist",
      analytiker: "Analyst",
      arkitekt: "Architect",
      konsult: "Consultant",
      specialist: "Specialist",
      chef: "Manager",
      ledare: "Leader",
      designer: "Designer",
      designansvarig: "Design Manager",
      testare: "Tester",
      devops: "DevOps",
      cloud: "Cloud",
      säkerhet: "Security",
      cyber: "Cyber",
      nätverk: "Network",
      databas: "Database",
      plattform: "Platform",
      produkt: "Product",
      projekt: "Project",
      teknik: "Technical",
      senior: "Senior",
      junior: "Junior",
      medior: "Mid-level",
      biträdande: "Assistant",
      jurist: "Lawyer",
      examensarbete: "Thesis Project",
      modell: "Model",
      implementering: "Implementation",
      prioritering: "Prioritization",
      "supply chain": "Supply Chain",
      lösningar: "Solutions",
      lösning: "Solution",
      för: "for",
      av: "of",
      inom: "within",
      i: "in",
      till: "to",
      systemutvecklare: "System Developer",
      mjukvaruutvecklare: "Software Developer",
      fullstackutvecklare: "Full Stack Developer",
      datavetare: "Data Scientist",
      systemingenjör: "System Engineer",
      mjukvaruingenjör: "Software Engineer",
      dataingenjör: "Data Engineer",
      systemarkitekt: "System Architect",
      mjukvaruarkitekt: "Software Architect",
      nätverksingenjör: "Network Engineer",
      databasingenjör: "Database Engineer",
      plattformsutvecklare: "Platform Developer",
      programmerare: "Programmer",
      informationsteknologi: "Information Technology",
      systemutveckling: "System Development",
      mjukvaruutveckling: "Software Development",
      webbutveckling: "Web Development",
      applikationsutveckling: "Application Development",
      // Common Swedish job-related words
      säljare: "Salesperson",
      säljchef: "Sales Manager",
      säljande: "Selling",
      försäljning: "Sales",
      kundrådgivare: "Customer Advisor",
      kundservice: "Customer Service",
      receptionist: "Receptionist",
      administratör: "Administrator",
      assistent: "Assistant",
      personlig: "Personal",
      samordnare: "Coordinator",
      handläggare: "Case Worker",
      utredare: "Investigator",
      projektledare: "Project Manager",
      teamledare: "Team Leader",
      gruppchef: "Group Manager",
      chef: "Manager",
      butikschef: "Store Manager",
      butikssäljare: "Shop Salesperson",
      butiksmedarbetare: "Shop Employee",
      butiksbiträde: "Shop Assistant",
      kock: "Chef",
      servitör: "Waiter",
      servitris: "Waitress",
      chaufför: "Driver",
      truckförare: "Forklift Driver",
      montör: "Assembler",
      svetsare: "Welder",
      snickare: "Carpenter",
      elektriker: "Electrician",
      målare: "Painter",
      städare: "Cleaner",
      lärare: "Teacher",
      förskollärare: "Preschool Teacher",
      sjuksköterska: "Nurse",
      läkare: "Doctor",
      tandläkare: "Dentist",
      psykolog: "Psychologist",
      kurator: "Counselor",
      arbetsterapeut: "Occupational Therapist",
      fysioterapeut: "Physiotherapist",
      barnvakt: "Babysitter",
      nanny: "Nanny",
      personlig: "Personal",
      assistent: "Assistant",
      vikariat: "Temporary Position",
      vikarie: "Substitute",
      heltid: "Full-time",
      deltid: "Part-time",
      dagtid: "Daytime",
      kvällar: "Evenings",
      helger: "Weekends",
      månader: "Months",
      år: "Year",
      gånger: "Times",
      veckan: "Week",
      vecka: "Week",
      dag: "Day",
      dagar: "Days",
      timmar: "Hours",
      pass: "Shift",
      uppdrag: "Assignment",
      kund: "Customer",
      kunder: "Customers",
      företag: "Company",
      bolag: "Company",
      kommun: "Municipality",
      region: "Region",
      stad: "City",
      staden: "City",
      län: "County",
      sverige: "Sweden",
      stockholm: "Stockholm",
      göteborg: "Gothenburg",
      malmö: "Malmö",
      uppsala: "Uppsala",
      örebro: "Örebro",
      // Common phrases
      "vi söker": "We're looking for",
      "vi söker säljare": "We're looking for salespeople",
      "klar med plugget": "Done with school",
      "börja jobba": "Start working",
      "börja jobba hos oss": "Start working with us",
      "redan i sommar": "Already this summer",
      "jobba hos oss": "Work with us",
      sommarjobb: "Summer job",
      "extra jobb": "Extra job",
      extrajobb: "Extra job",
      "söker personlig assistent": "Looking for personal assistant",
      "personlig assistent": "Personal assistant",
      "barnvakt nanny": "Babysitter nanny",
      "myNanny barnvakt": "myNanny babysitter",
      barnpassning: "Childcare",
      "nanny / barnpassning": "Nanny / childcare",
      "heltid/dagtid": "Full-time/daytime",
      deltid: "Part-time",
      "vikariat 75%": "Temporary position 75%",
      "fast tjänst": "Permanent position",
      "100% tjänst": "100% position",
      "talar även spanska": "Also speaks Spanish",
      spansktalande: "Spanish-speaking",
      "kvinnlig assistent": "Female assistant",
      "glad kille": "Happy guy",
      "på 19 år": "19 years old",
      "engagerad queer": "Engaged queer",
      "söker personlig assistent": "Looking for personal assistant",
      "som gillar": "who likes",
      "rak kommunikation": "direct communication",
      lyhörd: "Responsive",
      huddinge: "Huddinge",
      "vikariat 75%": "Temporary position 75%",
      "med chans till förlängning": "with chance for extension",
      "heltid/dagtid": "Full-time/daytime",
      "1-2 ggr/v": "1-2 times/week",
      "1-3 ggr/v": "1-3 times/week",
      "2-3 gånger i veckan": "2-3 times per week",
      "1-2 dagar/vecka": "1-2 days/week",
      "1 em/v": "1 evening/week",
      "ggr/v": "times/week",
      "em/v": "evening/week",
      dagskift: "Day shift",
      "omgående start": "Immediate start",
      "tillträde januari": "Start January",
      tillträde: "Start",
      januari: "January",
      februari: "February",
      mars: "March",
      april: "April",
      maj: "May",
      juni: "June",
      juli: "July",
      augusti: "August",
      september: "September",
      oktober: "October",
      november: "November",
      december: "December",
      // Additional common words
      bagare: "Baker",
      konditor: "Confectioner",
      telefonförsäljare: "Telemarketer",
      sökes: "is sought",
      söks: "is sought",
      ekonomiassistent: "Accounting Assistant",
      erfarenhet: "experience",
      erfaren: "experienced",
      socialsekreterare: "Social Secretary",
      distriktssköterska: "District Nurse",
      spännande: "exciting",
      möjligheter: "opportunities",
      vår: "our",
      omgående: "immediately",
      nya: "new",
      kontor: "office",
      ekonomibiträdestjänst: "accounting assistant service",
      kostentheten: "the cost unit",
      inriktning: "focus",
      datahantering: "data handling",
      mikrodata: "microdata",
      hemtjänst: "home care",
      bistånd: "support",
      dialysklinik: "dialysis clinic",
      vårdcentral: "health center",
      allmänmedicin: "general medicine",
      specialistläkare: "Specialist Doctor",
      skolbibliotekarie: "School Librarian",
      rekondare: "Reconditioner",
      hållbarhetssamordnare: "Sustainability Coordinator",
      driftchef: "Operations Manager",
      drifttekniker: "Operations Technician",
      fastighetstekniker: "Property Technician",
      systemadministratör: "System Administrator",
      systemförvaltare: "System Administrator",
      livsmedel: "food",
      redovisningsansvarig: "Accounting Manager",
      verksjurister: "Legal Officers",
      kvalificerade: "qualified",
      duktig: "skilled",
      servicemålare: "Service Painter",
      flyttledare: "Moving Manager",
      fritidshem: "after-school care",
      skola: "school",
      kvinna: "woman",
      södermalm: "Södermalm",
      baklastare: "rear loader",
      återvinning: "recycling",
      södra: "southern",
      hjullastare: "Wheel Loader",
      förlängning: "extension",
      förlängni: "extension",
      roligt: "fun",
      väletablerad: "well-established",
      bli: "become",
      hjärnan: "the brain",
      hjärtat: "the heart",
      flyttteam: "moving team",
      bird: "bird",
      söder: "south",
      mobilabonnemang: "mobile subscription",
      kontrollant: "Controller",
      kriminalvårdens: "Prison Service's",
      underrättelseenhet: "Intelligence Unit",
      verksamhetsutveckling: "business development",
      försvarets: "Defense's",
      materielverk: "Material Administration",
      folktandvården: "Public Dental Service",
      björkhagen: "Björkhagen",
      insamlingsstift: "Foundation",
      oxfam: "Oxfam",
      ekonomibiträdestjänst: "accounting assistant service",
      kostenheten: "the cost unit",
      nynäshamns: "Nynäshamn's",
      ica: "ICA",
      maxi: "Maxi",
      stenhagen: "Stenhagen",
      frukt: "fruit",
      grönt: "greens",
      bageri: "bakery",
      fondtillsyn: "fund supervision",
      lagstiftning: "legislation",
      timanställda: "hourly employees",
      klingsta: "Klingsta",
      danderyds: "Danderyd's",
      eltel: "Eltel",
      sthlm: "Stockholm",
      diamax: "Diamax",
      klimatklivsenheten: "Climate Leap Unit",
      ladda: "charge",
      bilen: "the car",
      digital: "digital",
      bilförsäljare: "car salesperson",
      glad: "happy",
      kille: "guy",
      kvinnlig: "female",
      alova: "Alova",
      fastighetsteknik: "Property Technology",
      karlslundsskolan: "Karlslund School",
      semestervikariat: "vacation substitute",
      timmaspass: "24-hour shift",
      över: "over",
      jul: "Christmas",
      nyår: "New Year",
      officiell: "official",
      veterinär: "Veterinarian",
      norvik: "Norvik",
      hamn: "port",
      timavlönad: "hourly paid",
      livsmedelsverket: "Food Agency",
      vård: "care",
      omsorgsboende: "care home",
      teknisk: "technical",
      fastighetsförvaltare: "Property Manager",
      stockholms: "Stockholm's",
      hamnar: "ports",
      precio: "Precio",
      fishbone: "Fishbone",
      solna: "Solna",
      statens: "State's",
      institutionsstyrelse: "Agency for Institutional Care",
      hemrehab: "home rehab",
      rehab: "rehab",
      city: "City",
      köttavdelningen: "meat department",
      livsmedelsbutik: "grocery store",
      botkyrka: "Botkyrka",
      commercial: "commercial",
      partnerships: "partnerships",
      global: "global",
      business: "business",
      central: "central",
      mjukvaruingenjörer: "Software Engineers",
      saab: "Saab",
      elektronikingenjörer: "Electronics Engineers",
      kungsholmen: "Kungsholmen",
      barkarby: "Barkarby",
      interim: "interim",
      uber: "Uber",
      rides: "Rides",
      serviceförvaltningen: "Service Administration",
      inköp: "procurement",
      lidingö: "Lidingö",
      intensivvårdssjuksköterska: "Intensive Care Nurse",
      undersköterskor: "Assistant Nurses",
      viksjö: "Viksjö",
      biopysic: "Biophysics",
      diskare: "Dishwasher",
      extrajobb: "extra job",
      dagab: "Dagab",
      bålsta: "Bålsta",
      storesupport: "Store Support",
      bemanning: "Staffing",
      anestesi: "anesthesia",
      operationssjuksköterska: "Operating Room Nurse",
      mackla: "Mackla",
      falun: "Falun",
      chans: "chance",
      heldygnsvården: "24-hour care",
      scä: "SCÄ",
      uppdrag: "assignment",
      åkersberga: "Åkersberga",
      ambulerande: "traveling",
      nacka: "Nacka",
      vimla: "Vimla",
      nynäshamn: "Nynäshamn",
      beroendemottagning: "addiction clinic",
      installationsarbeten: "installation work",
      förbifart: "bypass",
      vallentuna: "Vallentuna",
      tyresö: "Tyresö",
      arta: "Arta",
      plast: "Plast",
      älta: "Älta",
      sspf: "SSPF",
      sollentuna: "Sollentuna",
      säkerhetspolisen: "Security Police",
      pandy: "Pandy",
      katarina: "Katarina",
      spansktalande: "Spanish-speaking",
      stocksund: "Stocksund",
      råsunda: "Råsunda",
      vc: "VC",
      // Additional words from search results that need translation
      mättekniker: "Measurement Technician",
      backendutvecklare: "Backend Developer",
      sälj: "Sales",
      och: "and",
      do: "DO",
      söker: "is looking for",
      hr: "HR",
      specialister: "specialists",
      säva: "SÄVA",
      kunduppdrag: "customer assignment",
      rekondare: "Reconditioner",
      utvecklare: "Developer",
      net: ".NET",
      dotnet: ".NET",
      // Additional words from Örebro search results
      produktionstekniker: "Production Technician",
      produktionsingenjör: "Production Engineer",
      produktionsplanerare: "Production Planner",
      verkstadstekniker: "Workshop Technician",
      underhållstekniker: "Maintenance Technician",
      säsongsarbetare: "Seasonal worker",
      parkarbetare: "Park worker",
      gräsklippning: "Lawn mowing",
      fastighetsskötsel: "Property maintenance",
      cnc: "CNC",
      operatör: "Operator",
      intendent: "Caretaker",
      vaktmästare: "Janitor",
      speciallärare: "Special Teacher",
      leg: "Licensed",
      studiehandledare: "Study Supervisor",
      nederländska: "Dutch",
      tyska: "German",
      bowlinghallspersonal: "Bowling Hall Staff",
      tvättoperatör: "Laundry Operator",
      cleanroom: "Cleanroom",
      inbound: "Inbound",
      replenishment: "Replenishment",
      planner: "Planner",
      controller: "Controller",
      // Additional words from Örebro search results
      farmaceut: "Pharmacist",
      nyöppnat: "newly opened",
      apotek: "pharmacy",
      utbildad: "trained",
      barnskötare: "childcare worker",
      förskolan: "preschool",
      restaurangvärd: "Restaurant host",
      värdinna: "hostess",
      lagledare: "Warehouse leader",
      lagerterminalen: "warehouse terminal",
      psykolog: "Psychologist",
      ungdomshabiliteringen: "youth habilitation",
      allmänpsykiatrisk: "general psychiatric",
      öppenvård: "outpatient care",
      behöver: "need",
      du: "you",
      ett: "a",
      jobb: "job",
      med: "with",
      frihet: "freedom",
      bra: "good",
      lön: "salary",
      barnmorska: "Midwife",
      ungdomsmottagningen: "youth clinic",
      mellanstadiet: "middle school",
      utredare: "Investigator",
      exploateringsingenjör: "Development Engineer",
      exploateringsenheten: "Development Unit",
      gruppledare: "Group leader",
      dagtid: "daytime",
      hemtjänsten: "home care service",
      biogaschef: "Biogas Manager",
      världsledande: "world-leading",
      aktör: "actor/company",
      fordonsindustrin: "automotive industry",
      montörer: "Assemblers",
      kriminalvårdsinspektör: "Prison Inspector",
      anstalten: "prison",
      produktionsprojekt: "production project",
      underläkare: "Junior Doctor",
      fysioterapeut: "Physiotherapist",
      sjukgymnast: "Physiotherapist",
      trevligt: "nice",
      företag: "company",
      örebroregionen: "Örebro region",
      svenska: "Swedish",
      engelska: "English",
      boendepersonal: "residential staff",
      elevboenden: "student housing",
      skillnad: "difference",
      ytan: "surface",
      kollega: "colleague",
      lagermedarbetare: "Warehouse employee",
      lokalvårdare: "Janitor",
      lagerarbetare: "Warehouse worker",
      drivna: "driven",
      betongarbetare: "concrete worker",
      vill: "want",
      utvecklas: "develop",
      fritidshemmet: "after-school care",
      mötesbokare: "Meeting booker",
      lånehandläggare: "Loan handler",
      bilmontörer: "Car assemblers",
      bilmekaniker: "Car mechanics",
      stödassistent: "Support assistant",
      specialboende: "special housing",
      enligt: "according to",
      lss: "LSS",
      barnsjuksköterska: "Pediatric Nurse",
      trygghet: "security",
      centrala: "central",
      unga: "young",
      nationalekonom: "Economist",
      samhällsvetare: "Social scientist",
      statistikkunskaper: "statistics knowledge",
      administrativ: "administrative",
      kvalitetstekniker: "Quality Technician",
      eventpersonal: "Event staff",
      julevent: "Christmas event",
      utbildningssamordnare: "Education coordinator",
      svealandstrafiken: "Svealand traffic",
      transportstyrelsen: "Transport Agency",
      luncher: "lunches",
      processoperatör: "Process operator",
      fabriksmedarbetare: "Factory employee",
      jobba: "work",
      tomte: "Santa/Elf",
      stämningsfullt: "atmospheric",
      försörjningsstöd: "financial support",
      scb: "SCB",
    };

    // Common phrase translations
    const phraseTranslations: { [key: string]: string } = {
      "examensarbete: utveckling av modell för ai-lösningar supply chain":
        "Thesis Project: Development of Model for AI Solutions in Supply Chain",
      "examensarbete: implementering av ai-lösningar inom supply chain":
        "Thesis Project: Implementation of AI Solutions within Supply Chain",
      "examensarbete: modell för prioritering av ai-lösningar i supply chain":
        "Thesis Project: Model for Prioritization of AI Solutions in Supply Chain",
      "biträdande jurist": "Assistant Lawyer",
      designansvarig: "Design Manager",
      // Phrases from search results that need translation
      "taxi uber och bolt": "TAXI UBER AND BOLT",
      "do söker hr-specialister": "DO is looking for HR specialists",
      "do söker hr-specialister (säva)":
        "DO is looking for HR specialists (SÄVA)",
      "affärsdriven logistikanalytiker": "Business-driven Logistics Analyst",
      transportinköpare: "Transport Purchaser",
      "affärsdriven logistikanalytiker & transportinköpare":
        "Business-driven Logistics Analyst & Transport Purchaser",
      "affärsdriven logistikanalytiker & transportinköpare till logent":
        "Business-driven Logistics Analyst & Transport Purchaser to Logent",
      "fullstack .net utvecklare": "Full Stack .NET Developer",
      "fullstack-utvecklare .net c#": "Full Stack Developer .NET C#",
      "junior administratör till kunduppdrag":
        "Junior Administrator to customer assignment",
      rekondare: "Reconditioner",
      // Phrases from Örebro search results
      produktionsplanerare: "Production Planner",
      verkstadstekniker: "Workshop Technician",
      "säsongsarbetare - parkarbetare/gräsklippning/fastighetsskötsel":
        "Seasonal worker - park worker/lawn mowing/property maintenance",
      "cnc-operatör": "CNC Operator",
      underhållstekniker: "Maintenance Technician",
      "intendent/vaktmästare": "Caretaker/Janitor",
      speciallärare: "Special Teacher",
      "leg. sjuksköterskor": "Licensed Nurses",
      "studiehandledare nederländska": "Study Supervisor Dutch",
      "studiehandledare tyska": "Study Supervisor German",
      bowlinghallspersonal: "Bowling Hall Staff",
      "tvättoperatör/underhållstekniker cleanroom":
        "Laundry Operator/Maintenance Technician Cleanroom",
      "inbound replenishment planner": "Inbound Replenishment Planner",
      "ekonomi controller": "Accounting Controller",
      "system developer": "System Developer",
      "produktionstekniker/produktionsingenjör":
        "Production Technician/Production Engineer",
      // Additional phrases from Örebro search results
      "farmaceut till nyöppnat apotek": "Pharmacist to newly opened pharmacy",
      "utbildad barnskötare till förskolan":
        "Trained childcare worker to preschool",
      "restaurangvärd/värdinna": "Restaurant host/hostess",
      "lagledare – lagerterminalen": "Warehouse leader – warehouse terminal",
      "psykolog till barn- och ungdomshabiliteringen":
        "Psychologist to children and youth habilitation",
      "kurator till allmänpsykiatrisk öppenvård":
        "Counselor to general psychiatric outpatient care",
      "behöver du ett jobb med frihet och bra lön":
        "Do you need a job with freedom and good salary",
      "barnmorska till ungdomsmottagningen": "Midwife to youth clinic",
      "lärare 4-6 till mellanstadiet": "Teacher 4-6 to middle school",
      "exploateringsingenjör till exploateringsenheten":
        "Development Engineer to Development Unit",
      "gruppledare dagtid": "Group leader daytime",
      "administratör inom hemtjänsten":
        "Administrator within home care service",
      biogaschef: "Biogas Manager",
      "truckförare till världsledande aktör inom fordonsindustrin":
        "Forklift Driver to world-leading company in automotive industry",
      "montörer till världsledande aktör inom fordonsindustrin":
        "Assemblers to world-leading company in automotive industry",
      "chef (kriminalvårdsinspektör) anstalten":
        "Manager (Prison Inspector) prison",
      "projektledare mot produktionsprojekt":
        "Project Manager towards production project",
      "svetsare till fordonsindustrin": "Welder to automotive industry",
      "underläkare till karla vårdcentral":
        "Junior Doctor to Karla health center",
      "fysioterapeut/sjukgymnast till barn- och ungdomshabiliteringen":
        "Physiotherapist to children and youth habilitation",
      "svetsare sökes till trevligt företag i örebroregionen":
        "Welder is sought to nice company in Örebro region",
      "lärare i svenska och engelska": "Teacher in Swedish and English",
      "boendepersonal till åsbackaskolans elevboenden":
        "Residential staff to Åsbackaskolan student housing",
      "gör skillnad under ytan - bli software engineer":
        "Make a difference under the surface - become Software Engineer",
      "personlig assistent till ung kvinna":
        "Personal assistant to young woman",
      "personlig assistent till kvinna i centrala örebro":
        "Personal assistant to woman in central Örebro",
      "socialsekreterare till ifo, enhet utredning barn och unga":
        "Social Secretary to IFO, unit investigation children and young",
      "teamledare till telia field operations":
        "Team Leader to Telia Field Operations",
      "nationalekonom/samhällsvetare med statistikkunskaper":
        "Economist/Social scientist with statistics knowledge",
      "administrativ kvalitetstekniker": "Administrative Quality Technician",
      "eventpersonal till julevent": "Event staff to Christmas event",
      "junior projektledare inom r&d": "Junior Project Manager within R&D",
      "utbildningssamordnare svealandstrafiken":
        "Education coordinator Svealand traffic",
      "fullstackutvecklare till transportstyrelsen":
        "Full Stack Developer to Transport Agency",
      "servitör/servitris: extra kvällar/luncher och helger":
        "Waiter/Waitress: Extra evenings/lunches and weekends",
      "processoperatör/fabriksmedarbetare": "Process operator/Factory employee",
      "jobba som kundrådgivare": "Work as Customer Advisor",
      "tomte sökes till stämningsfullt julevent":
        "Santa is sought to atmospheric Christmas event",
      "socialsekreterare försörjningsstöd vikariat":
        "Social Secretary financial support temporary position",
      "mötesbokare i centrala örebro": "Meeting booker in central Örebro",
      "junior lånehandläggare": "Junior Loan handler",
      "säljande lånehandläggare": "Selling Loan handler",
      "systemutvecklare till scb": "System Developer to SCB",
      "undersköterska till vårdboende": "Assistant Nurse to care home",
      "bilmontörer/bilmekaniker sökes":
        "Car assemblers/Car mechanics is sought",
      "stödassistent till stenebrunn, specialboende enligt lss":
        "Support assistant to Stenebrunn, special housing according to LSS",
      "barnsjuksköterska till barn- och ungdomsmottagningen":
        "Pediatric Nurse to children and youth clinic",
      "skapa trygghet genom kvalitet - bli vår nya kollega":
        "Create security through quality - become our new colleague",
      "lagermedarbetare till kund": "Warehouse employee to customer",
      "lokalvårdare till uppdrag hos kund":
        "Janitor to assignment with customer",
      "butiksmedarbetare med fokus på kundservice":
        "Shop Employee with focus on Customer Service",
      "lagerarbetare sökes till kunduppdrag":
        "Warehouse worker is sought to customer assignment",
      "lokalvårdare till kunduppdrag": "Janitor to customer assignment",
      "medicinskt ansvarig sjuksköterska": "Medically responsible Nurse",
      "socionom/socialsekreterare barn och familj":
        "Social worker/Social Secretary children and family",
      "vi söker drivna betongarbetare som vill utvecklas":
        "We're looking for driven concrete workers who want to develop",
      "butiksmedarbetare (extrajobb)": "Shop Employee (extra job)",
      "stocksätterskolan söker lärare till fritidshemmet":
        "Stocksätterskolan is looking for Teacher to after-school care",
    };

    // Check if title contains Swedish characters or common Swedish words
    const hasSwedishChars = /[åäöÅÄÖ]/.test(swedishTitle);
    const lowerTitle = swedishTitle.toLowerCase().trim();

    // Check if title is already mostly in English (common English job title words)
    const englishJobTitleWords = [
      "senior",
      "junior",
      "developer",
      "engineer",
      "manager",
      "director",
      "executive",
      "assistant",
      "specialist",
      "analyst",
      "coordinator",
      "consultant",
      "representative",
      "partnerships",
      "global",
      "commercial",
      "laboratory",
      "mobile",
      "core",
      "operations",
      "hr",
      "bi",
      "data",
      "fullstack",
      "full stack",
      "backend",
      "frontend",
      "network",
      "system",
      "software",
      "architect",
      "lead",
      "part-time",
      "part time",
      "f2f",
      "fundraisers",
      "oxfam",
      "is looking for",
      "looking for",
      "inbound",
      "replenishment",
      "planner",
      "controller",
      "cnc",
      "operator",
      "cleanroom",
    ];

    const isMostlyEnglish =
      englishJobTitleWords.some((word) =>
        lowerTitle.includes(word.toLowerCase())
      ) && !hasSwedishChars;

    // If title is already mostly in English and has no Swedish characters, return as is
    if (isMostlyEnglish && !hasSwedishChars) {
      return swedishTitle;
    }

    // Common Swedish words that indicate Swedish text (expanded list)
    const swedishIndicators = [
      "utvecklare",
      "ingenjör",
      "jurist",
      "examensarbete",
      "designansvarig",
      "biträdande",
      "till",
      "för",
      "av",
      "inom",
      "i",
      "och",
      "söker",
      "sökes",
      "ansvarig",
      "chef",
      "ledare",
      "specialist",
      "konsult",
      "analytiker",
      "med",
      "hos",
      "eller",
      "som",
      "är",
      "kan",
      "ska",
      "vill",
      "börja",
      "jobba",
      "arbeta",
      "redan",
      "sommar",
      "plugget",
      "klar",
      "vi",
      "dig",
      "talar",
      "spanska",
      "fast",
      "tjänst",
      "vikariat",
      "heltid",
      "deltid",
      "dagtid",
      "kvällar",
      "helger",
      "månader",
      "år",
      "år",
      "gånger",
      "veckan",
      "vecka",
      "dag",
      "dagar",
      "timmar",
      "pass",
      "uppdrag",
      "kund",
      "kunder",
      "företag",
      "bolag",
      "kommun",
      "region",
      "stad",
      "staden",
      "län",
      "sverige",
      "stockholm",
      "göteborg",
      "malmö",
      "uppsala",
      "örebro",
      "järfälla",
      "solna",
      "sundbyberg",
      "danderyd",
      "nacka",
      "sigtuna",
      "vallentuna",
      "tyresö",
      "lidingö",
      "huddinge",
      "haninge",
      "sollentuna",
      "botkyrka",
      "nynäshamn",
      "södertälje",
      "upplands-bro",
      "österåker",
      "kumla",
      "karlskoga",
      "hallsberg",
      "nora",
      "lindesberg",
      "askersund",
      "ljusnarsberg",
      "hällefors",
      "degerfors",
      "laxå",
      "lekeberg",
    ];

    // Check if title contains Swedish words or characters
    const hasSwedishWords = swedishIndicators.some((word) =>
      lowerTitle.includes(word)
    );
    const isSwedish = hasSwedishChars || hasSwedishWords;

    // If it's clearly Swedish, try to translate
    if (isSwedish) {
      // First try phrase translations (exact match)
      for (const [swedish, english] of Object.entries(phraseTranslations)) {
        if (lowerTitle.includes(swedish)) {
          return `${swedishTitle} (${english})`;
        }
      }

      // Then try word-by-word translation
      let translated = swedishTitle;
      let hasTranslation = false;

      // Sort translations by length (longer first) to avoid partial matches
      const sortedTranslations = Object.entries(wordTranslations).sort(
        (a, b) => b[0].length - a[0].length
      );

      // Try to translate common words (preserve case)
      for (const [swedish, english] of sortedTranslations) {
        const regex = new RegExp(
          `\\b${swedish.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
          "gi"
        );
        if (regex.test(translated)) {
          translated = translated.replace(regex, (match) => {
            // Preserve case
            if (match === match.toUpperCase()) {
              return english.toUpperCase();
            } else if (match[0] === match[0].toUpperCase()) {
              return english.charAt(0).toUpperCase() + english.slice(1);
            }
            return english;
          });
          hasTranslation = true;
        }
      }

      // If translation changed something, return both
      if (
        hasTranslation &&
        translated !== swedishTitle &&
        translated.length > 0
      ) {
        // Clean up the translation (remove extra spaces, fix capitalization)
        translated = translated.replace(/\s+/g, " ").trim();
        // Capitalize first letter
        translated = translated.charAt(0).toUpperCase() + translated.slice(1);
        return `${swedishTitle} (${translated})`;
      }

      // If we detected Swedish but couldn't translate, still add a note
      // Always add translation note if we detected Swedish
      if (isSwedish) {
        return `${swedishTitle} (Swedish - translation needed)`;
      }
    }

    // If title contains Swedish characters but wasn't detected as Swedish, still add note
    if (hasSwedishChars) {
      return `${swedishTitle} (Swedish - translation needed)`;
    }

    return swedishTitle;
  }

  /**
   * Check if job is AI/ML related
   */
  private isAIJob(title: string, description?: string): boolean {
    const aiKeywords = [
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
      "computer vision",
      "generative ai",
      "llm",
      "prompt engineer",
      "utvecklare", // developer
      "ingenjör", // engineer
      "datavetare", // data scientist
      "systemutvecklare", // system developer
      "mjukvaruutvecklare", // software developer
      "backend",
      "frontend",
      "fullstack",
      "cloud",
      "devops",
      "cyber",
      "säkerhet", // security
      "nätverk", // network
      "databas", // database
      "plattform", // platform
    ];

    const nonAITerms = [
      "bagare", // baker
      "konditor", // confectioner
      "tandläkare", // dentist
      "sjuksköterska", // nurse
      "läkare", // doctor
      "kock", // chef
      "servitör", // waiter
      "butik", // shop
      "butiksbiträde", // shop assistant
      "chaufför", // driver
      "städare", // cleaner
      "vaktmästare", // janitor
      "murare", // mason
      "snickare", // carpenter
      "elektriker", // electrician
      "rörmokare", // plumber
    ];

    const text = `${title} ${description || ""}`.toLowerCase();

    // First check if it contains non-AI terms (exclude these)
    for (const term of nonAITerms) {
      if (text.includes(term)) {
        return false;
      }
    }

    // Then check if it contains AI/tech terms
    for (const keyword of aiKeywords) {
      if (text.includes(keyword)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Convert Arbetsförmedlingen job to ScrapedJob format
   */
  convertToScrapedJob(arbetsJob: ArbetsJob): {
    title: string;
    company: string;
    location: string;
    url: string;
    description?: string;
    posted_date?: Date;
    cost: {
      requests: number;
      source: string;
    };
  } {
    // Translate title if it's in Swedish
    const title = this.translateSwedishTitle(arbetsJob.headline);

    return {
      title,
      company: arbetsJob.employer?.name || "Unknown Company",
      location: `${arbetsJob.workplace_address?.municipality || ""}, ${
        arbetsJob.workplace_address?.region || "Sweden"
      }`.trim(),
      url:
        arbetsJob.application_details?.url ||
        `https://arbetsformedlingen.se/platsbanken/annonser/${arbetsJob.id}`,
      description: arbetsJob.description?.text?.substring(0, 200),
      posted_date: arbetsJob.publication_date
        ? new Date(arbetsJob.publication_date)
        : undefined,
      cost: {
        requests: 1,
        source: "Arbetsförmedlingen API",
      },
    };
  }
}
