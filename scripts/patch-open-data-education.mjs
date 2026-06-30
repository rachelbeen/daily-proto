#!/usr/bin/env node
/**
 * Add Education & Learning category and recategorize / add kid-friendly APIs.
 * Run: node scripts/patch-open-data-education.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const apisPath = join(root, "src/data/open-data-index/apis.json");
const endpointsPath = join(root, "src/data/open-data-endpoints.json");

const EDU = {
  key: "education",
  label: "Education & Learning",
  color: "#2563EB",
};

/** Existing index entries to move into Education. */
const MOVE_TO_EDUCATION = new Set([
  "open-library",
  "gutendex",
  "datamuse",
  "free-dictionary",
  "poetrydb",
  "wikipedia",
  "wikidata-sparql",
  "open-trivia-db",
  "numbers-api",
  "quotable",
  "rest-countries",
  "date-nager",
  "tatoeba",
  "wiktionary",
  "openalex",
  "dummyjson",
  "jsonplaceholder",
  "crossref",
  "clinicaltrials-gov",
]);

/** Brand-new education APIs for the index. */
const NEW_EDUCATION_SOURCES = [
  {
    id: "openverse",
    name: "Openverse",
    auth: "none",
    description:
      "Search 700M+ Creative Commons images and audio — safe media for classroom projects.",
    endpoint: "api.openverse.org/v1",
    docs: "https://api.openverse.org/v1/",
    tags: ["images", "audio", "creative-commons", "classroom"],
  },
  {
    id: "conceptnet",
    name: "ConceptNet",
    auth: "none",
    description:
      "Common-sense knowledge graph — word meanings and relations for vocabulary and logic games.",
    endpoint: "api.conceptnet.io",
    docs: "https://github.com/commonsense/conceptnet5/wiki/API",
    tags: ["words", "knowledge", "graph", "vocabulary"],
  },
  {
    id: "internet-archive",
    name: "Internet Archive",
    auth: "none",
    description:
      "Search millions of free books, films, courses, and software for self-paced learning.",
    endpoint: "archive.org/advancedsearch.php",
    docs: "https://archive.org/services/docs/api/advancedsearch.html",
    tags: ["books", "courses", "archive", "oer"],
  },
  {
    id: "open-notify-people",
    name: "People in Space",
    auth: "none",
    description:
      "Who is aboard the ISS right now — great hook for space and STEM lessons.",
    endpoint: "api.open-notify.org/astros.json",
    docs: "http://open-notify.org/Open-Notify-API/People-In-Space/",
    tags: ["space", "astronauts", "stem"],
  },
];

const DESCRIPTION_TWEAKS = {
  "open-library": "20M+ book records — build reading lists, author explorers, and library browsers.",
  gutendex: "70k+ free public-domain ebooks — reading apps and classroom libraries without paywalls.",
  "open-trivia-db": "Thousands of quiz questions by topic and difficulty — flashcards and classroom games.",
  "numbers-api": "Math and date trivia for any number — playful hooks for arithmetic and history lessons.",
  wikipedia: "Article summaries and images from the world's largest encyclopedia — research starters for any topic.",
  "wikidata-sparql": "Structured facts behind Wikipedia — biographies, timelines, and knowledge-graph explorers.",
  "rest-countries": "Country profiles with flags, maps, and populations — geography quizzes and culture apps.",
  inaturalist: "Citizen-science species observations — nature journals, biodiversity hunts, and field guides.",
  "iss-now-open-notify": "Live ISS coordinates — map the space station and connect to orbit lessons.",
  "launch-library-2": "Upcoming rocket launches worldwide — space-program calendars and STEM countdowns.",
  "nasa-eonet": "Open natural events (wildfires, storms, volcanoes) — current-events science dashboards.",
  "nasa-image-video-library": "Searchable NASA photos and videos — space and Earth science visual libraries.",
  "open-meteo": "Weather forecasts and climate data — charts for data literacy and earth science.",
  dummyjson: "Fake users, products, and posts — teach app design without touching real personal data.",
  jsonplaceholder: "Classic fake REST data — first APIs for students learning to wire up lists and forms.",
  pubchem: "Chemical compounds and structures from NIH — periodic-table explorers and chemistry lookups.",
  "open-states": "US state legislators and bills — civics projects on how government works.",
  "the-met-collection": "490k+ artworks with public-domain images — art history and visual culture lessons.",
  "smithsonian-open-access": "3M+ museum objects with CC0 images — history, science, and culture collections.",
  europeana: "50M+ heritage items from European museums and libraries — world history sourcebooks.",
  datamuse: "Rhymes, synonyms, and word associations — spelling bees, poetry tools, and word games.",
  "free-dictionary": "Definitions, phonetics, and examples — vocabulary builders for all ages.",
  poetrydb: "Thousands of public-domain poems — literature apps and close-reading prompts.",
  tatoeba: "Multilingual example sentences — language-learning flashcards and translation practice.",
  wiktionary: "Word definitions and etymologies across languages — deeper vocabulary than a simple dictionary.",
  openalex: "Open catalog of scholarly works — research skills and source evaluation for high school+.",
  "date-nager": "Public holidays by country and year — culture, geography, and calendar math.",
  gbif: "Global biodiversity species data — taxonomy trees and conservation explorers.",
  "open-food-facts": "Crowdsourced nutrition labels — label-reading, health, and data-comparison projects.",
  "exoplanet-archive":
    "Confirmed exoplanets with discovery dates and host stars — astronomy research for curious teens.",
  crossref:
    "Scholarly paper metadata — teach older students how to find and cite real research.",
  "clinicaltrials-gov":
    "Real clinical study records — health literacy and how medical research works.",
  "wikimedia-commons":
    "Free educational images, diagrams, and maps from Wikipedia's media library.",
};

