#!/usr/bin/env node
import { writeFileSync, mkdirSync, cpSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { EXTRA_APIS } from "./extra-apis.mjs";
import { enrichSource } from "./source-summaries.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const catalogDir = join(__dirname, "../src/data/catalog");

const PROMPT_ARCHETYPES = [
  {
    tags: ["map", "geo"],
    prompts: [
      "Make a map that shows at a glance where things cluster and where they don't.",
      "Build a map that answers one simple question about places in today's data.",
      "Design a screen with a list on one side and a map on the other so people can explore locations.",
      "Show how crowded, spread out, or far apart things are — all on one map.",
      "Tell a place-based story: what feels different from one region to the next?",
      "Help someone spot the odd one out on a map — the place that doesn't fit the pattern.",
      "Create a map people can pan and zoom, with one clear takeaway when they land.",
      "Layer two ideas on one map so the connection between them is obvious.",
      "Sketch a map view that makes borders, routes, or nearness easy to understand.",
      "Turn locations from today's data into something a teammate would actually open and use.",
    ],
  },
  {
    tags: ["charts", "time-series", "comparison"],
    prompts: [
      "Build one screen that surfaces the most surprising pattern in today's numbers.",
      "Design a single view that answers one big question in under ten seconds.",
      "Compare what's happening now with what's normal — using real numbers, not made-up ones.",
      "Make a summary screen where the words do as much work as the charts.",
      "Show a handful of key numbers from today's data — all real, nothing fake.",
      "Highlight one weird or noteworthy thing in the data worth a closer look.",
      "Create a summary where every number clearly ties back to where it came from.",
      "Make a trend so clear that nobody can misread what it's saying.",
      "Design a daily briefing screen your team could check every morning.",
      "Build a simple stats screen for someone who usually finds dashboards overwhelming.",
    ],
  },
  {
    tags: ["search", "comparison", "geo"],
    prompts: [
      "Build a small tool that helps someone pick, compare, or narrow down real options.",
      "Start with lots of choices and end with one clear recommendation.",
      "Design a step-by-step flow with smart defaults and a satisfying final answer.",
      "Compare two or more options side by side so the tradeoffs are obvious.",
      "Walk someone through a few questions and land on a suggestion backed by real data.",
      "Answer 'which one should I choose?' using today's actual records.",
      "Put two things next to each other — cities, products, whatever fits — and make differences pop.",
      "Create a short quiz that ends in a data-backed suggestion.",
      "Help people sort and filter while gently explaining what each label means.",
      "Build something a teammate could use to decide in one sitting.",
    ],
  },
  {
    tags: ["time-series", "trending"],
    prompts: [
      "Follow one thread through time and show how it changes.",
      "Build a timeline that shows momentum — not every single point at once.",
      "Highlight when something shifted and why that moment might matter.",
      "Start with a small trend line and let people dig deeper if they want.",
      "Tell a story across time in three moments that matter most.",
      "Add a slider that updates the whole screen as people move through dates.",
      "Answer 'what changed this week?' using dated records from today's source.",
      "Link events on a timeline back to the original records they came from.",
      "Design a trend card that works on its own in Slack or email.",
      "Compare two trends on the same timeline so the relationship is easy to see.",
    ],
  },
  {
    tags: ["alerts", "real-time"],
    prompts: [
      "Sketch an alert you'd actually want when something crosses a line that matters to you.",
      "Design a notification that shows what triggered it and what to do next.",
      "Build a simple green / yellow / red monitor using live values from today's data.",
      "Preview what the alert would say right now if you turned it on today.",
      "Let people set a threshold using real fields from the dataset.",
      "Create a watchlist that pings you when something unusual shows up.",
      "Build a status page powered by the latest values from today's source.",
      "Design an alert card with enough context to be useful — not just noise.",
      "Make a simple rule builder: when this happens, send this message.",
      "Group related signals into one digest instead of ten separate pings.",
    ],
  },
  {
    tags: ["comparison", "education"],
    prompts: [
      "Compare two things from the data side by side.",
      "Make similarities and gaps easy to scan in a few seconds.",
      "Build a comparison table where every cell links to where that fact came from.",
      "Create a 'this vs. that' screen — two cities, products, species, artworks, whatever fits.",
      "Design a comparison that works on a phone with a swipe between the two.",
      "Show how A stacks up against B on one metric that matters.",
      "Build a split screen where both sides update from live data.",
      "Make a comparison worth sharing with your team.",
      "Compare how things looked before and after using two snapshots from the data.",
      "Explain what each label means right where people are comparing.",
    ],
  },
  {
    tags: ["search", "gallery"],
    prompts: [
      "Build search with a friendly empty state and satisfying real results.",
      "Make the 'no results' screen as thoughtful as the hits.",
      "Show suggestions as people type, pulling from live data.",
      "Create a discovery feed that surfaces surprising finds from today's source.",
      "Combine search, filters, and sort — plus one small delightful detail in the results.",
      "Help people browse when they don't know what to search for yet.",
      "Design result cards with an easy way to see the full record behind each hit.",
      "Let people explore by tags or categories from the data.",
      "Remember recent searches so people can pick up where they left off.",
      "Add a 'surprise me' button that pulls one random real record.",
    ],
  },
  {
    tags: ["culture", "education", "media"],
    prompts: [
      "Tell a story in three beats — hook, proof, takeaway.",
      "Build a three-part narrative entirely from real records in today's data.",
      "Create a scroll where each section introduces a new slice of the story.",
      "Use a stack of cards to teach one idea with real examples.",
      "Design a story format that reads well on a phone.",
      "Write a short visual essay with pull quotes taken from the data.",
      "Turn today's dataset into a three-slide deck your team could present.",
      "Make a story template teammates can reuse with new sources later.",
      "Link every claim in the story back to where the fact came from.",
      "Combine one chart, one table, and one plain-language takeaway.",
    ],
  },
  {
    tags: ["fun", "collections", "media"],
    prompts: [
      "Turn today's data into a light game or quiz — still using real records.",
      "Build a sixty-second game that teaches something about what's in the data.",
      "Design a trivia round where every answer comes from today's source.",
      "Create a collection game: gather items that match a hidden rule.",
      "Build a swipe-left / swipe-right game using live records.",
      "Build a guessing game using clues from real fields — nothing made up.",
      "Add a daily challenge mode tied to whatever today's data offers.",
      "Make a leaderboard from scores you can actually calculate from the data.",
      "Use play to introduce what's in the dataset — fun first, facts second.",
      "Build a mini-game someone might replay on a coffee break.",
    ],
  },
  {
    tags: ["media", "trending", "fun"],
    prompts: [
      "Design something worth sharing — a card or link your team would actually post.",
      "Generate a shareable card from one real record in today's data.",
      "Create an image or link preview people would pass around.",
      "Build a one-click summary formatted for Slack.",
      "Design a shareable report that fits in a single screenshot.",
      "Have fun with text from the data — quotes, labels, captions — in something shareable.",
      "Create a weekly recap card from public data.",
      "Make a branded snapshot that credits the source.",
      "Include a link to where the facts came from so people can verify.",
      "Build something fun enough to pass around the team — but still grounded in real data.",
    ],
  },
  {
    tags: ["real-time", "transit", "geo"],
    prompts: [
      "Build a live screen that feels current the moment it loads.",
      "Design a ticker fed directly from up-to-the-minute data.",
      "Show a 'right now' view with a clear 'last updated' time.",
      "Add a refresh button that updates the screen and shows what changed.",
      "Create a pulse view for data that shifts minute to minute.",
      "Design a board that would work on a wall display or TV.",
      "Show the latest value for three important things in a simple strip.",
      "Auto-refresh gracefully when new data arrives.",
      "Build a glanceable commute-style screen from live transit or weather data.",
      "Keep it useful even when the source is slow to respond.",
    ],
  },
  {
    tags: ["ranking", "trending", "comparison"],
    prompts: [
      "Rank records by something that actually matters — and show why.",
      "Design a top-ten list with enough context to understand each entry.",
      "Explain how the ranking is calculated in plain language.",
      "Show who rose or fell since yesterday — the movers list.",
      "Celebrate the outliers — the records that stand out from the pack.",
      "Build a sortable ranking with one hero stat up top.",
      "Create a podium view for the top three.",
      "Let people export the ranking as a simple spreadsheet.",
      "Rank something unexpected from the data and start a friendly debate.",
      "Link each row in the ranking to full details.",
    ],
  },
  {
    tags: ["search", "education", "science"],
    prompts: [
      "Reward curiosity — every click should open a new question worth asking.",
      "Chain a short journey through the data: one find leads to the next.",
      "Show related records that share something in common.",
      "Let people bookmark interesting finds as they explore.",
      "Design a walkthrough of records like a small museum tour.",
      "Build a simple glossary for the most important labels in the data.",
      "Offer random entry points for people who don't know where to start.",
      "Show how things connect without overwhelming people with complexity.",
      "Make an explore screen for someone who's never seen this data before.",
      "Add a button that always lands on something valid and interesting.",
    ],
  },
  {
    tags: ["charts", "comparison"],
    prompts: [
      "Use one chart only — let the layout and chart type carry the insight.",
      "Build a chart that answers one question, not twelve.",
      "Pair one visualization with a sentence that explains what it means.",
      "Make a bar or line chart where each mark links back to the underlying data.",
      "Keep the chart minimal and put the takeaway in a bold headline.",
      "Design a comparison chart that doesn't need a legend to understand.",
      "Show many small trends on one page — like a row of tiny line charts.",
      "Use color and labels anyone can read, no jargon required.",
      "Make sure the chart still works on a small phone screen.",
      "Use tooltips or hints that explain what each number means in everyday language.",
    ],
  },
  {
    tags: ["search", "health", "alerts"],
    prompts: [
      "Build filters that slice the data without losing the big picture.",
      "Let people narrow down by categories they can see in the results.",
      "Create a view where filters can be added and removed easily.",
      "Show filter chips that update counts as people tap them.",
      "Design filters a non-technical teammate could use without help.",
      "Show how many results match before someone applies a filter.",
      "Save a filter preset for a question your team asks all the time.",
      "Expose one advanced filter in a creative, approachable way.",
      "Guide people from 'everything' down to one clear insight.",
      "Make sure filtering never feels like hitting a dead end.",
    ],
  },
  {
    tags: ["education", "culture"],
    prompts: [
      "Teach one idea from the data on a single scrolling screen.",
      "Use real examples from today's source — no placeholder text.",
      "Build a page that's both a learning tool and something useful on its own.",
      "Walk through three representative records like a guided tour.",
      "Create an FAQ where every answer points to a real example.",
      "Explain the five most important fields in simple language.",
      "Ask: what would a new teammate need to know on day one?",
      "Compare two sample entries as a way to learn what's in the data.",
      "End getting started with a small feature that actually works.",
      "Make it educational but feel like a product — not a manual.",
    ],
  },
  {
    tags: ["graphs", "search", "education"],
    prompts: [
      "Connect related records across two ideas in one cohesive view.",
      "Build a detail page that pulls in linked information from a second source.",
      "Design a list-and-detail layout where selecting one item reveals more.",
      "Show how entities relate when they share a common trait.",
      "Draw connections between items — but keep the default view readable.",
      "Add a 'see also' section based on shared tags or categories.",
      "Explain how one record relates to another in a simple connection card.",
      "Link list items to a map or chart so the relationship clicks.",
      "Stitch two or three sources into one coherent story on a hub page.",
      "Make dependencies and relationships obvious at a glance.",
    ],
  },
  {
    tags: ["mobile", "comparison"],
    prompts: [
      "Boil a complex dataset down to one friendly first screen.",
      "Hide complexity until someone asks for more detail.",
      "Reveal information step by step as people go deeper.",
      "Show something useful immediately on the welcome screen.",
      "Ship a small first version that still feels complete.",
      "Calm a noisy dataset with a clean, simple layout.",
      "Start with one recommended record — a clear 'begin here.'",
      "Offer a simple mode and a power mode for different comfort levels.",
      "Finish getting started in under thirty seconds.",
      "Make the first run work without instructions.",
    ],
  },
  {
    tags: ["fun", "media", "trending"],
    prompts: [
      "Find one delightful surprise in today's data and put it front and center.",
      "Build a 'you won't expect this' screen from a real record.",
      "Design a 'weird but true' card sourced from today's data.",
      "Generate a daily oddity from valid records — something worth a smile.",
      "Curate the five most interesting entries into a highlight reel.",
      "Add a serendipity button with great empty and error states.",
      "Create a wow moment in the first three seconds after load.",
      "Celebrate when a rare condition shows up in the data.",
      "Hide a small Easter egg tied to a real value in the dataset.",
      "Make the team smile and learn something at the same time.",
    ],
  },
  {
    tags: ["social", "share", "comparison"],
    prompts: [
      "Design for a team ritual — something everyone can riff on together.",
      "Let two people compare their picks side by side.",
      "Vote on which record should win today.",
      "Share a link that preserves exactly what you're looking at.",
      "Create a summary card ready to paste into Slack.",
      "Run a pair exercise: same data, two different interpretations.",
      "Build a team board of favorite finds from the dataset.",
      "Make one slide for a daily standup from live public data.",
      "Sketch on top of real records on a shared canvas.",
      "Spark a five-minute team jam around today's prompt.",
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
    "world-bank": {
      description:
        "World Bank Open Data — development, poverty, population, and economic indicators by country.",
      sampleFields: ["country", "countryiso3code", "indicator", "value", "date"],
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
  return applySourceFixes(buildSources()).map(enrichSource);
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
