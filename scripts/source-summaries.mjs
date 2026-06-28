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
  [/\/v1\/forecast/i, "weather forecast for the coordinates in the link"],
  [/\/air-quality/i, "hourly air-quality readings"],
  [/\/forecast\?/i, "weather forecast for the coordinates in the link"],
  [/\/countries\/([a-z]{2,3})/i, "country-level stats for the country in the link"],
  [/\/region\/([a-z]+)/i, "countries in that world region"],
  [/\/search\.json/i, "book search results"],
  [/\/search\?/i, "search results for the query in the link"],
  [/\/random/i, "one random record"],
  [/\/latest/i, "the latest available readings"],
  [/\/upcoming/i, "upcoming scheduled events"],
  [/\/historical/i, "historical time-series values"],
  [/\/alerts\/active/i, "active weather alerts right now"],
  [/\/ticker/i, "live market prices"],
  [/\/top\/anime/i, "top-ranked anime titles"],
  [/\/launches\/latest/i, "the most recent space launch"],
  [/\/people\/\d+/i, "one character/person record (Star Wars API)"],
  [/\/films/i, "film catalog entries"],
  [/\/breweries/i, "brewery listings for the city in the link"],
  [/\/pokemon/i, "Pokémon species records"],
  [/\/fact$/i, "one random fact"],
  [/\/activity/i, "one random activity suggestion"],
  [/\/joke/i, "one random joke"],
  [/\/quotes?\/random/i, "one random quote"],
  [/\/dictionaryapi/i, "dictionary definition for the word in the link"],
  [/\/worldbank\.org\/v2\/country\/all\/indicator/i, "country comparison for the World Bank indicator in the link"],
  [/\/worldbank\.org/i, "World Bank development indicator time series"],
  [/\/openstates\.org\/bills/i, "recent state legislature bills"],
  [/\/openstates\.org\/jurisdictions/i, "US state & local jurisdictions"],
  [/\/datagetter/i, "tide or current predictions for the station/date in the link"],
  [/\/nwis\/iv/i, "stream flow / water level readings over time"],
  [/\/openaq\.org/i, "air-quality monitoring locations"],
  [/\/fda\.gov/i, "FDA open data records"],
  [/\/disease\.sh/i, "public health / COVID statistics"],
  [/\/frankfurter/i, "today's foreign-exchange rates"],
  [/\/coingecko\.com/i, "crypto market prices and caps"],
  [/\/pokeapi/i, "Pokémon data"],
  [/\/restcountries/i, "country profiles (population, borders, currencies)"],
  [/\/nominatim/i, "geocoded place search results"],
  [/\/tvmaze/i, "TV show metadata"],
  [/\/spaceflightnews/i, "recent spaceflight news articles"],
  [/\/ll\.thespacedevs/i, "rocket launch schedule"],
  [/\/api\.github\.com\/search/i, "GitHub repository search results"],
  [/\/hn\.algolia|firebaseio\.com\/v0\/top/i, "top Hacker News story IDs"],
  [/\/data\.police\.uk/i, "street-level crime reports for the coordinates/month in the link"],
  [/\/api\.fbi\.gov\/wanted/i, "FBI wanted list entries"],
  [/\/catalog\.data\.gov/i, "US government open dataset search results"],
  [/\/clinicaltrials\.gov/i, "clinical trial study records"],
  [/\/openalex\.org/i, "scholarly paper metadata"],
  [/\/crossref\.org/i, "academic publication metadata (DOIs)"],
  [/\/jsonplaceholder|reqres\.in/i, "sample JSON placeholder records for UI prototyping"],
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
    if (q) return `${category.toLowerCase()} results for “${decodeURIComponent(q).replace(/\+/g, " ")}”`;
  } catch {
    // ignore
  }

  return `${name} records from the ${category.toLowerCase()} API`;
}

function inferTimeScope(endpoint) {
  if (/2\.5_day|_day\.|today|current\.json|\/latest|iss-now|real-?time/i.test(endpoint)) {
    return "Live or very recent data";
  }
  if (/forecast|predictions|upcoming/i.test(endpoint)) {
    return "Near-term forecast / schedule";
  }
  if (/historical|observations|time-series|timeseries|\/iv\?/i.test(endpoint)) {
    return "Time series — values over multiple dates in each record";
  }
  if (/indicator\/|worldbank|fred\.stlouisfed|worldbank\.org/i.test(endpoint)) {
    return "Annual time series — each country includes values across many years";
  }
  if (/search|browse|list|collection/i.test(endpoint)) {
    return "Point-in-time snapshot from a search or listing";
  }
  return "Point-in-time snapshot";
}

function pluralizeRecords(count) {
  return count === 1 ? "1 record" : `${count} records`;
}

export function inferDataSummary(source) {
  const size = extractSampleSize(source.exampleEndpoint);
  const dataset = inferDatasetLabel(source.exampleEndpoint, source.name, source.category);
  const time = inferTimeScope(source.exampleEndpoint);

  const sizePart = size ? pluralizeRecords(size) : "a starter set of records";
  return `Sample link: ${sizePart} — ${dataset}. ${time}.`;
}

export function enrichSource(source) {
  const generic = /^Public [a-z]+ API for prototyping with real data\.$/.test(source.description);
  const dataSummary = source.dataSummary ?? inferDataSummary(source);

  let description = source.description;
  if (generic) {
    const dataset = inferDatasetLabel(source.exampleEndpoint, source.name, source.category);
    description = `${source.name} — ${dataset.charAt(0).toUpperCase()}${dataset.slice(1)}.`;
  }

  return { ...source, description, dataSummary };
}
