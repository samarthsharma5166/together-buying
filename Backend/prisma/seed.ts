import {
  PrismaClient,
  PropertyStatus,
  Role,
  PropertyType,
  PossessionStatus,
  PropertyImageType,
  UnitType,
  UnitImageType,
  PartnershipStatus,
} from "@prisma/client";
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

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

const NCR_CITIES = ["Greater Noida", "Noida", "Gurugram", "New Delhi", "Faridabad"];

const YOUTUBE_VIDEOS = [
  {
    title: "Luxury Project Walkthrough — Greater Noida",
    subtitle: "Premium inventory tour with group buying benefits",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    posterUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    sortOrder: 0,
  },
  {
    title: "Yamuna Expressway Plot Investment Guide",
    subtitle: "Why NRI buyers are choosing this corridor",
    videoUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    posterUrl: "https://img.youtube.com/vi/jNQXAC9IVRw/hqdefault.jpg",
    sortOrder: 1,
  },
  {
    title: "Group Buying Success Story — Saved ₹42L",
    subtitle: "Real buyer testimonial from Gurugram",
    videoUrl: "https://www.youtube.com/watch?v=9bZkp7q19f0",
    posterUrl: "https://img.youtube.com/vi/9bZkp7q19f0/hqdefault.jpg",
    sortOrder: 2,
  },
  {
    title: "Pre-Launch Project Comparison — NCR 2026",
    subtitle: "Side-by-side review of top developer projects",
    videoUrl: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
    posterUrl: "https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg",
    sortOrder: 3,
  },
];

