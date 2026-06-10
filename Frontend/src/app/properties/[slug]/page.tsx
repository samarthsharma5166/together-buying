import { notFound } from "next/navigation";
import { getProperty, getProperties } from "@/lib/api";
import PropertyDetailClient from "./PropertyDetailClient";

type Props = { params: Promise<{ slug: string }> };

// SEO Metadata Generation
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const property = await getProperty(slug);
  
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
  const property = await getProperty(slug);

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

  const plainRelatedCleaned = plainRelated.map((item: any) => {
    if (item.latitude && typeof item.latitude === "object") {
      item.latitude = reconstructDecimal(item.latitude);
    }
    if (item.longitude && typeof item.longitude === "object") {
      item.longitude = reconstructDecimal(item.longitude);
    }
    return item;
  });

  return (
    <PropertyDetailClient 
      property={plainProperty} 
      related={plainRelatedCleaned} 
    />
  );
}
