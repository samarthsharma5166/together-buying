export type CityConfig = {
  localities: string[];
  developers: string[];
};

export type LocationGroup = {
  label: string;
  cities: Record<string, CityConfig>;
};

export const LOCATION_GROUPS: Record<"national" | "international", LocationGroup> = {
  national: {
    label: "India",
    cities: {
      Gurugram: {
        localities: [
          "Dwarka Expressway",
          "Golf Course Road",
          "Central Gurgaon",
          "Golf Course Extension",
          "Southern Peripheral Road",
          "Sohna Road",
          "Gwal Pahari",
          "New Gurgaon",
          "Manesar",
          "Sector 43",
          "Sector 65",
          "Sector 76",
          "Sector 99A",
        ],
        developers: ["M3M", "DLF", "Godrej Properties", "Emaar India", "Signature Global", "BPTP", "Elan", "Whiteland"],
      },
      Delhi: {
        localities: [
          "South Delhi",
          "Dwarka",
          "Rohini",
          "Vasant Kunj",
          "Saket",
          "Karol Bagh",
          "Connaught Place",
          "Janakpuri",
          "Pitampura",
          "Lajpat Nagar",
        ],
        developers: ["DLF", "Godrej Properties", "Tata Housing", "Raheja Developers", "Unitech", "Omaxe"],
      },
      Noida: {
        localities: [
          "Sector 62",
          "Sector 75",
          "Sector 76",
          "Sector 78",
          "Sector 85",
          "Sector 137",
          "Sector 150",
          "Noida Expressway",
          "Greater Noida West",
        ],
        developers: ["ATS HomeKraft", "Trehan Iris", "Supertech", "Mahagun", "Eldeco", "Gaursons"],
      },
      "Greater Noida": {
        localities: [
          "Sector 1",
          "Sector 4",
          "Techzone 4",
          "Yamuna Expressway",
          "Pari Chowk",
          "Knowledge Park",
          "Greater Noida West",
          "Sector 150",
        ],
        developers: ["ATS HomeKraft", "Godrej Properties", "Mahagun", "Ace Group", "Prateek Group", "Gaursons"],
      },
      Faridabad: {
        localities: [
          "Sector 21C",
          "Sector 37",
          "Sector 77",
          "Sector 86",
          "Neharpar",
          "Ballabgarh",
          "Surajkund Road",
          "Mathura Road",
        ],
        developers: ["Omaxe", "BPTP", "Puri Constructions", "Ashiana Housing", "RPS Group"],
      },
      Ghaziabad: {
        localities: [
          "Indirapuram",
          "Vaishali",
          "Raj Nagar Extension",
          "Crossings Republik",
          "Kaushambi",
          "Sahibabad",
          "NH-24",
          "Wave City",
        ],
        developers: ["Mahagun", "Gaursons", "Supertech", "Ajnara", "Ashiana Housing", "Wave Group"],
      },
    },
  },
  international: {
    label: "UAE",
    cities: {
      Dubai: {
        localities: [
          "Dubai Marina",
          "Downtown Dubai",
          "Business Bay",
          "JVC",
          "Jumeirah Village Circle",
          "Palm Jumeirah",
          "Dubai Hills Estate",
          "Arabian Ranches",
          "Dubai Creek Harbour",
          "MBR City",
          "JLT",
          "Al Furjan",
        ],
        developers: ["Emaar", "Damac", "Nakheel", "Meraas", "Dubai Properties", "Azizi", "Sobha Realty"],
      },
      "Abu Dhabi": {
        localities: [
          "Yas Island",
          "Saadiyat Island",
          "Al Reem Island",
          "Al Raha Beach",
          "Khalifa City",
          "Masdar City",
          "Corniche Area",
          "Al Maryah Island",
        ],
        developers: ["Aldar", "Emaar", "Bloom Properties", "Reportage Properties", "IMKAN"],
      },
      Sharjah: {
        localities: [
          "Al Majaz",
          "Al Khan",
          "Muwaileh",
          "Aljada",
          "Tilal City",
          "Sharjah Waterfront City",
          "University City",
        ],
        developers: ["Arada", "Alef Group", "Binghatti", "Eagle Hills", "Sharjah Holding"],
      },
      Ajman: {
        localities: ["Al Nuaimiya", "Al Rashidiya", "Emirates City", "Al Jurf", "Ajman Corniche"],
        developers: ["GJ Properties", "Aqua Properties", "Emirates Properties", "Ajman One"],
      },
      "Ras Al Khaimah": {
        localities: ["Al Marjan Island", "Mina Al Arab", "Al Hamra Village", "RAK City", "Mina Al Arab"],
        developers: ["RAK Properties", "Emaar", "Al Hamra", "Marjan"],
      },
    },
  },
};

export const ALL_CITIES = Object.values(LOCATION_GROUPS).flatMap((group) => Object.keys(group.cities));

export const DEFAULT_CITY = "Gurugram";

export function getCityConfig(city: string): CityConfig | null {
  for (const group of Object.values(LOCATION_GROUPS)) {
    if (group.cities[city]) return group.cities[city];
  }
  return null;
}

export function getCityRegion(city: string): "national" | "international" | null {
  if (LOCATION_GROUPS.national.cities[city]) return "national";
  if (LOCATION_GROUPS.international.cities[city]) return "international";
  return null;
}

export function normalizeCityForMatch(city: string) {
  return city.toLowerCase().replace(/\s+/g, " ").trim();
}

export function citiesMatch(propertyCity: string | null | undefined, filterCity: string) {
  if (!filterCity) return true;
  const aliases: Record<string, string[]> = {
    gurugram: ["gurugram", "gurgaon"],
    gurgaon: ["gurugram", "gurgaon"],
    "abu dhabi": ["abu dhabi", "abudhabi"],
    sharjah: ["sharjah", "charjhar", "sharja"],
  };
  const filter = normalizeCityForMatch(filterCity);
  const prop = normalizeCityForMatch(propertyCity || "");
  const list = aliases[filter] || [filter];
  return list.some((alias) => prop.includes(alias) || alias.includes(prop));
}
