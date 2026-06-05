import { PrismaClient, PropertyStatus, Role, PropertyType, PossessionStatus, PropertyImageType, UnitType, UnitImageType } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const developers = [
  { companyName: "Godrej Properties", slug: "godrej-properties", headquartersCity: "Mumbai", contactName: "Aarav Mehta", contactEmail: "partners@godrej-groupbuying.in", contactPhone: "9000000001", logoUrl: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=500&q=80", bannerImageUrl: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=86" },
  { companyName: "DLF Limited", slug: "dlf-limited", headquartersCity: "Gurugram", contactName: "Riya Kapoor", contactEmail: "partners@dlf-groupbuying.in", contactPhone: "9000000002", logoUrl: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=500&q=80", bannerImageUrl: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=86" },
  { companyName: "M3M India", slug: "m3m-india", headquartersCity: "Gurugram", contactName: "Kabir Arora", contactEmail: "partners@m3m-groupbuying.in", contactPhone: "9000000003", logoUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=500&q=80", bannerImageUrl: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=86" },
  { companyName: "Emaar India", slug: "emaar-india", headquartersCity: "Gurugram", contactName: "Ishaan Sethi", contactEmail: "partners@emaar-groupbuying.in", contactPhone: "9000000004", logoUrl: "https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=500&q=80", bannerImageUrl: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=86" },
  { companyName: "Trehan Iris", slug: "trehan-iris", headquartersCity: "Noida", contactName: "Neha Bansal", contactEmail: "partners@trehan-groupbuying.in", contactPhone: "9000000005", logoUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=500&q=80", bannerImageUrl: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=86" },
  { companyName: "Signature Global", slug: "signature-global", headquartersCity: "Gurugram", contactName: "Manav Singh", contactEmail: "partners@signature-groupbuying.in", contactPhone: "9000000006", logoUrl: "https://images.unsplash.com/photo-1600607688066-890987f18a86?auto=format&fit=crop&w=500&q=80", bannerImageUrl: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=86" },
  { companyName: "Whiteland Corporation", slug: "whiteland-corporation", headquartersCity: "Gurugram", contactName: "Tanya Malhotra", contactEmail: "partners@whiteland-groupbuying.in", contactPhone: "9000000007", logoUrl: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=500&q=80", bannerImageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=86" },
  { companyName: "Krisumi Corporation", slug: "krisumi-corporation", headquartersCity: "Gurugram", contactName: "Devika Rao", contactEmail: "partners@krisumi-groupbuying.in", contactPhone: "9000000008", logoUrl: "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=500&q=80", bannerImageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=86" },
];

const imageSets = {
  skyline: [
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=86",
    "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1400&q=86",
  ],
  luxury: [
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=86",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=86",
  ],
  interiors: [
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=86",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=86",
  ],
  commercial: [
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=86",
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=86",
  ],
};

const properties = [
  { developer: "Godrej Properties", title: "Godrej Miraya", slug: "godrej-miraya", city: "Gurugram", locality: "Sector 43", propertyType: "Apartment", possessionStatus: "New Launch", minPrice: "52500000", maxPrice: "90000000", isFeatured: true, isPreLaunch: false, images: imageSets.luxury, units: [["3 BHK", 2800, "52500000"], ["4 BHK", 3900, "74000000"]] },
  { developer: "DLF Limited", title: "DLF Privana West", slug: "dlf-privana-west", city: "Gurugram", locality: "Sector 76", propertyType: "Luxury Apartment", possessionStatus: "Under Construction", minPrice: "62000000", maxPrice: "115000000", isFeatured: true, isPreLaunch: false, images: imageSets.skyline, units: [["4 BHK", 3577, "62000000"], ["Penthouse", 5200, "115000000"]] },
  { developer: "M3M India", title: "M3M Altitude", slug: "m3m-altitude", city: "Gurugram", locality: "Sector 65", propertyType: "Apartment", possessionStatus: "Pre Launch", minPrice: "41000000", maxPrice: "78000000", isFeatured: true, isPreLaunch: true, images: imageSets.luxury, units: [["3.5 BHK", 2500, "41000000"], ["4.5 BHK", 3600, "69000000"]] },
  { developer: "Emaar India", title: "Emaar Urban Ascent", slug: "emaar-urban-ascent", city: "Gurugram", locality: "Golf Course Extension", propertyType: "Apartment", possessionStatus: "New Launch", minPrice: "33500000", maxPrice: "68000000", isFeatured: true, isPreLaunch: true, images: imageSets.interiors, units: [["3 BHK", 2100, "33500000"], ["4 BHK", 3100, "52000000"]] },
  { developer: "Trehan Iris", title: "Trehan Iris Broadway", slug: "trehan-iris-broadway", city: "Noida", locality: "Sector 85", propertyType: "Commercial", possessionStatus: "Ready To Move", minPrice: "18000000", maxPrice: "35000000", isFeatured: false, isPreLaunch: false, images: imageSets.commercial, units: [["Retail Studio", 850, "18000000"], ["Anchor Shop", 1400, "35000000"]] },
  { developer: "Signature Global", title: "Signature Titanium SPR", slug: "signature-titanium-spr", city: "Gurugram", locality: "SPR", propertyType: "Apartment", possessionStatus: "Under Construction", minPrice: "28500000", maxPrice: "52000000", isFeatured: true, isPreLaunch: false, images: imageSets.skyline, units: [["3 BHK", 1900, "28500000"], ["3 BHK + S", 2500, "42000000"]] },
  { developer: "Whiteland Corporation", title: "Whiteland Blissville", slug: "whiteland-blissville", city: "Gurugram", locality: "Sector 76", propertyType: "Apartment", possessionStatus: "Ready To Move", minPrice: "22500000", maxPrice: "43000000", isFeatured: false, isPreLaunch: false, images: imageSets.interiors, units: [["2 BHK", 1400, "22500000"], ["3 BHK", 2050, "33000000"]] },
  { developer: "Krisumi Corporation", title: "Krisumi Waterfall Residences", slug: "krisumi-waterfall-residences", city: "Gurugram", locality: "Sector 36A", propertyType: "Luxury Apartment", possessionStatus: "Under Construction", minPrice: "31000000", maxPrice: "85000000", isFeatured: true, isPreLaunch: false, images: imageSets.luxury, units: [["2 BHK", 1475, "31000000"], ["4 BHK", 3650, "85000000"]] },
  { developer: "DLF Limited", title: "DLF Midtown Heights", slug: "dlf-midtown-heights", city: "Delhi", locality: "Moti Nagar", propertyType: "Apartment", possessionStatus: "Ready To Move", minPrice: "39000000", maxPrice: "76000000", isFeatured: false, isPreLaunch: false, images: imageSets.skyline, units: [["3 BHK", 2300, "39000000"], ["4 BHK", 3200, "64000000"]] },
  { developer: "Godrej Properties", title: "Godrej Woods Estate", slug: "godrej-woods-estate", city: "Noida", locality: "Sector 43", propertyType: "Apartment", possessionStatus: "Under Construction", minPrice: "25000000", maxPrice: "58000000", isFeatured: false, isPreLaunch: false, images: imageSets.interiors, units: [["2.5 BHK", 1550, "25000000"], ["3.5 BHK", 2350, "42000000"]] },
  { developer: "M3M India", title: "M3M Capital Walk", slug: "m3m-capital-walk", city: "Gurugram", locality: "Dwarka Expressway", propertyType: "Commercial", possessionStatus: "New Launch", minPrice: "12500000", maxPrice: "42000000", isFeatured: false, isPreLaunch: true, images: imageSets.commercial, units: [["Retail", 650, "12500000"], ["Office Suite", 1250, "26000000"]] },
  { developer: "Emaar India", title: "Emaar Serenity Hills", slug: "emaar-serenity-hills", city: "Gurugram", locality: "Sohna Road", propertyType: "Villa", possessionStatus: "Pre Launch", minPrice: "78000000", maxPrice: "150000000", isFeatured: true, isPreLaunch: true, images: imageSets.luxury, units: [["4 BHK Villa", 4200, "78000000"], ["5 BHK Villa", 6400, "150000000"]] },
];

function mapPropertyType(type: string): PropertyType {
  switch (type.toLowerCase()) {
    case "commercial":
      return PropertyType.COMMERCIAL;
    default:
      return PropertyType.RESIDENTIAL;
  }
}

function mapPossessionStatus(status: string): PossessionStatus {
  switch (status.toLowerCase()) {
    case "new launch":
    case "pre launch":
      return PossessionStatus.PRE_LAUNCH;
    case "ready to move":
      return PossessionStatus.READY_TO_MOVE;
    default:
      return PossessionStatus.UNDER_CONSTRUCTION;
  }
}

function mapUnitType(type: string): UnitType {
  const t = type.toLowerCase();
  if (t.includes("1 bhk") || t === "1bhk") return UnitType.BHK_1;
  if (t.includes("2 bhk") || t === "2bhk") return UnitType.BHK_2;
  if (t.includes("3 bhk") || t === "3bhk") return UnitType.BHK_3;
  if (t.includes("4 bhk") || t === "4bhk") return UnitType.BHK_4;
  if (t.includes("5 bhk") || t === "5bhk" || t.includes("penthouse")) return UnitType.BHK_5;
  if (t.includes("villa")) return UnitType.VILLA;
  if (t.includes("plot")) return UnitType.PLOT;
  if (t.includes("office")) return UnitType.OFFICE;
  if (t.includes("shop") || t.includes("retail")) return UnitType.SHOP;
  return UnitType.BHK_3; // Fallback
}

async function main() {
  await prisma.propertyImage.deleteMany();
  await prisma.propertyUnit.deleteMany();
  await prisma.property.deleteMany();
  await prisma.developer.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      firstName: "Group",
      lastName: "Admin",
      email: "admin@groupbuying.in",
      phone: "9999999999",
      password: await bcrypt.hash("Admin@1234", 10),
      role: Role.SUPER_ADMIN,
    },
  });

  const developerMap = new Map<string, string>();
  for (const developer of developers) {
    const created = await prisma.developer.create({
      data: {
        ...developer,
        description: `${developer.companyName} is a verified GroupBuying developer partner with premium inventory and developer-direct negotiation support.`,
      },
    });
    developerMap.set(created.companyName, created.id);
  }

  for (const property of properties) {
    const developerId = developerMap.get(property.developer);
    if (!developerId) continue;

    await prisma.property.create({
      data: {
        title: property.title,
        slug: property.slug,
        description: `${property.title} offers premium real estate inventory in ${property.locality}, ${property.city}. GroupBuying buyers can unlock stronger pricing, broker cashback and expert RM support through a verified buyer group.`,
        propertyType: mapPropertyType(property.propertyType),
        status: PropertyStatus.ACTIVE,
        possessionStatus: mapPossessionStatus(property.possessionStatus),
        city: property.city,
        locality: property.locality,
        address: `${property.locality}, ${property.city}`,
        minPrice: BigInt(property.minPrice),
        maxPrice: BigInt(property.maxPrice),
        isFeatured: property.isFeatured,
        isPreLaunch: property.isPreLaunch,
        developerId,
        createdById: admin.id,
        reraNumber: `RERA-HR-${Math.floor(100000 + Math.random() * 900000)}`,
        reraState: "Haryana",
        images: {
          create: property.images.map((imageUrl, index) => ({
            imageUrl,
            caption: `${property.title} ${index === 0 ? "showcase" : "gallery"} image`,
            imageType: index === 0 ? PropertyImageType.EXTERIOR : PropertyImageType.AMENITY,
            sortOrder: index,
          })),
        },
        units: {
          create: property.units.map(([unitType, area, price], index) => ({
            unitType: mapUnitType(String(unitType)),
            superAreaSqft: Number(area),
            carpetAreaSqft: Math.round(Number(area) * 0.72),
            price: BigInt(String(price)),
            availableUnits: 6 + index * 3,
            images: {
              create: [
                {
                  imageUrl: imageSets.interiors[index % imageSets.interiors.length],
                  caption: `${property.title} ${unitType} interior`,
                  imageType: UnitImageType.INTERIOR,
                  sortOrder: index,
                }
              ]
            },
          })),
        },
      },
    });
  }

  console.log(`Seeded ${developers.length} developers and ${properties.length} properties.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
