/**
 * Genera public/data/destinations.json: l'elenco di destinazioni usato dal
 * suggerimento automatico di "Dove vuoi andare?" (src/components/DestinationInput.tsx).
 *
 * Come si rigenera (serve solo se si vuole cambiare l'elenco):
 *   npm i --no-save all-the-cities      # dati GeoNames (CC BY 4.0), pacchetto MIT
 *   node scripts/build-destinations.mjs
 *
 * Contenuto:
 *  - tutti i Paesi del mondo (nomi italiani, da Intl.DisplayNames)
 *  - citta' con oltre 100.000 abitanti + tutte le capitali
 *  - citta' italiane con oltre 5.000 abitanti (mercato principale di Elly)
 *  - regioni, isole e zone turistiche scelte a mano (CURATED), con nomi italiani
 * Formato di ogni voce: [nome, ISO2, nome inglese (per la ricerca) o "", rango, tipo]
 *   tipo: 0 = citta', 1 = regione/zona, 2 = Paese
 */
import { createRequire } from "node:module";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const require = createRequire(import.meta.url);
const cities = require("all-the-cities");

const OUT = process.argv[2] ?? "public/data/destinations.json";

// Nomi italiani diversi da quelli inglesi di GeoNames ("Nome|ISO2" -> nome italiano).
const IT = {
  "Rome|IT": "Roma", "Milan|IT": "Milano", "Naples|IT": "Napoli", "Turin|IT": "Torino", "Florence|IT": "Firenze",
  "Venice|IT": "Venezia", "Genoa|IT": "Genova", "Syracuse|IT": "Siracusa", "Mantua|IT": "Mantova", "Padua|IT": "Padova",
  "Lisbon|PT": "Lisbona", "Seville|ES": "Siviglia", "Cordoba|ES": "Cordova", "Palma|ES": "Palma di Maiorca",
  "Munich|DE": "Monaco di Baviera", "Cologne|DE": "Colonia", "Nuremberg|DE": "Norimberga", "Hanover|DE": "Annover",
  "Prague|CZ": "Praga", "Warsaw|PL": "Varsavia", "Krakow|PL": "Cracovia", "Gdansk|PL": "Danzica", "Wroclaw|PL": "Breslavia",
  "Moscow|RU": "Mosca", "Saint Petersburg|RU": "San Pietroburgo", "Kyiv|UA": "Kiev", "Athens|GR": "Atene",
  "Thessaloniki|GR": "Salonicco", "Copenhagen|DK": "Copenaghen", "Brussels|BE": "Bruxelles", "Antwerp|BE": "Anversa",
  "Bruges|BE": "Bruges", "Ghent|BE": "Gand", "Geneva|CH": "Ginevra", "Zurich|CH": "Zurigo", "Basel|CH": "Basilea",
  "Bern|CH": "Berna", "Edinburgh|GB": "Edimburgo", "London|GB": "Londra", "Dublin|IE": "Dublino", "Bucharest|RO": "Bucarest",
  "Belgrade|RS": "Belgrado", "Zagreb|HR": "Zagabria", "Ljubljana|SI": "Lubiana", "Split|HR": "Spalato",
  "Valletta|MT": "La Valletta", "Izmir|TR": "Smirne", "Cairo|EG": "Il Cairo", "Alexandria|EG": "Alessandria d'Egitto",
  "Marrakesh|MA": "Marrakech", "Fes|MA": "Fez", "Tunis|TN": "Tunisi", "Algiers|DZ": "Algeri", "Jerusalem|IL": "Gerusalemme",
  "Damascus|SY": "Damasco", "Tehran|IR": "Teheran", "Beijing|CN": "Pechino", "Nanjing|CN": "Nanchino", "Seoul|KR": "Seul",
  "Ho Chi Minh City|VN": "Ho Chi Minh", "Jakarta|ID": "Giacarta", "New Delhi|IN": "Nuova Delhi", "Dhaka|BD": "Dacca",
  "Havana|CU": "L'Avana", "Mexico City|MX": "Città del Messico", "Panama City|PA": "Panama", "Sao Paulo|BR": "San Paolo",
  "New York City|US": "New York", "Montreal|CA": "Montréal", "Cape Town|ZA": "Città del Capo", "Addis Ababa|ET": "Addis Abeba",
  "Stockholm|SE": "Stoccolma", "Muscat|OM": "Mascate", "Yerevan|AM": "Erevan", "Lyon|FR": "Lione", "Marseille|FR": "Marsiglia",
  "Nice|FR": "Nizza", "Strasbourg|FR": "Strasburgo", "Avignon|FR": "Avignone", "Vienna|AT": "Vienna", "Lucerne|CH": "Lucerna",
  "Salzburg|AT": "Salisburgo", "Brasov|RO": "Brașov", "Tallinn|EE": "Tallinn", "Cusco|PE": "Cusco",
  // varianti con cui GeoNames scrive i nomi nella lingua locale
  "Sevilla|ES": "Siviglia", "Koln|DE": "Colonia", "Nurnberg|DE": "Norimberga", "Hannover|DE": "Annover",
  "Gent|BE": "Gand", "Antwerpen|BE": "Anversa", "Brugge|BE": "Bruges", "Luzern|CH": "Lucerna", "Geneve|CH": "Ginevra",
  "Thessaloniki|GR": "Salonicco", "Nice|FR": "Nizza", "Beograd|RS": "Belgrado", "Bucuresti|RO": "Bucarest",
  "Praha|CZ": "Praga", "Warszawa|PL": "Varsavia", "Wien|AT": "Vienna", "Lisboa|PT": "Lisbona", "Moskva|RU": "Mosca",
  "Kobenhavn|DK": "Copenaghen", "Bruxelles|BE": "Bruxelles", "Athina|GR": "Atene", "Gdansk|PL": "Danzica",
};
const norm = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
// Altre grafie inglesi con cui la gente cerca le stesse citta' (oltre al nome GeoNames).
const EXTRA_ALIAS = {
  "Siviglia|ES": "Seville", "Cordova|ES": "Cordoba", "Colonia|DE": "Cologne", "Norimberga|DE": "Nuremberg", "Annover|DE": "Hanover",
  "Gand|BE": "Ghent", "Anversa|BE": "Antwerp", "Lucerna|CH": "Lucerne", "Ginevra|CH": "Geneva", "Zurigo|CH": "Zurich",
  "Cracovia|PL": "Krakow", "Danzica|PL": "Gdansk", "Salonicco|GR": "Thessaloniki", "Bucarest|RO": "Bucharest",
  "Copenaghen|DK": "Copenhagen", "Bruxelles|BE": "Brussels", "Belgrado|RS": "Belgrade", "Mosca|RU": "Moscow",
};
const ITN = new Map(Object.entries(IT).map(([k, v]) => [norm(k), v]));

