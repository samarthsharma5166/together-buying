import { PrismaClient, PropertyStatus, Role, PropertyType, PossessionStatus, PropertyImageType, UnitType, UnitImageType, PartnershipStatus } from "@prisma/client";
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

  const developerIds: string[] = [];

  // Generate 30 Developers
  for (let i = 0; i < 30; i++) {
    const companyName = faker.company.name() + " Real Estate";
    const created = await prisma.developer.create({
      data: {
        companyName,
        slug: faker.helpers.slugify(companyName).toLowerCase() + '-' + i,
        headquartersCity: faker.location.city(),
        contactName: faker.person.fullName(),
        contactEmail: `dev${i}@groupbuying.in`,
        contactPhone: `9000${i.toString().padStart(6, '0')}`,
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

  // Generate 30 Properties
  for (let i = 0; i < 30; i++) {
    const developerId = faker.helpers.arrayElement(developerIds);
    
    // Force specific categories for mock data
    const isForcedVillaPlot = i < 8; // First 8 are Villas/Plots
    const isForcedPreLaunch = i >= 8 && i < 16; // Next 8 are Pre-Launch
    
    const titleSuffix = isForcedVillaPlot 
      ? faker.helpers.arrayElement(["Villas", "Plots", "Estates"])
      : faker.helpers.arrayElement(["Residences", "Towers", "Heights", "Apartments"]);
      
    const title = faker.location.street() + " " + titleSuffix;
    const propertyType = isForcedVillaPlot ? PropertyType.RESIDENTIAL : faker.helpers.arrayElement([PropertyType.RESIDENTIAL, PropertyType.COMMERCIAL]);
    const isPreLaunch = isForcedPreLaunch ? true : faker.datatype.boolean();
    const isPromising = isForcedVillaPlot ? true : faker.datatype.boolean();
    const possessionStatus = isForcedPreLaunch 
      ? PossessionStatus.PRE_LAUNCH 
      : faker.helpers.arrayElement([PossessionStatus.PRE_LAUNCH, PossessionStatus.UNDER_CONSTRUCTION, PossessionStatus.READY_TO_MOVE]);
    
    // Choose random images
    const imageSetKeys = Object.keys(imageSets) as (keyof typeof imageSets)[];
    const imageSet = imageSets[faker.helpers.arrayElement(imageSetKeys)];
    
    const minPrice = faker.number.int({ min: 10000000, max: 50000000 });
    const maxPrice = minPrice + faker.number.int({ min: 10000000, max: 50000000 });

    await prisma.property.create({
      data: {
        title,
        slug: faker.helpers.slugify(title).toLowerCase() + '-' + i,
        description: faker.lorem.sentence(),
        propertyType,
        status: PropertyStatus.ACTIVE,
        possessionStatus,
        city: faker.location.city(),
        locality: faker.location.street(),
        address: faker.location.streetAddress(),
        minPrice: BigInt(minPrice),
        maxPrice: BigInt(maxPrice),
        isFeatured: faker.datatype.boolean(),
        isPreLaunch,
        isFastSelling: faker.datatype.boolean(),
        isPromising,
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
                  ? (title.includes("Plots") ? UnitType.PLOT : UnitType.VILLA) 
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
                  }
                ]
              },
            };
          }),
        },
      },
    });
  }

  console.log(`Seeded 30 developers and 30 properties with Faker.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