async function main() {
  await prisma.article.deleteMany();
  await prisma.showcaseVideo.deleteMany();
  await prisma.youtubeChannelConfig.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.unitImage.deleteMany();
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

  const developerIds: string[] = [];

  for (let i = 0; i < 30; i++) {
    const companyName = faker.company.name() + " Real Estate";
    const created = await prisma.developer.create({
      data: {
        companyName,
        slug: faker.helpers.slugify(companyName).toLowerCase() + "-" + i,
        headquartersCity: faker.helpers.arrayElement(NCR_CITIES),
        contactName: faker.person.fullName(),
        contactEmail: `dev${i}@groupbuying.in`,
        contactPhone: `9000${i.toString().padStart(6, "0")}`,
        logoUrl: faker.image.url(),
        bannerImageUrl: faker.image.url(),
        websiteUrl: faker.internet.url(),
        establishedYear: faker.number.int({ min: 1980, max: 2023 }),
        description: faker.company.catchPhrase(),
        reraRegistered: faker.datatype.boolean(),
        partnershipStatus: PartnershipStatus.ACTIVE,
      },
    });
    developerIds.push(created.id);
  }

  for (let i = 0; i < 30; i++) {
    const developerId = faker.helpers.arrayElement(developerIds);

    const isForcedVillaPlot = i < 8;
    const isForcedPreLaunch = i >= 8 && i < 16;
    const isForcedOffshore = i >= 16 && i < 20;

    const titleSuffix = isForcedVillaPlot
      ? faker.helpers.arrayElement(["Villas", "Plots", "Estates"])
      : isForcedOffshore
        ? faker.helpers.arrayElement(["Residences", "Harbour", "Bay"])
        : faker.helpers.arrayElement(["Residences", "Towers", "Heights", "Apartments"]);

    const title = faker.location.street() + " " + titleSuffix;
    const propertyType = isForcedVillaPlot
      ? PropertyType.RESIDENTIAL
      : faker.helpers.arrayElement([PropertyType.RESIDENTIAL, PropertyType.COMMERCIAL]);
    const isPreLaunch = isForcedPreLaunch ? true : faker.datatype.boolean();
    const isPromising = isForcedVillaPlot ? true : faker.datatype.boolean();
    const isOffshore = isForcedOffshore;
    const possessionStatus = isForcedPreLaunch
      ? PossessionStatus.PRE_LAUNCH
      : faker.helpers.arrayElement([
          PossessionStatus.PRE_LAUNCH,
          PossessionStatus.UNDER_CONSTRUCTION,
          PossessionStatus.READY_TO_MOVE,
        ]);

    const imageSetKeys = Object.keys(imageSets) as (keyof typeof imageSets)[];
    const imageSet = imageSets[faker.helpers.arrayElement(imageSetKeys)];

    const minPrice = faker.number.int({ min: 10000000, max: 50000000 });
    const maxPrice = minPrice + faker.number.int({ min: 10000000, max: 50000000 });

    await prisma.property.create({
      data: {
        title,
        slug: faker.helpers.slugify(title).toLowerCase() + "-" + i,
        description: faker.lorem.sentence(),
        propertyType,
        status: PropertyStatus.ACTIVE,
        possessionStatus,
        city: isForcedOffshore
          ? faker.helpers.arrayElement(["Dubai", "Singapore", "London"])
          : faker.helpers.arrayElement(NCR_CITIES),
        locality: faker.location.street(),
        address: faker.location.streetAddress(),
        minPrice: BigInt(minPrice),
        maxPrice: BigInt(maxPrice),
        isFeatured: faker.datatype.boolean(),
        isPreLaunch,
        isFastSelling: faker.datatype.boolean(),
        isPromising,
        isOffshore,
        views: faker.number.int({ min: 500, max: 2000 }),
        developerId,
        createdById: admin.id,
        reraNumber: `RERA-${faker.string.alphanumeric(8).toUpperCase()}`,
        reraState: faker.location.state(),
        images: {
          create: imageSet.map((imageUrl, index) => ({
            imageUrl,
            caption: faker.lorem.words(3),
            imageType: index === 0 ? PropertyImageType.EXTERIOR : PropertyImageType.AMENITY,
            sortOrder: index,
          })),
        },
        units: {
          create: Array.from({ length: faker.number.int({ min: 2, max: 5 }) }).map((_, index) => {
            const area = faker.number.int({ min: 800, max: 4000 });
            return {
              unitType: isForcedVillaPlot
                ? title.includes("Plots")
                  ? UnitType.PLOT
                  : UnitType.VILLA
                : faker.helpers.arrayElement([UnitType.BHK_2, UnitType.BHK_3, UnitType.BHK_4]),
              superAreaSqft: area,
              carpetAreaSqft: Math.round(area * 0.72),
              price: BigInt(minPrice + faker.number.int({ min: 0, max: maxPrice - minPrice })),
              availableUnits: faker.number.int({ min: 1, max: 20 }),
              images: {
                create: [
                  {
                    imageUrl: imageSet[index % imageSet.length],
                    caption: faker.lorem.words(2),
                    imageType: UnitImageType.INTERIOR,
                    sortOrder: index,
                  },
                ],
              },
            };
          }),
        },
      },
    });
  }

  await prisma.youtubeChannelConfig.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      channelName: "GroupBuying Official",
      channelUrl: "https://www.youtube.com/@GroupBuying",
      metadataText: "823K views · Updated weekly",
    },
    update: {
      channelName: "GroupBuying Official",
      channelUrl: "https://www.youtube.com/@GroupBuying",
      metadataText: "823K views · Updated weekly",
    },
  });

  for (const video of YOUTUBE_VIDEOS) {
    await prisma.showcaseVideo.create({ data: video });
  }

  const { ARTICLE_SEEDS } = await import("./seed-articles.ts");

  for (const article of ARTICLE_SEEDS) {
    await prisma.article.create({
      data: {
        ...article,
        isPublished: true,
        authorId: admin.id,
      },
    });
  }

  console.log("Seeded successfully:");
  console.log("  - 1 admin user (admin@groupbuying.in / Admin@1234)");
  console.log("  - 30 developers");
  console.log("  - 30 properties (4 offshore, 8 pre-launch, 8 promising plots/villas)");
  console.log("  - 4 YouTube showcase videos");
  console.log(`  - ${ARTICLE_SEEDS.length} published articles`);
  console.log("  - YouTube channel config");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