// Regioni, isole e zone turistiche: [nome italiano, ISO2, nome inglese/varianti per la ricerca]
const CURATED = [
  // Italia
  ["Toscana", "IT", "Tuscany"], ["Sicilia", "IT", "Sicily"], ["Sardegna", "IT", "Sardinia"], ["Puglia", "IT", "Apulia"],
  ["Calabria", "IT"], ["Campania", "IT"], ["Costiera Amalfitana", "IT", "Amalfi Coast"], ["Cilento", "IT"],
  ["Liguria", "IT"], ["Cinque Terre", "IT"], ["Piemonte", "IT", "Piedmont"], ["Langhe", "IT"], ["Lombardia", "IT", "Lombardy"],
  ["Lago di Como", "IT", "Lake Como"], ["Lago Maggiore", "IT"], ["Lago di Garda", "IT", "Lake Garda"], ["Dolomiti", "IT", "Dolomites"],
  ["Alto Adige", "IT", "South Tyrol"], ["Trentino", "IT"], ["Veneto", "IT"], ["Friuli-Venezia Giulia", "IT"],
  ["Emilia-Romagna", "IT"], ["Umbria", "IT"], ["Marche", "IT"], ["Abruzzo", "IT"], ["Molise", "IT"], ["Basilicata", "IT"],
  ["Lazio", "IT"], ["Valle d'Aosta", "IT", "Aosta Valley"], ["Val d'Orcia", "IT"], ["Chianti", "IT"],
  ["Isole Eolie", "IT", "Aeolian Islands"], ["Isole Egadi", "IT"], ["Pantelleria", "IT"], ["Lampedusa", "IT"],
  ["Salento", "IT"], ["Gargano", "IT"], ["Capri", "IT"], ["Ischia", "IT"], ["Procida", "IT"], ["Isola d'Elba", "IT", "Elba"],
  ["Costa Smeralda", "IT"], ["Maremma", "IT"], ["Sorrento", "IT"], ["Positano", "IT"], ["Amalfi", "IT"], ["Ravello", "IT"],
  ["Matera", "IT"], ["Alberobello", "IT"], ["Ostuni", "IT"], ["Polignano a Mare", "IT"], ["Tropea", "IT"], ["Taormina", "IT"],
  ["Cefalù", "IT"], ["Noto", "IT"], ["Ortigia", "IT"], ["Portofino", "IT"], ["Sirmione", "IT"], ["Bellagio", "IT"],
  ["San Gimignano", "IT"], ["Montepulciano", "IT"], ["Cortina d'Ampezzo", "IT"], ["Courmayeur", "IT"], ["Livigno", "IT"],
  ["Bormio", "IT"], ["Madonna di Campiglio", "IT"], ["Assisi", "IT"], ["Orvieto", "IT"], ["Spoleto", "IT"], ["Urbino", "IT"],
  ["Gubbio", "IT"], ["Otranto", "IT"], ["Ravenna", "IT"], ["Lecce", "IT"], ["Siena", "IT"], ["Pisa", "IT"], ["Lucca", "IT"],
  ["Alghero", "IT"], ["La Maddalena", "IT"], ["Stintino", "IT"], ["Val Gardena", "IT"], ["Alpe di Siusi", "IT", "Seiser Alm"],
  ["Sestriere", "IT"], ["Cervinia", "IT"], ["Bardonecchia", "IT"], ["Verbania", "IT"], ["Stresa", "IT"],
  // Spagna e Portogallo
  ["Andalusia", "ES", "Andalusia"], ["Catalogna", "ES", "Catalonia"], ["Isole Baleari", "ES", "Balearic Islands"], ["Maiorca", "ES", "Mallorca"],
  ["Minorca", "ES", "Menorca"], ["Ibiza", "ES"], ["Formentera", "ES"], ["Isole Canarie", "ES", "Canary Islands"], ["Tenerife", "ES"],
  ["Gran Canaria", "ES"], ["Lanzarote", "ES"], ["Fuerteventura", "ES"], ["Costa Brava", "ES"], ["Costa del Sol", "ES"],
  ["Cammino di Santiago", "ES", "Camino de Santiago"], ["Santiago di Compostela", "ES", "Santiago de Compostela"], ["San Sebastián", "ES"],
  ["Madeira", "PT"], ["Azzorre", "PT", "Azores"], ["Algarve", "PT"], ["Sintra", "PT"], ["Costa Vicentina", "PT"],
  // Francia e dintorni
  ["Provenza", "FR", "Provence"], ["Costa Azzurra", "FR", "French Riviera Cote d'Azur"], ["Normandia", "FR", "Normandy"],
  ["Bretagna", "FR", "Brittany"], ["Alsazia", "FR", "Alsace"], ["Corsica", "FR"], ["Borgogna", "FR", "Burgundy"],
  ["Valle della Loira", "FR", "Loire Valley"], ["Chamonix", "FR"], ["Mont Saint-Michel", "FR"], ["Monaco", "MC"],
  ["Alpi Svizzere", "CH", "Swiss Alps"], ["Zermatt", "CH"], ["Interlaken", "CH"], ["Baviera", "DE", "Bavaria"],
  ["Foresta Nera", "DE", "Black Forest"], ["Tirolo", "AT", "Tyrol"], ["Hallstatt", "AT"], ["Lago di Costanza", "DE", "Lake Constance"],
  // Grecia, Mediterraneo orientale, Balcani
  ["Santorini", "GR"], ["Mykonos", "GR"], ["Creta", "GR", "Crete"], ["Rodi", "GR", "Rhodes"], ["Corfù", "GR", "Corfu"],
  ["Milos", "GR"], ["Naxos", "GR"], ["Paros", "GR"], ["Zante", "GR", "Zakynthos"], ["Cefalonia", "GR", "Kefalonia"],
  ["Meteore", "GR", "Meteora"], ["Peloponneso", "GR", "Peloponnese"], ["Cicladi", "GR", "Cyclades"], ["Malta", "MT"], ["Gozo", "MT"],
  ["Cipro", "CY", "Cyprus"], ["Istria", "HR"], ["Dalmazia", "HR", "Dalmatia"], ["Hvar", "HR"], ["Korčula", "HR", "Korcula"],
  ["Laghi di Plitvice", "HR", "Plitvice Lakes"], ["Baia di Cattaro", "ME", "Bay of Kotor"], ["Kotor", "ME", "Cattaro"],
  ["Cappadocia", "TR", "Cappadocia"], ["Pamukkale", "TR"], ["Bodrum", "TR"], ["Antalya", "TR"], ["Costa Turchese", "TR"],
  // Nord Europa
  ["Fiordi norvegesi", "NO", "Norwegian Fjords"], ["Isole Lofoten", "NO", "Lofoten"], ["Lapponia", "FI", "Lapland"],
  ["Highlands scozzesi", "GB", "Scottish Highlands"], ["Isola di Skye", "GB", "Isle of Skye"], ["Cornovaglia", "GB", "Cornwall"],
  ["Lake District", "GB"], ["Cotswolds", "GB"], ["Isole Fær Øer", "FO", "Faroe Islands"],
  // Africa e Medio Oriente
  ["Sharm el-Sheikh", "EG"], ["Luxor", "EG"], ["Assuan", "EG", "Aswan"], ["Hurghada", "EG"], ["Marsa Alam", "EG"],
  ["Sahara", "MA"], ["Essaouira", "MA"], ["Chefchaouen", "MA"], ["Djerba", "TN"], ["Petra", "JO"], ["Wadi Rum", "JO"],
  ["Mar Morto", "JO", "Dead Sea"], ["Tel Aviv", "IL"], ["Dubai", "AE"], ["Abu Dhabi", "AE"], ["Zanzibar", "TZ"],
  ["Serengeti", "TZ"], ["Kilimangiaro", "TZ", "Kilimanjaro"], ["Masai Mara", "KE"], ["Cataratte Vittoria", "ZW", "Victoria Falls"],
  ["Garden Route", "ZA"], ["Parco Kruger", "ZA", "Kruger"], ["Isole Mauritius", "MU", "Mauritius"], ["Seychelles", "SC"],
  ["Madagascar", "MG"], ["Namibia", "NA"],
  // Asia
  ["Bali", "ID"], ["Lombok", "ID"], ["Isole Gili", "ID", "Gili Islands"], ["Giava", "ID", "Java"], ["Borneo", "MY"],
  ["Phuket", "TH"], ["Krabi", "TH"], ["Koh Samui", "TH"], ["Koh Phi Phi", "TH"], ["Chiang Mai", "TH"], ["Angkor", "KH"],
  ["Siem Reap", "KH"], ["Baia di Ha Long", "VN", "Ha Long Bay"], ["Sapa", "VN"], ["Hoi An", "VN"], ["Da Nang", "VN"],
  ["Palawan", "PH"], ["Boracay", "PH"], ["Cebu", "PH"], ["Maldive", "MV", "Maldives"], ["Rajasthan", "IN"], ["Kerala", "IN"],
  ["Goa", "IN"], ["Ladakh", "IN"], ["Hokkaido", "JP"], ["Okinawa", "JP"], ["Hakone", "JP"], ["Nara", "JP"], ["Monte Fuji", "JP", "Mount Fuji"],
  ["Isola di Jeju", "KR", "Jeju"], ["Yunnan", "CN"], ["Everest", "NP"], ["Annapurna", "NP"], ["Bhutan", "BT"],
  // Oceania
  ["Isola del Sud", "NZ", "South Island New Zealand"], ["Isola del Nord", "NZ", "North Island New Zealand"], ["Queensland", "AU"],
  ["Grande Barriera Corallina", "AU", "Great Barrier Reef"], ["Tasmania", "AU"], ["Uluru", "AU"], ["Polinesia Francese", "PF", "French Polynesia"],
  ["Bora Bora", "PF"], ["Tahiti", "PF"], ["Figi", "FJ", "Fiji"], ["Hawaii", "US"],
  // Americhe
  ["California", "US"], ["Florida", "US"], ["Florida Keys", "US"], ["Yellowstone", "US"], ["Grand Canyon", "US"], ["Alaska", "US"],
  ["Nuova Inghilterra", "US", "New England"], ["Route 66", "US"], ["Cascate del Niagara", "CA", "Niagara Falls"], ["Banff", "CA"],
  ["Yucatán", "MX", "Yucatan"], ["Tulum", "MX"], ["Riviera Maya", "MX"], ["Cancún", "MX", "Cancun"], ["Playa del Carmen", "MX"],
  ["Oaxaca", "MX"], ["Patagonia", "AR", "Patagonia Chile"], ["Machu Picchu", "PE"], ["Valle Sacra", "PE", "Sacred Valley"],
  ["Isole Galápagos", "EC", "Galapagos"], ["Amazzonia", "BR", "Amazon"], ["Isola di Pasqua", "CL", "Easter Island"],
  ["Deserto di Atacama", "CL", "Atacama"], ["Salar de Uyuni", "BO"], ["Giamaica", "JM", "Jamaica"], ["Repubblica Dominicana", "DO", "Dominican Republic"],
  ["Bahamas", "BS"], ["Aruba", "AW"], ["Belize", "BZ"], ["Isole Vergini", "VG", "Virgin Islands"], ["Martinica", "MQ", "Martinique"],
  ["Guadalupa", "GP", "Guadeloupe"], ["Saint Barthélemy", "BL", "St Barths"],
];

