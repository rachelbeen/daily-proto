const WB_INDICATORS = {
  "SI.POV.DDAY": "poverty headcount ratio (international poverty line)",
  "SI.POV.NAHC": "poverty headcount (national poverty lines)",
  "SP.POP.TOTL": "total population",
  "SL.UEM.TOTL.ZS": "unemployment (% of labor force)",
  "NY.GDP.MKTP.CD": "GDP in current US dollars",
};

const PATH_DATASET_HINTS = [
  [/\/earthquakes\/feed\/.*\/2\.5_day/i, "earthquakes magnitude 2.5+ from the last 24 hours"],
  [/\/earthquakes\/feed/i, "recent earthquake events"],
  [/\/v1\/forecast/i, "weather forecast for a specific location"],
  [/\/air-quality/i, "hourly air-quality readings"],
  [/\/forecast\?/i, "weather forecast for a specific location"],
  [/\/countries\/([a-z]{2,3})/i, "country-level stats for one country"],
  [/\/region\/([a-z]+)/i, "countries in one world region"],
  [/\/search\.json/i, "book search results"],
  [/\/search\?/i, "search results"],
  [/\/random/i, "one random item"],
  [/\/latest/i, "the latest available readings"],
  [/\/upcoming/i, "upcoming scheduled events"],
  [/\/historical/i, "historical values over time"],
  [/\/alerts\/active/i, "active weather alerts right now"],
  [/\/ticker/i, "live market prices"],
  [/\/top\/anime/i, "top-ranked anime titles"],
  [/\/launches\/latest/i, "the most recent space launch"],
  [/\/people\/\d+/i, "one Star Wars character"],
  [/\/films/i, "film catalog entries"],
  [/\/breweries/i, "brewery listings for a sample city"],
  [/\/pokemon/i, "Pokémon species"],
  [/\/fact$/i, "one random fact"],
  [/\/activity/i, "one random activity idea"],
  [/\/joke/i, "one random joke"],
  [/\/quotes?\/random/i, "one random quote"],
  [/\/dictionaryapi/i, "dictionary definition for one word"],
  [/\/worldbank\.org\/v2\/country\/all\/indicator/i, "country-by-country comparison for one development indicator"],
  [/\/worldbank\.org/i, "development indicators by country"],
  [/\/openstates\.org\/bills/i, "recent state legislature bills"],
  [/\/openstates\.org\/jurisdictions/i, "US state and local jurisdictions"],
  [/\/datagetter/i, "tide or current predictions for one station and date"],
  [/\/nwis\/iv/i, "stream flow and water level readings over time"],
  [/\/openaq\.org/i, "air-quality monitoring locations"],
  [/\/fda\.gov/i, "FDA public safety and recall records"],
  [/\/disease\.sh/i, "public health and COVID statistics"],
  [/\/frankfurter/i, "today's foreign-exchange rates"],
  [/\/coingecko\.com/i, "crypto market prices and market caps"],
  [/\/pokeapi/i, "Pokémon species data"],
  [/\/restcountries/i, "country profiles — population, borders, currencies, flags"],
  [/\/nominatim/i, "place search and geocoding results"],
  [/\/tvmaze/i, "TV show information"],
  [/\/spaceflightnews/i, "recent spaceflight news articles"],
  [/\/ll\.thespacedevs/i, "upcoming rocket launches"],
  [/\/api\.github\.com\/search/i, "GitHub repository search results"],
  [/\/hn\.algolia|firebaseio\.com\/v0\/top/i, "top Hacker News stories"],
  [/\/data\.police\.uk/i, "street-level crime reports for one area and month"],
  [/\/api\.fbi\.gov\/wanted/i, "FBI wanted list entries"],
  [/\/catalog\.data\.gov/i, "US government open dataset search results"],
  [/\/clinicaltrials\.gov/i, "clinical trial study records"],
  [/\/openalex\.org/i, "scholarly paper metadata"],
  [/\/crossref\.org/i, "academic publication metadata"],
  [/\/jsonplaceholder|reqres\.in/i, "demo user and post data for practice apps"],
];

function extractSampleSize(endpoint) {
  try {
    const url = new URL(endpoint);
    const sizeKeys = ["limit", "per_page", "page_size", "pageSize", "rows", "max", "amount", "ps", "size"];
    for (const key of sizeKeys) {
      const value = url.searchParams.get(key);
      if (value && /^\d+$/.test(value)) {
        return Number(value);
      }
    }
    if (url.pathname.includes("/random")) return 1;
  } catch {
    return null;
  }
  return null;
}

function inferDatasetLabel(endpoint, name, category) {
  const wb = endpoint.match(/indicator\/([A-Z.]+)/i);
  if (wb) {
    const code = wb[1];
    return WB_INDICATORS[code] ?? `World Bank indicator ${code}`;
  }

  for (const [pattern, label] of PATH_DATASET_HINTS) {
    if (pattern.test(endpoint)) return label;
  }

  try {
    const url = new URL(endpoint);
    const q = url.searchParams.get("q") ?? url.searchParams.get("query") ?? url.searchParams.get("search");
    if (q) {
      const query = decodeURIComponent(q).replace(/\+/g, " ");
      return `results for “${query}”`;
    }
  } catch {
    // ignore
  }

  return `${name.toLowerCase()} data`;
}

function inferTimeScope(endpoint) {
  if (/2\.5_day|_day\.|today|current\.json|\/latest|iss-now|real-?time/i.test(endpoint)) {
    return "Updates frequently — near real-time.";
  }
  if (/forecast|predictions|upcoming/i.test(endpoint)) {
    return "Looks ahead — forecast or schedule data.";
  }
  if (/historical|observations|time-series|timeseries|\/iv\?/i.test(endpoint)) {
    return "Tracks change over time.";
  }
  if (/indicator\/|worldbank|fred\.stlouisfed|worldbank\.org/i.test(endpoint)) {
    return "Year-by-year history for each country.";
  }
  if (/search|browse|list|collection/i.test(endpoint)) {
    return "A snapshot from a search or listing.";
  }
  return "A snapshot from right now.";
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function inferDataSummary(source) {
  const size = extractSampleSize(source.exampleEndpoint);
  const dataset = inferDatasetLabel(source.exampleEndpoint, source.name, source.category);
  const time = inferTimeScope(source.exampleEndpoint);

  if (size) {
    const unit = size === 1 ? "entry" : "entries";
    return `${size} ${unit} — ${dataset}. ${time}`;
  }

  return `${capitalize(dataset)}. ${time}`;
}

export function enrichSource(source) {
  const generic = /^Public [a-z]+ API for prototyping with real data\.$/.test(source.description);
  const dataSummary = source.dataSummary ?? inferDataSummary(source);

  let description = source.description;
  if (generic) {
    const dataset = inferDatasetLabel(source.exampleEndpoint, source.name, source.category);
    description = `${source.name} — ${capitalize(dataset)}.`;
  }

  return { ...source, description, dataSummary };
}
