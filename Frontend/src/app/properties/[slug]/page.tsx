import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getProperty, getProperties } from "@/lib/api";
import PropertyDetailClient from "./PropertyDetailClient";

type Props = { params: Promise<{ slug: string }> };

// SEO Metadata Generation
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const property = await getProperty(slug, cookieHeader);
  
  if (!property) {
    return {
      title: "Property Not Found - Together Buying",
      description: "The requested property could not be found."
    };
  }

  const titleText = property.metaTitle || `${property.title} | Group Buying Savings`;
  const descText = property.metaDescription || property.description || `Group buy ${property.title} in ${property.city || "NCR"}. Unlock bulk discounts and developer negotiations.`;

  return {
    title: titleText,
    description: descText.substring(0, 160),
    openGraph: {
      title: titleText,
      description: descText.substring(0, 160),
      type: "website"
    }
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const property = await getProperty(slug, cookieHeader);
  console.log(property)
  if (!property) {
    notFound();
  }

  // Fetch related properties in the same city for the bottom grid
  const relatedResponse = await getProperties({ 
    city: property.city || undefined, 
    limit: 4
  });
  
  const related = (relatedResponse?.properties || [])
    .filter((item) => item.id !== property.id)
    .slice(0, 3);

  // Convert custom objects (like Prisma Decimal) to plain serializable types
  const plainProperty = JSON.parse(JSON.stringify(property));
  const plainRelated = JSON.parse(JSON.stringify(related));

  // Safe JSON list field parser for SQLite raw strings
  const parseJsonField = (field: any) => {
    if (typeof field === "string") {
      try {
        return JSON.parse(field);
      } catch {
        return [];
      }
    }
    return Array.isArray(field) ? field : [];
  };

  plainProperty.highlights = parseJsonField(plainProperty.highlights);
  plainProperty.amenities = parseJsonField(plainProperty.amenities);
  plainProperty.specifications = parseJsonField(plainProperty.specifications);

  // Reconstruct decimals into standard numbers to avoid hydration errors
  const reconstructDecimal = (decimalObj: any) => {
    if (decimalObj && typeof decimalObj === "object" && "d" in decimalObj && Array.isArray(decimalObj.d)) {
      const sign = decimalObj.s === -1 ? -1 : 1;
      const digits = decimalObj.d.join("");
      const exponent = decimalObj.e || 0;
      return sign * Number(digits) * Math.pow(10, exponent - digits.length + 1);
    }
    return null;
  };

  if (plainProperty.latitude && typeof plainProperty.latitude === "object") {
    plainProperty.latitude = reconstructDecimal(plainProperty.latitude);
  }
  if (plainProperty.longitude && typeof plainProperty.longitude === "object") {
    plainProperty.longitude = reconstructDecimal(plainProperty.longitude);
  }

  // Reconstruct decimals in units for main property
  if (plainProperty.units && Array.isArray(plainProperty.units)) {
    plainProperty.units = plainProperty.units.map((unit: any) => {
      if (unit.carpetAreaSqft && typeof unit.carpetAreaSqft === "object") {
        unit.carpetAreaSqft = reconstructDecimal(unit.carpetAreaSqft);
      }
      if (unit.superAreaSqft && typeof unit.superAreaSqft === "object") {
        unit.superAreaSqft = reconstructDecimal(unit.superAreaSqft);
      }
      return unit;
    });
  }

  const plainRelatedCleaned = plainRelated.map((item: any) => {
    if (item.latitude && typeof item.latitude === "object") {
      item.latitude = reconstructDecimal(item.latitude);
    }
    if (item.longitude && typeof item.longitude === "object") {
      item.longitude = reconstructDecimal(item.longitude);
    }
    // Reconstruct decimals in units for related property
    if (item.units && Array.isArray(item.units)) {
      item.units = item.units.map((unit: any) => {
        if (unit.carpetAreaSqft && typeof unit.carpetAreaSqft === "object") {
          unit.carpetAreaSqft = reconstructDecimal(unit.carpetAreaSqft);
        }
        if (unit.superAreaSqft && typeof unit.superAreaSqft === "object") {
          unit.superAreaSqft = reconstructDecimal(unit.superAreaSqft);
        }
        return unit;
      });
    }
    item.highlights = parseJsonField(item.highlights);
    item.amenities = parseJsonField(item.amenities);
    item.specifications = parseJsonField(item.specifications);
    return item;
  });

  return (
    <PropertyDetailClient 
      property={plainProperty} 
      related={plainRelatedCleaned} 
    />
  );
}
