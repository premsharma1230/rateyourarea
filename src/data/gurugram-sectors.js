const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80";

const ZERO_RATINGS = {
  water: 0,
  power: 0,
  security: 0,
  maintenance: 0,
  internet: 0,
  parking: 0,
  schools: 0,
  builderTrust: 0,
};

/** Numeric sectors 1–115 plus common Gurugram letter variants (21A, 22A, etc.) */
export const GURUGRAM_SECTOR_IDS = [
  ...Array.from({ length: 115 }, (_, i) => String(i + 1)),
  "9A",
  "9B",
  "10A",
  "10B",
  "17A",
  "17B",
  "21A",
  "22A",
  "23A",
  "27A",
  "31A",
  "31B",
  "37A",
  "37B",
  "37C",
  "37D",
  "38A",
  "41A",
  "42A",
  "43A",
  "44A",
  "45A",
  "46A",
  "47A",
  "48A",
  "49A",
  "50A",
  "51A",
  "52A",
  "53A",
  "54A",
  "55A",
  "56A",
  "57A",
  "62A",
  "63A",
  "65A",
  "67A",
  "68A",
  "69A",
  "70A",
  "71A",
  "72A",
  "74A",
  "75A",
  "78A",
  "95A",
  "95B",
  "100A",
  "101A",
  "102A",
  "105A",
  "106A",
  "107A",
  "108A",
  "109A",
  "110A",
  "111A",
  "112A",
  "113A",
  "114A",
];

function createSectorArea(sectorId) {
  const normalized = String(sectorId);
  const slug = `sector-${normalized.toLowerCase()}`;

  return {
    slug,
    name: `Sector ${normalized}`,
    city: "Gurugram",
    sector: normalized,
    type: "sector",
    overallRating: 0,
    totalReviews: 0,
    ratings: { ...ZERO_RATINGS },
    reraComplaints: 0,
    description: `Sector ${normalized} in Gurugram — residential and commercial locality.`,
    image: DEFAULT_IMAGE,
    tags: ["Sector", "Gurugram"],
    pros: [],
    cons: [],
    isSeedSector: true,
  };
}

export const gurugramSectorAreas = GURUGRAM_SECTOR_IDS.map(createSectorArea);

export function sortSectorIds(a, b) {
  const parse = (value) => {
    const match = String(value).match(/^(\d+)([A-Za-z]*)$/);
    if (!match) return [9999, value || ""];
    return [parseInt(match[1], 10), match[2].toUpperCase()];
  };

  const [numA, suffixA] = parse(a);
  const [numB, suffixB] = parse(b);

  if (numA !== numB) return numA - numB;
  return suffixA.localeCompare(suffixB);
}

export function normalizeSectorId(sector) {
  const match = String(sector).trim().match(/^(\d+)([a-z]*)$/i);
  if (!match) return String(sector).trim();
  return `${match[1]}${match[2].toUpperCase()}`;
}