const NEW_ENDPOINTS = {
  "open-library": "https://openlibrary.org/search.json?q=science&limit=10",
  "open-trivia-db": "https://opentdb.com/api.php?amount=10&type=multiple",
  "numbers-api": "http://numbersapi.com/42/math?json",
  poetrydb: "https://poetrydb.org/author/Shakespeare",
  datamuse: "https://api.datamuse.com/words?rel_rhy=learning&max=10",
  "wikidata-sparql":
    "https://query.wikidata.org/sparql?query=SELECT%20?item%20?itemLabel%20WHERE%20{?item%20wdt:P31%20wd:Q5.%20SERVICE%20wikibase:label%20{bd:serviceParam%20wikibase:language%20%22en%22.}}%20LIMIT%2010&format=json",
  "rest-countries":
    "https://restcountries.com/v3.1/region/europe?fields=name,capital,population,flags",
  inaturalist:
    "https://api.inaturalist.org/v1/observations?per_page=10&order=desc&order_by=created_at",
  openalex: "https://api.openalex.org/works?search=photosynthesis&per_page=5",
  europeana:
    "https://api.europeana.eu/record/v2/search.json?wskey=apidemo&query=science&rows=10",
  gbif: "https://api.gbif.org/v1/species/search?q=tiger&limit=10",
  "open-food-facts":
    "https://world.openfoodfacts.org/cgi/search.pl?search_terms=yogurt&json=1&page_size=10",
  "open-meteo":
    "https://api.open-meteo.com/v1/forecast?latitude=40.71&longitude=-74.01&daily=temperature_2m_max,temperature_2m_min&timezone=auto",
  "launch-library-2": "https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=10",
  jsonplaceholder: "https://jsonplaceholder.typicode.com/users",
  quotable: "https://dummyjson.com/quotes?limit=10",
  openverse: "https://api.openverse.org/v1/images/?q=biology&page_size=10",
  conceptnet: "https://api.conceptnet.io/c/en/example?limit=10",
  "internet-archive":
    "https://archive.org/advancedsearch.php?q=subject:mathematics&fl[]=identifier&fl[]=title&fl[]=creator&output=json&rows=10",
  "wikimedia-commons":
    "https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=cell&gsrlimit=10&prop=imageinfo&iiprop=url",
  "open-notify-people": "http://api.open-notify.org/astros.json",
  crossref: "https://api.crossref.org/works?query=climate+education&rows=5",
  "clinicaltrials-gov":
    "https://clinicaltrials.gov/api/v2/studies?query.cond=asthma&pageSize=5",
};

function eduSource(base) {
  return {
    ...base,
    category: EDU.key,
    categoryLabel: EDU.label,
    color: EDU.color,
  };
}

const catalog = JSON.parse(readFileSync(apisPath, "utf8"));
const endpoints = JSON.parse(readFileSync(endpointsPath, "utf8"));

const existingIds = new Set(catalog.sources.map((s) => s.id));

for (const source of catalog.sources) {
  if (!MOVE_TO_EDUCATION.has(source.id)) continue;
  source.category = EDU.key;
  source.categoryLabel = EDU.label;
  source.color = EDU.color;
  if (DESCRIPTION_TWEAKS[source.id]) {
    source.description = DESCRIPTION_TWEAKS[source.id];
  }
}

for (const raw of NEW_EDUCATION_SOURCES) {
  if (existingIds.has(raw.id)) continue;
  catalog.sources.push(eduSource(raw));
  existingIds.add(raw.id);
}

// Remove education category if re-running, then rebuild category list
const otherCategories = catalog.categories.filter((c) => c.key !== EDU.key);
const counts = {};
for (const source of catalog.sources) {
  counts[source.category] = (counts[source.category] ?? 0) + 1;
}

const rebuiltCategories = otherCategories.map((cat) => ({
  ...cat,
  count: counts[cat.key] ?? 0,
}));

// Education first in sidebar for visibility
rebuiltCategories.unshift({
  ...EDU,
  count: counts[EDU.key] ?? 0,
});

catalog.categories = rebuiltCategories;
catalog.counts = {
  sources: catalog.sources.length,
  categories: catalog.categories.length,
};
catalog.generated = new Date().toISOString().slice(0, 10);

Object.assign(endpoints, NEW_ENDPOINTS);

writeFileSync(apisPath, `${JSON.stringify(catalog, null, 2)}\n`);
writeFileSync(endpointsPath, `${JSON.stringify(endpoints, null, 2)}\n`);

console.log(
  `Education patch: ${counts[EDU.key]} sources in "${EDU.label}", ${catalog.sources.length} total.`,
);