const ccRegion = new Intl.DisplayNames(["it"], { type: "region" });
const enRegion = new Intl.DisplayNames(["en"], { type: "region" });

const out = new Map(); // chiave: nome|cc  ->  voce
const add = (name, cc, alias, rank, type) => {
  const key = `${norm(name)}|${cc}`;
  const prev = out.get(key);
  if (prev && prev[3] >= rank) return;
  out.set(key, [name, cc, alias && alias !== name ? alias : "", Math.round(rank * 10) / 10, type]);
};

// 1) Paesi
for (let a = 65; a <= 90; a++) for (let b = 65; b <= 90; b++) {
  const cc = String.fromCharCode(a, b);
  let it;
  try { it = ccRegion.of(cc); } catch { continue; }
  if (!it || it === cc) continue;
  const en = enRegion.of(cc);
  // Solo i codici che sono davvero Paesi (Intl restituisce il codice stesso se sconosciuto).
  add(it, cc, en, 62, 2);
}

// 2) Citta'
for (const c of cities) {
  const big = c.population >= 100000;
  const capital = c.featureCode === "PPLC";
  const italian = c.country === "IT" && c.population >= 5000;
  if (!big && !capital && !italian) continue;
  if (/^(City|Municipality|Province) of /.test(c.name) || /-(shi|ku|gun|cho|machi)$/.test(c.name)) continue;
  const it = ITN.get(norm(`${c.name}|${c.country}`));
  const rank = Math.min(58, Math.log10(Math.max(c.population, 1000)) * 8.2) + (capital ? 6 : 0) + (c.country === "IT" ? 4 : 0);
  const display = it ?? c.name;
  const extra = EXTRA_ALIAS[`${display}|${c.country}`];
  add(display, c.country, it ? [c.name, extra].filter(Boolean).join(" ") : "", rank, 0);
}

// 3) Regioni, isole e zone turistiche scelte a mano: rango alto, cosi' battono le omonime minori
for (const [name, cc, alias] of CURATED) add(name, cc, alias, 66, 1);

const list = [...out.values()].sort((x, y) => y[3] - x[3]);
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(list));
console.log(`${list.length} destinazioni -> ${OUT}`);
