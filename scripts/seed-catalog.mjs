#!/usr/bin/env node
import { writeFileSync, mkdirSync, cpSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { EXTRA_APIS } from "./extra-apis.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const catalogDir = join(__dirname, "../src/data/catalog");

const PROMPT_ARCHETYPES = [
  {
    tags: ["map", "geo"],
    prompts: [
      "Create a map that makes geographic patterns obvious at a glance.",
      "Build a spatial view that shows where the data clusters and why it matters.",
      "Design a map-first prototype that answers one place-based question.",
      "Prototype a list-plus-map experience for exploring locations in the dataset.",
      "Make a map that compares density, distance, or distribution in one screen.",
      "Turn coordinates into a story — show what changes from region to region.",
      "Build a map UI that helps someone spot outliers in the real world.",
      "Create a lightweight geo explorer with pan, zoom, and one clear insight.",
      "Design a map overlay that connects two layers from the same dataset.",
      "Sketch a spatial dashboard that makes borders, routes, or proximity click.",
    ],
  },
  {
    tags: ["charts", "time-series", "comparison"],
    prompts: [
      "Build a one-screen dashboard that surfaces the most surprising pattern in today's data.",
      "Design a dashboard that answers one executive question in under ten seconds.",
      "Create a single view that compares today vs. typical using live API data.",
      "Prototype a dashboard where typography does more work than charts.",
      "Build a KPI wall from real endpoints — no placeholder numbers.",
      "Design a dashboard that highlights one anomaly worth investigating.",
      "Create a summary screen that links every metric back to its source field.",
      "Build a dashboard that makes a trend impossible to misread.",
      "Prototype a daily briefing view powered entirely by public API responses.",
      "Design a compact dashboard for a teammate who hates dashboards.",
    ],
  },
  {
    tags: ["search", "comparison", "geo"],
    prompts: [
      "Prototype a small decision tool that helps someone pick, compare, or filter with live data.",
      "Build a chooser that narrows hundreds of records down to one recommendation.",
      "Design a filter flow with great defaults and one satisfying final result.",
      "Create a comparison tool that makes tradeoffs obvious without chart junk.",
      "Prototype a wizard that uses API data at every step.",
      "Build a tool that answers 'which one should I use?' from real records.",
      "Design a side-by-side picker for two entities from the dataset.",
      "Create a short questionnaire that ends in a data-backed suggestion.",
      "Prototype a sorting interface that teaches what the fields mean.",
      "Build a micro-app that helps a teammate decide in one sitting.",
    ],
  },
  {
    tags: ["time-series", "trending"],
    prompts: [
      "Design a timeline or trend explorer that follows one thread through the data over time.",
      "Build a timeline that shows momentum — not every data point at once.",
      "Create a trend view that highlights when something changed and why it might matter.",
      "Prototype a sparkline-first screen with one expandable deep dive.",
      "Design a chronological story with three moments that matter most.",
      "Build a time slider that updates the whole UI from live API calls.",
      "Create a 'what changed this week?' explorer from timestamped records.",
      "Prototype a history view that links events to their source entries.",
      "Design a trend card that stands alone in Slack or email.",
      "Build a timeline that compares two series on the same axis.",
    ],
  },
  {
    tags: ["alerts", "real-time"],
    prompts: [
      "Sketch an alert you'd actually want to receive when the data crosses a threshold that matters.",
      "Design a notification concept with visible trigger logic and a clear action.",
      "Build a monitor that shows green/yellow/red based on live API values.",
      "Prototype an alert preview — what would the message say right now?",
      "Create a threshold editor tied to real fields from the dataset.",
      "Design a watchlist that pings you when something unusual appears.",
      "Build a status page powered by a public API's current values.",
      "Prototype an on-call style alert card with context, not just noise.",
      "Create a rule builder: if this field, then this notification.",
      "Design an alert digest that groups related signals into one update.",
    ],
  },
  {
    tags: ["comparison", "education"],
    prompts: [
      "Build a side-by-side comparison between two entities from the data.",
      "Design a diff view that makes similarities and gaps scannable in seconds.",
      "Create a comparison table that links every cell to its API source.",
      "Prototype a 'versus' screen for two cities, products, species, or artworks.",
      "Build a comparison that works on mobile with swipe between entities.",
      "Design a benchmark view — how does A stack up against B on one metric?",
      "Create a split screen that updates both sides from live fetches.",
      "Prototype a comparison export someone would share with their team.",
      "Build a before/after comparison using two API snapshots.",
      "Design a comparison that explains what each field means inline.",
    ],
  },
  {
    tags: ["search", "gallery"],
    prompts: [
      "Prototype a search-and-discover flow with a polished empty state and real results.",
      "Build a search UI where the zero-results state is as good as the hits.",
      "Design typeahead that queries a live endpoint on every keystroke.",
      "Create a discovery feed that surfaces unexpected records from the API.",
      "Prototype search with filters, sort, and one delightful detail in the results.",
      "Build a browse experience for people who do not know what to search for.",
      "Design a search results card with one-click jump to the raw JSON.",
      "Create a tag-based explorer built from fields in the response.",
      "Prototype search that saves recent queries locally.",
      "Build a 'surprise me' button that pulls a random valid record.",
    ],
  },
  {
    tags: ["culture", "education", "media"],
    prompts: [
      "Tell a data story in three cards — hook, evidence, takeaway.",
      "Design a three-beat narrative entirely from live API responses.",
      "Build a story scroll where each section cites a different endpoint.",
      "Create a card stack that teaches one concept using real records.",
      "Prototype a story format your team would read on a phone.",
      "Design a visual essay with pull quotes from the data.",
      "Build a three-slide deck generated from today's dataset.",
      "Create a story template teammates can reuse with new APIs.",
      "Prototype a narrative that links evidence to source URLs.",
      "Design a story with one chart, one table, and one plain-language takeaway.",
    ],
  },
  {
    tags: ["fun", "collections", "media"],
    prompts: [
      "Turn the dataset into a lightweight game or quiz using real API data.",
      "Build a sixty-second game that still teaches something about the fields.",
      "Design a trivia round where every answer comes from the API.",
      "Create a collection game — gather items that match a hidden rule.",
      "Prototype a swipe-left/swipe-right game on live records.",
      "Build a guessing game using obscured fields from real responses.",
      "Design a daily challenge mode tied to the current dataset.",
      "Create a leaderboard based on API-derived scores, not fake points.",
      "Prototype a playful onboarding that introduces the schema through play.",
      "Build a mini-game someone would replay during a coffee break.",
    ],
  },
  {
    tags: ["media", "trending", "fun"],
    prompts: [
      "Design something worth sharing — a snapshot, card, or link your team would actually post.",
      "Build a share card generated from one live API record.",
      "Create an exportable image or link preview from the dataset.",
      "Prototype a one-click 'post to Slack' summary of today's find.",
      "Design a shareable report that fits in a single screenshot.",
      "Build a meme generator powered by real API text fields.",
      "Create a weekly recap card from aggregated public data.",
      "Prototype a branded snapshot with source attribution baked in.",
      "Design a share flow that includes the endpoint for transparency.",
      "Build something viral-internal — fun enough to pass around the team.",
    ],
  },
  {
    tags: ["real-time", "transit", "geo"],
    prompts: [
      "Build a live monitor that feels current the moment the page loads.",
      "Design a real-time ticker fed directly from a public endpoint.",
      "Create a 'right now' view with a visible last-updated timestamp.",
      "Prototype a refresh button that re-fetches and animates the delta.",
      "Build a pulse view for data that changes minute to minute.",
      "Design a live board optimized for a wall display or TV.",
      "Create a status strip that shows the latest value for three key fields.",
      "Prototype auto-refresh with graceful loading between polls.",
      "Build a commute-style glanceable UI from live transit or weather data.",
      "Design a real-time view that still works when the API is slow.",
    ],
  },
  {
    tags: ["ranking", "trending", "comparison"],
    prompts: [
      "Build a leaderboard that ranks records by a field that actually matters.",
      "Design a top-ten list with inline context from the API.",
      "Create a ranking view that explains how scores are calculated.",
      "Prototype a 'movers' list — who rose or fell since yesterday.",
      "Build a hall-of-fame for outliers in the dataset.",
      "Design a sortable ranking with one hero stat up top.",
      "Create a podium view for the top three API records.",
      "Prototype a ranking export as CSV from live JSON.",
      "Build a debate-starter: rank something unexpected from the data.",
      "Design a leaderboard that links each row to full details.",
    ],
  },
  {
    tags: ["search", "education", "science"],
    prompts: [
      "Design an explorer that rewards curiosity — every click opens a new question.",
      "Build a rabbit-hole UI that chains API calls into a short journey.",
      "Create a 'related records' panel driven by shared fields.",
      "Prototype an explore mode with bookmarks for interesting finds.",
      "Design a museum-style walkthrough of records from the dataset.",
      "Build a field glossary generated from the schema you discover.",
      "Create an explorer with random entry points into the data.",
      "Prototype a graph-lite view of how entities connect.",
      "Design an explore screen for someone new to this API.",
      "Build a curiosity button that always lands on a valid record.",
    ],
  },
  {
    tags: ["charts", "comparison"],
    prompts: [
      "Use one chart maximum — let layout and type carry the insight.",
      "Build a chart that answers one question, not twelve.",
      "Design a single visualization with a sentence that interprets it.",
      "Prototype a bar or line view with every bar linked to source data.",
      "Create a minimalist chart with a bold headline takeaway.",
      "Build a comparison chart that works without a legend.",
      "Design a sparkline gallery — many small trends, one page.",
      "Prototype a chart with accessible color and plain-language labels.",
      "Create a chart that degrades gracefully on mobile.",
      "Build a chart whose tooltip teaches what the field means.",
    ],
  },
  {
    tags: ["search", "health", "alerts"],
    prompts: [
      "Build a filter panel that slices the dataset without losing context.",
      "Design faceted search using fields discovered in the API response.",
      "Create a slice-and-dice view with reversible filters.",
      "Prototype a filter chip bar that updates counts live.",
      "Build a query builder for non-technical teammates.",
      "Design filters that show how many records match before you apply.",
      "Create a saved-filter preset for a common team question.",
      "Prototype a filter UI that exposes one advanced field creatively.",
      "Build a narrowing funnel from all records to one insight.",
      "Design a filter experience that never feels like a dead end.",
    ],
  },
  {
    tags: ["education", "culture"],
    prompts: [
      "Teach one concept from the dataset in a single scrolling screen.",
      "Build an explainer that uses real examples, not lorem ipsum.",
      "Design a 'learn the API' page that doubles as a useful tool.",
      "Create a guided tour through three representative records.",
      "Prototype an FAQ where every answer links to a live fetch.",
      "Build a glossary card for the five most important fields.",
      "Design a teachable moment — what would a new hire need to know?",
      "Create a compare-and-learn view for two sample entities.",
      "Prototype an onboarding that ends in a working mini-feature.",
      "Build an educational UI that still feels like a product, not a doc.",
    ],
  },
  {
    tags: ["graphs", "search", "education"],
    prompts: [
      "Connect related records across two fields in one cohesive view.",
      "Build a detail page that pulls linked data from a second endpoint.",
      "Design a master-detail layout fed by chained API calls.",
      "Prototype a graph of entities that share a common attribute.",
      "Create a network view with a readable default — not hairball chaos.",
      "Build a 'see also' panel based on shared tags or categories.",
      "Design a connection card — how does this record relate to that one?",
      "Prototype cross-linking between list items and a map or chart.",
      "Create a hub page that stitches three endpoints into one narrative.",
      "Build a connector UI that makes dependencies obvious.",
    ],
  },
  {
    tags: ["mobile", "comparison"],
    prompts: [
      "Simplify a complex dataset into one friendly first screen.",
      "Design an entry point that hides complexity until someone asks for it.",
      "Build a progressive disclosure flow over live API data.",
      "Prototype a welcome state that fetches something useful immediately.",
      "Create a single-call MVP that still feels complete.",
      "Design a calm UI for a noisy dataset.",
      "Build a 'start here' screen with one recommended record.",
      "Prototype a simplified mode vs. power mode toggle.",
      "Create an onboarding that completes in under thirty seconds.",
      "Design a first-run experience that works without instructions.",
    ],
  },
  {
    tags: ["fun", "media", "trending"],
    prompts: [
      "Find and highlight one delightful anomaly in today's data.",
      "Build a surprise screen — the record nobody expected to see.",
      "Design a 'weird but true' card from a real API response.",
      "Prototype a daily oddity generator from valid records.",
      "Create a highlight reel of the five most interesting entries.",
      "Build a serendipity button with great empty and error states.",
      "Design a wow moment in the first three seconds of load.",
      "Prototype a celebration UI when a rare condition is met.",
      "Create a Easter-egg interaction tied to a real field value.",
      "Build something that makes the team smile and learn something.",
    ],
  },
  {
    tags: ["social", "share", "comparison"],
    prompts: [
      "Design for a team ritual — a prompt everyone can riff on together.",
      "Build a collab view where two people compare picks side by side.",
      "Create a voting UI on which record should win today.",
      "Prototype a handoff link that preserves the exact API state.",
      "Design a comment-ready summary card for Slack threads.",
      "Build a pair exercise: same data, two different takes.",
      "Create a team board of favorite finds from the dataset.",
      "Prototype a daily standup slide from live public data.",
      "Design a shared canvas for sketching on top of real records.",
      "Build something that sparks a five-minute team jam.",
    ],
  },
];

const CURATED_SOURCES = [
  {
    id: "open-meteo",
    name: "Open-Meteo",
    category: "Weather",
    description: "Free weather forecasts and historical climate data for any coordinates.",
    baseUrl: "https://api.open-meteo.com",
    docsUrl: "https://open-meteo.com/en/docs",
    auth: "none",
    exampleEndpoint:
      "https://api.open-meteo.com/v1/forecast?latitude=40.71&longitude=-74.01&current=temperature_2m,precipitation",
    sampleFields: ["temperature_2m", "precipitation", "wind_speed_10m"],
    tags: ["geo", "time-series", "maps"],
  },
  {
    id: "rest-countries",
    name: "REST Countries",
    category: "Geography",
    description: "Country metadata — flags, borders, currencies, languages, and population.",
    baseUrl: "https://restcountries.com",
    docsUrl: "https://restcountries.com/",
    auth: "none",
    exampleEndpoint: "https://restcountries.com/v3.1/region/europe?fields=name,capital,population,flags",
    sampleFields: ["name", "capital", "population", "borders"],
    tags: ["geo", "comparison", "education"],
  },
  {
    id: "usgs-earthquakes",
    name: "USGS Earthquake Catalog",
    category: "Natural events",
    description: "Real-time and historical earthquake events worldwide.",
    baseUrl: "https://earthquake.usgs.gov",
    docsUrl: "https://earthquake.usgs.gov/fdsnws/event/1/",
    auth: "none",
    exampleEndpoint: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson",
    sampleFields: ["mag", "place", "time", "geometry"],
    tags: ["geo", "maps", "alerts", "time-series"],
  },
  {
    id: "open-library",
    name: "Open Library",
    category: "Books",
    description: "Book covers, authors, editions, and reading lists.",
    baseUrl: "https://openlibrary.org",
    docsUrl: "https://openlibrary.org/developers/api",
    auth: "none",
    exampleEndpoint: "https://openlibrary.org/search.json?q=climate&limit=10",
    sampleFields: ["title", "author_name", "first_publish_year"],
    tags: ["search", "media", "education"],
  },
  {
    id: "open-food-facts",
    name: "Open Food Facts",
    category: "Food",
    description: "Crowdsourced nutrition, ingredients, and packaging data for food products.",
    baseUrl: "https://world.openfoodfacts.org",
    docsUrl: "https://openfoodfacts.github.io/openfoodfacts-server/api/",
    auth: "none",
    exampleEndpoint:
      "https://world.openfoodfacts.org/cgi/search.pl?search_terms=oat&json=1&page_size=5",
    sampleFields: ["product_name", "nutriments", "brands"],
    tags: ["health", "comparison", "search"],
  },
  {
    id: "coingecko",
    name: "CoinGecko",
    category: "Markets",
    description: "Crypto prices, market caps, and trending tokens.",
    baseUrl: "https://api.coingecko.com",
    docsUrl: "https://docs.coingecko.com/",
    auth: "none",
    exampleEndpoint:
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10",
    sampleFields: ["name", "current_price", "market_cap"],
    tags: ["finance", "charts", "trending"],
  },
  {
    id: "pokeapi",
    name: "PokéAPI",
    category: "Games",
    description: "Pokémon species, types, abilities, and evolution chains.",
    baseUrl: "https://pokeapi.co",
    docsUrl: "https://pokeapi.co/docs/v2",
    auth: "none",
    exampleEndpoint: "https://pokeapi.co/api/v2/pokemon?limit=20",
    sampleFields: ["name", "types", "abilities"],
    tags: ["fun", "comparison", "collections"],
  },
  {
    id: "iss-location",
    name: "Open Notify — ISS",
    category: "Space",
    description: "Current ISS coordinates and pass predictions.",
    baseUrl: "http://api.open-notify.org",
    docsUrl: "http://open-notify.org/Open-Notify-API/",
    auth: "none",
    exampleEndpoint: "http://api.open-notify.org/iss-now.json",
    sampleFields: ["latitude", "longitude", "timestamp"],
    tags: ["geo", "maps", "real-time"],
  },
  {
    id: "met-museum",
    name: "Metropolitan Museum of Art",
    category: "Art",
    description: "Open access collection metadata and images from The Met.",
    baseUrl: "https://collectionapi.metmuseum.org",
    docsUrl: "https://metmuseum.github.io/",
    auth: "none",
    exampleEndpoint:
      "https://collectionapi.metmuseum.org/public/collection/v1/search?q=sunflower&hasImages=true",
    sampleFields: ["title", "artistDisplayName", "objectDate"],
    tags: ["culture", "search", "gallery"],
  },
  {
    id: "art-institute",
    name: "Art Institute of Chicago",
    category: "Art",
    description: "Artworks, artists, and exhibition data with IIIF image support.",
    baseUrl: "https://api.artic.edu",
    docsUrl: "https://api.artic.edu/docs/",
    auth: "none",
    exampleEndpoint: "https://api.artic.edu/api/v1/artworks/search?q=water&limit=5",
    sampleFields: ["title", "artist_title", "date_display"],
    tags: ["culture", "search", "gallery"],
  },
  {
    id: "open-brewery",
    name: "Open Brewery DB",
    category: "Food & drink",
    description: "Breweries by city, state, and type.",
    baseUrl: "https://api.openbrewerydb.org",
    docsUrl: "https://www.openbrewerydb.org/documentation",
    auth: "none",
    exampleEndpoint: "https://api.openbrewerydb.org/v1/breweries?by_city=portland&per_page=10",
    sampleFields: ["name", "brewery_type", "city"],
    tags: ["geo", "maps", "local"],
  },
  {
    id: "gbif",
    name: "GBIF",
    category: "Biodiversity",
    description: "Species occurrence records worldwide.",
    baseUrl: "https://api.gbif.org",
    docsUrl: "https://www.gbif.org/developer/summary",
    auth: "none",
    exampleEndpoint:
      "https://api.gbif.org/v1/occurrence/search?country=US&limit=10&hasCoordinate=true",
    sampleFields: ["species", "decimalLatitude", "decimalLongitude"],
    tags: ["geo", "maps", "science"],
  },
  {
    id: "hn-firebase",
    name: "Hacker News",
    category: "News",
    description: "Top stories, comments, and user profiles.",
    baseUrl: "https://hacker-news.firebaseio.com",
    docsUrl: "https://github.com/HackerNews/API",
    auth: "none",
    exampleEndpoint: "https://hacker-news.firebaseio.com/v0/topstories.json",
    sampleFields: ["title", "url", "score"],
    tags: ["social", "trending", "ranking"],
  },
  {
    id: "openfda",
    name: "openFDA",
    category: "Health",
    description: "FDA drug labels, adverse events, and food recall data.",
    baseUrl: "https://api.fda.gov",
    docsUrl: "https://open.fda.gov/apis/",
    auth: "none",
    exampleEndpoint:
      "https://api.fda.gov/food/enforcement.json?limit=5&search=classification:Class+I",
    sampleFields: ["product_description", "reason_for_recall", "report_date"],
    tags: ["health", "alerts", "search"],
  },
  {
    id: "wikidata",
    name: "Wikidata",
    category: "Knowledge",
    description: "Structured facts about people, places, and things.",
    baseUrl: "https://www.wikidata.org",
    docsUrl: "https://www.wikidata.org/wiki/Wikidata:Data_access",
    auth: "none",
    exampleEndpoint:
      "https://www.wikidata.org/w/api.php?action=wbsearchentities&search=marie+curie&language=en&format=json",
    sampleFields: ["label", "description", "aliases"],
    tags: ["search", "education", "graphs"],
  },
  {
    id: "nasa-donki",
    name: "NASA DONKI",
    category: "Space weather",
    description: "Solar flares, CMEs, and geomagnetic storms.",
    baseUrl: "https://api.nasa.gov",
    docsUrl: "https://api.nasa.gov/",
    auth: "free-key",
    exampleEndpoint: "https://api.nasa.gov/DONKI/FLR?startDate=2026-01-01&api_key=DEMO_KEY",
    sampleFields: ["classType", "beginTime", "sourceLocation"],
    tags: ["science", "time-series", "alerts"],
  },
  {
    id: "city-bikes",
    name: "CityBikes",
    category: "Transit",
    description: "Bike-share station locations and availability.",
    baseUrl: "https://api.citybik.es",
    docsUrl: "https://api.citybik.es/v2/",
    auth: "none",
    exampleEndpoint: "https://api.citybik.es/v2/networks",
    sampleFields: ["name", "latitude", "longitude", "stations"],
    tags: ["geo", "maps", "real-time", "transit"],
  },
  {
    id: "dog-ceo",
    name: "Dog CEO",
    category: "Fun",
    description: "Random dog images by breed.",
    baseUrl: "https://dog.ceo",
    docsUrl: "https://dog.ceo/dog-api/documentation",
    auth: "none",
    exampleEndpoint: "https://dog.ceo/api/breeds/list/all",
    sampleFields: ["message", "status", "breeds"],
    tags: ["fun", "media", "collections"],
  },
  {
    id: "us-census",
    name: "US Census Bureau",
    category: "Demographics",
    description: "Population, income, and housing stats by state and county.",
    baseUrl: "https://api.census.gov",
    docsUrl: "https://www.census.gov/data/developers/data-sets.html",
    auth: "free-key",
    exampleEndpoint:
      "https://api.census.gov/data/2021/acs/acs1/profile?get=NAME,B01003_001E&for=state:*",
    sampleFields: ["NAME", "B01003_001E", "state"],
    tags: ["geo", "charts", "comparison"],
  },
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function apiOrigin(exampleEndpoint) {
  try {
    return new URL(exampleEndpoint).origin;
  } catch {
    return exampleEndpoint;
  }
}

function mapExtraRow(row, index) {
  const [name, category, docsUrl, auth, exampleEndpoint, ...tags] = row;
  const baseId = slugify(name) || `api-${index}`;
  return {
    id: baseId,
    name,
    category,
    description: `Public ${category.toLowerCase()} API for prototyping with real data.`,
    baseUrl: apiOrigin(exampleEndpoint),
    docsUrl,
    auth,
    exampleEndpoint,
    sampleFields: ["id", "name", "data"],
    tags,
  };
}

function buildPrompts() {
  const prompts = [];
  for (const archetype of PROMPT_ARCHETYPES) {
    archetype.prompts.forEach((prompt, index) => {
      prompts.push({
        id: `${archetype.tags[0]}-${String(index + 1).padStart(2, "0")}`,
        prompt,
        tags: archetype.tags,
      });
    });
  }
  return prompts;
}

function buildSources() {
  const byId = new Map(CURATED_SOURCES.map((source) => [source.id, source]));

  for (const [index, row] of EXTRA_APIS.entries()) {
    const mapped = mapExtraRow(row, index);
    let id = mapped.id;
    let suffix = 2;
    while (byId.has(id)) {
      id = `${mapped.id}-${suffix}`;
      suffix += 1;
    }
    mapped.id = id;
    byId.set(id, mapped);
  }

  return [...byId.values()].slice(0, 200);
}

/** Patch known-dead or misconfigured endpoints after catalog assembly. */
function applySourceFixes(sources) {
  const fixes = {
    animechan: {
      exampleEndpoint: "https://animechan.xyz/api/random",
      docsUrl: "https://animechan.xyz/",
      baseUrl: "https://animechan.xyz",
    },
    "bored-api": {
      name: "Official Joke API",
      exampleEndpoint: "https://official-joke-api.appspot.com/random_joke",
      docsUrl: "https://official-joke-api.appspot.com/",
      baseUrl: "https://official-joke-api.appspot.com",
      description: "Random programming jokes — a lighthearted JSON API for quick UI prototypes.",
    },
    quotable: {
      exampleEndpoint: "https://dummyjson.com/quotes/random?limit=1",
      docsUrl: "https://dummyjson.com/docs/quotes",
      baseUrl: "https://dummyjson.com",
    },
    "open-aq": {
      exampleEndpoint: "https://api.openaq.org/v3/locations?limit=5",
      baseUrl: "https://api.openaq.org",
    },
    "openaq-countries": {
      exampleEndpoint: "https://api.openaq.org/v3/locations?limit=10",
      baseUrl: "https://api.openaq.org",
    },
    "open-civic-data": {
      name: "Open States",
      exampleEndpoint: "https://v3.openstates.org/jurisdictions?per_page=5",
      docsUrl: "https://docs.openstates.org/",
      baseUrl: "https://v3.openstates.org",
      description: "US state legislature bills, people, and jurisdictions from Open States.",
    },
    ballotpedia: {
      name: "Open States Bills",
      exampleEndpoint:
        "https://v3.openstates.org/bills?jurisdiction=ocd-jurisdiction/country:us/state:ca&per_page=5",
      docsUrl: "https://docs.openstates.org/",
      baseUrl: "https://v3.openstates.org",
      description: "Recent state bills and metadata for civic prototyping.",
    },
    coindesk: {
      exampleEndpoint: "https://api.blockchain.info/ticker",
      docsUrl: "https://www.blockchain.com/api/blockchain_api",
      baseUrl: "https://api.blockchain.info",
    },
    "open-targets": {
      exampleEndpoint: "https://disease.sh/v3/covid-19/countries/usa",
      docsUrl: "https://disease.sh/docs/",
      baseUrl: "https://disease.sh",
      description: "Public health statistics useful for charts and trend explorers.",
    },
    "carbon-interface": {
      exampleEndpoint: "https://api.websitecarbon.com/site?url=https://example.com",
      docsUrl: "https://api.websitecarbon.com/docs/",
      baseUrl: "https://api.websitecarbon.com",
      description: "Estimate the carbon footprint of a web page from a URL.",
    },
    climatiq: {
      exampleEndpoint: "https://api.websitecarbon.com/site?url=https://developer.mozilla.org",
      docsUrl: "https://api.websitecarbon.com/docs/",
      baseUrl: "https://api.websitecarbon.com",
      auth: "none",
      description: "Environmental impact estimates for digital experiences.",
    },
    "product-hunt": {
      exampleEndpoint: "https://api.github.com/search/repositories?q=product+hunt&sort=stars&per_page=5",
      docsUrl: "https://docs.github.com/en/rest/search",
      baseUrl: "https://api.github.com",
      auth: "none",
      description: "Trending open-source repos related to product launches.",
    },
    bls: {
      exampleEndpoint:
        "https://api.worldbank.org/v2/country/US/indicator/SL.UEM.TOTL.ZS?format=json&per_page=5",
      docsUrl: "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392",
      baseUrl: "https://api.worldbank.org",
      auth: "none",
      description: "Unemployment and labor indicators for economic dashboards.",
    },
    "yes-no-maybe": {
      exampleEndpoint: "https://yesno.wtf/api",
      baseUrl: "https://yesno.wtf",
    },
    coincap: {
      exampleEndpoint: "https://api.coincap.io/v2/assets?limit=5",
      baseUrl: "https://api.coincap.io",
    },
    "sec-edgar": {
      exampleEndpoint: "https://data.sec.gov/submissions/CIK0000320193.json",
      baseUrl: "https://data.sec.gov",
    },
    reqres: {
      exampleEndpoint: "https://reqres.in/api/users?page=1",
      baseUrl: "https://reqres.in",
    },
    "open-charge-map": {
      exampleEndpoint: "https://api.openchargemap.io/v3/poi/?output=json&maxresults=5&countrycode=US",
      baseUrl: "https://api.openchargemap.io",
    },
    "colorado-data": {
      exampleEndpoint: "https://data.colorado.gov/resource/4ykn-tg5h.json?$limit=5",
      baseUrl: "https://data.colorado.gov",
    },
  };

  return sources.map((source) => {
    const patch = fixes[source.id];
    return patch ? { ...source, ...patch } : source;
  });
}

function buildSourcesWithFixes() {
  return applySourceFixes(buildSources());
}

function buildCombos(sources) {
  const combos = [];
  const used = new Set();

  const curatedPairs = [
    ["open-meteo", "rest-countries", "Layer weather onto country context for trips and events."],
    ["usgs-earthquakes", "rest-countries", "Plot seismic activity against country borders."],
    ["met-museum", "art-institute", "Compare open-access collections across two museum APIs."],
    ["open-food-facts", "open-brewery", "Nutrition data meets local venue discovery."],
    ["iss-location", "nasa-donki", "What's overhead and what's coming from the sun."],
    ["gbif", "usgs-earthquakes", "Species observations and geological events on one map."],
    ["open-library", "wikidata", "Books plus structured facts for rich entity pages."],
    ["city-bikes", "open-meteo", "Bike-share availability with local weather."],
    ["openfda", "open-food-facts", "Recalls and product data for safety transparency."],
    ["rest-countries", "us-census", "Global country stats alongside US demographic depth."],
    ["coingecko", "hn-firebase", "Markets meet tech news for a finance-curious dashboard."],
    ["pokeapi", "dog-ceo", "Playful collections APIs for a lighthearted prototype."],
    ["open-meteo", "city-bikes", "Plan a ride with live weather and station data."],
    ["wikidata", "rest-countries", "Structured facts layered onto country profiles."],
    ["gbif", "open-meteo", "Species ranges with climate context."],
    ["art-institute", "wikidata", "Artworks enriched with linked entity facts."],
    ["open-library", "rest-countries", "Books and authors mapped to countries of origin."],
    ["usgs-earthquakes", "city-bikes", "Urban mobility during geological event windows."],
    ["openfda", "rest-countries", "Recall patterns across regions."],
    ["hn-firebase", "coingecko", "Tech discourse alongside token price moves."],
  ];

  for (const [a, b, reason] of curatedPairs) {
    if (!sources.find((s) => s.id === a) || !sources.find((s) => s.id === b)) continue;
    const id = `${a}__${b}`;
    if (used.has(id)) continue;
    used.add(id);
    combos.push({ id, sourceIds: [a, b], reason, tags: [] });
  }

  const pool = sources.filter((s) => s.auth === "none");
  for (let i = 0; i < pool.length && combos.length < 50; i++) {
    for (let j = i + 1; j < pool.length && combos.length < 50; j++) {
      const a = pool[i];
      const b = pool[j];
      const sharedTags = a.tags.filter((tag) => b.tags.includes(tag));
      if (sharedTags.length === 0) continue;
      const id = `${a.id}__${b.id}`;
      if (used.has(id)) continue;
      used.add(id);
      combos.push({
        id,
        sourceIds: [a.id, b.id],
        reason: `Pair ${a.name} with ${b.name} to explore ${sharedTags[0]} from two angles.`,
        tags: sharedTags,
      });
    }
  }

  return combos.slice(0, 50);
}

function main() {
  mkdirSync(catalogDir, { recursive: true });

  const prompts = buildPrompts();
  const sources = buildSourcesWithFixes();
  const bundles = buildCombos(sources);

  if (prompts.length !== 200) throw new Error(`Expected 200 prompts, got ${prompts.length}`);
  if (sources.length < 200) throw new Error(`Expected 200 sources, got ${sources.length}`);
  if (bundles.length < 50) throw new Error(`Expected 50 combos, got ${bundles.length}`);

  writeFileSync(join(catalogDir, "prompts.json"), JSON.stringify(prompts, null, 2));
  writeFileSync(join(catalogDir, "sources.json"), JSON.stringify(sources.slice(0, 200), null, 2));
  writeFileSync(join(catalogDir, "bundles.json"), JSON.stringify(bundles.slice(0, 50), null, 2));

  const distCatalog = join(__dirname, "../dist/data/catalog");
  if (existsSync(join(__dirname, "../dist/data"))) {
    mkdirSync(distCatalog, { recursive: true });
    cpSync(catalogDir, distCatalog, { recursive: true });
  }

  console.log(`Seeded catalog: ${prompts.length} prompts, ${sources.length} sources, ${bundles.length} combos`);
}

main();
