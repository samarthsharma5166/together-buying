import { api } from "@/lib/axios";

export type Developer = {
  id: string;
  companyName: string;
  slug?: string;
  logoUrl?: string | null;
  bannerImageUrl?: string | null;
  headquartersCity?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  websiteUrl?: string | null;
  establishedYear?: number | null;
  description?: string | null;
  reraRegistered?: boolean;
  partnershipStatus?: "ACTIVE" | "SUSPENDED" | "TERMINATED";
  partnershipStart?: string | Date | null;
  _count?: { properties?: number };
};

export type PropertyImage = {
  id?: string;
  imageUrl?: string | null;
  caption?: string | null;
  imageType?: string | null;
  sortOrder?: number | null;
};

export type PropertyUnit = {
  id?: string;
  unitType?: string | null;
  carpetAreaSqft?: number | null;
  superAreaSqft?: number | null;
  price?: string | number | null;
  availableUnits?: number | null;
  images?: PropertyImage[];
};

export type Property = {
  id: string;
  title: string;
  slug?: string;
  description?: string | null;
  propertyType?: string | null;
  status?: string | null;
  possessionStatus?: string | null;
  city?: string | null;
  locality?: string | null;
  address?: string | null;
  reraNumber?: string | null;
  reraState?: string | null;
  possessionDate?: string | Date | null;
  totalUnits?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  highlights?: string[];
  amenities?: string[];
  specifications?: string[];
  minPrice?: string | number | null;
  maxPrice?: string | number | null;
  isFeatured?: boolean;
  isPreLaunch?: boolean;
  developer?: Partial<Pick<Developer, "companyName" | "logoUrl" | "slug" | "id">> | null;
  images?: PropertyImage[];
  units?: PropertyUnit[];
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  groups?: PropertyGroup[];
};

export type PropertyGroup = {
  id: string;
  propertyId: string;
  rm_id: string;
  name: string;
  status: string;
  min_group_size: number;
  target_group_size: number;
  target_discount: number;
  current_members: number;
  createdAt: string;
  updatedAt: string;
  property?: Property;
  rmUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
};

export type ApiList<T> = { success?: boolean; meta?: { total?: number; page?: number; limit?: number; totalPages?: number }; data?: T[] };
export type ApiItem<T> = { success?: boolean; data?: T };

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api").replace(/\/$/, "");
const ASSET_BASE = API_BASE.replace(/\/api$/, "");

export const fallbackProperties: Property[] = [
  { id: "godrej-miraya", title: "Godrej Miraya", slug: "godrej-miraya", description: "Premium residences with group buying benefits, curated inventory and developer-direct savings.", propertyType: "Apartment", possessionStatus: "New Launch", city: "Gurugram", locality: "Sector 43", minPrice: "52500000", maxPrice: "90000000", isFeatured: true, developer: { companyName: "Godrej Properties" }, units: [{ unitType: "3 BHK", superAreaSqft: 2800, price: "52500000" }, { unitType: "4 BHK", superAreaSqft: 3900, price: "74000000" }] },
  { id: "dlf-privana", title: "DLF Privana", slug: "dlf-privana", description: "Luxury high-rise community with strong location fundamentals and group negotiation scope.", propertyType: "Luxury Apartment", possessionStatus: "Under Construction", city: "Gurugram", locality: "Sector 76", minPrice: "62000000", maxPrice: "115000000", isFeatured: true, developer: { companyName: "DLF" }, units: [{ unitType: "4 BHK", superAreaSqft: 3577, price: "62000000" }] },
  { id: "m3m-altitude", title: "M3M Altitude", slug: "m3m-altitude", description: "Signature apartments with premium amenities and structured buyer-group offers.", propertyType: "Apartment", possessionStatus: "Pre Launch", city: "Gurugram", locality: "Sector 65", minPrice: "41000000", maxPrice: "78000000", isFeatured: false, isPreLaunch: true, developer: { companyName: "M3M India" }, units: [{ unitType: "3.5 BHK", superAreaSqft: 2500, price: "41000000" }] },
  { id: "iris-broadway", title: "Trehan Iris Broadway", slug: "iris-broadway", description: "Fast-selling mixed-use destination with attractive entry pricing and buyer support.", propertyType: "Commercial", possessionStatus: "Ready To Move", city: "Noida", locality: "Sector 85", minPrice: "18000000", maxPrice: "35000000", developer: { companyName: "Trehan Iris" }, units: [{ unitType: "Retail", superAreaSqft: 850, price: "18000000" }] },
];

export const fallbackDevelopers: Developer[] = [
  { id: "godrej", companyName: "Godrej", headquartersCity: "Mumbai", _count: { properties: 12 } },
  { id: "dlf", companyName: "DLF", headquartersCity: "Gurugram", _count: { properties: 18 } },
  { id: "m3m", companyName: "M3M", headquartersCity: "Gurugram", _count: { properties: 9 } },
  { id: "emaar", companyName: "Emaar", headquartersCity: "Gurugram", _count: { properties: 7 } },
];

async function safeFetch<T>(path: string): Promise<T | null> {
  try {
    const response = await api.get(path);
    return response.data as T;
  } catch {
    return null;
  }
}

export function getAssetUrl(image?: string | null) {
  if (!image) return null;
  if (/^https?:\/\//.test(image)) return image;
  return `${ASSET_BASE}/uploads/${image.replace(/^\/+/, "")}`;
}

function filterFallbackProperties(params?: Record<string, string | number | boolean | undefined>) {
  const city = String(params?.city || "").toLowerCase();
  const propertyType = String(params?.propertyType || "").toLowerCase();
  const maxPrice = Number(params?.maxPrice || 0);
  const search = String(params?.search || "").toLowerCase();

  return fallbackProperties.filter((property) => {
    const text = [
      property.title,
      property.locality,
      property.city,
      property.propertyType,
      property.developer?.companyName,
      ...(property.units || []).map((unit) => unit.unitType),
    ].filter(Boolean).join(" ").toLowerCase();
    const price = Number(property.minPrice || 0);

    if (city && property.city?.toLowerCase() !== city) return false;
    if (propertyType && property.propertyType?.toLowerCase() !== propertyType) return false;
    if (maxPrice && price > maxPrice) return false;
    if (search && !text.includes(search)) return false;
    return true;
  });
}

export async function getProperties(params?: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const result = await safeFetch<ApiList<Property>>(`/properties${search.size ? `?${search}` : ""}`);
  const fallback = search.size ? filterFallbackProperties(params) : fallbackProperties;
  return { properties: result?.data?.length ? result.data : fallback, meta: result?.meta };
}

export async function getFeaturedProperties() {
  const result = await safeFetch<ApiList<Property>>("/properties/featured");
  return result?.data?.length ? result.data : fallbackProperties.slice(0, 3);
}

export async function getProperty(idOrSlug: string) {
  try {
    const result = await safeFetch<ApiItem<Property>>(`/properties/${idOrSlug}`);
    return result?.data || fallbackProperties.find((item) => item.slug === idOrSlug || item.id === idOrSlug) || null;
  } catch (error) {
    console.log(error)
  }
}

export async function getDevelopers() {
  const result = await safeFetch<ApiList<Developer>>("/developers?limit=24");
  return result?.data?.length ? result.data : fallbackDevelopers;
}

export async function authRequest(path: "/auth/login" | "/auth/register", body: Record<string, string>) {
  try {
    const response = await api.post(path, body);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Request failed");
  }
}

export async function getMe() {
  try {
    const response = await api.get("/auth/me");
    return response.data?.user || null;
  } catch {
    return null;
  }
}

export async function logoutRequest() {
  try {
    const response = await api.post("/auth/logout");
    return response.data?.success || false;
  } catch {
    return false;
  }
}

export async function adminCreateDeveloper(formData: FormData): Promise<Developer> {
  const response = await api.post("/developers", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to create developer");
  }
  return response.data.data;
}

export async function adminUpdateDeveloper(id: string, formData: FormData): Promise<Developer> {
  const response = await api.patch(`/developers/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to update developer");
  }
  return response.data.data;
}

export async function adminDeleteDeveloper(id: string): Promise<boolean> {
  const response = await api.delete(`/developers/terminate/${id}`);
  return response.data?.success || false;
}

export async function adminListDevelopers(page = 1, limit = 10, search = "", status = "") {
  const params: Record<string, any> = { page, limit };
  if (search) params.search = search;
  if (status) params.status = status;
  
  const response = await api.get("/developers", { params });
  return response.data as ApiList<Developer>;
}

export async function adminListProperties(
  page = 1,
  limit = 10,
  search = "",
  status = "",
  propertyType = "",
  possessionStatus = ""
) {
  const params: Record<string, any> = { page, limit };
  if (search) params.search = search;
  if (status) params.status = status;
  if (propertyType) params.propertyType = propertyType;
  if (possessionStatus) params.possessionStatus = possessionStatus;

  const response = await api.get("/properties", { params });
  return response.data as ApiList<Property>;
}

export async function adminCreateProperty(body: any): Promise<Property> {
  const response = await api.post("/properties", body);
  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to create property");
  }
  return response.data.data;
}

export async function adminUpdateProperty(id: string, body: any): Promise<Property> {
  const response = await api.patch(`/properties/${id}`, body);
  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to update property");
  }
  return response.data.data;
}

export async function adminDeleteProperty(id: string): Promise<boolean> {
  const response = await api.delete(`/properties/archived/${id}`);
  return response.data?.success || false;
}

export async function adminUploadPropertyImages(propertyId: string, formData: FormData): Promise<PropertyImage[]> {
  const response = await api.post(`/properties/${propertyId}/images`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to upload images");
  }
  return response.data.data;
}

export async function adminDeletePropertyImage(imageId: string): Promise<boolean> {
  const response = await api.delete(`/properties/images/${imageId}`);
  return response.data?.success || false;
}

export async function adminToggleFeatured(id: string, isFeatured: boolean): Promise<Property> {
  const response = await api.patch(`/properties/${id}/featured`, { isFeatured });
  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to toggle featured status");
  }
  return response.data.data;
}

export async function adminListGroups(): Promise<ApiList<PropertyGroup>> {
  const response = await api.get("/groups");
  return response.data;
}

export async function adminListRMs(): Promise<ApiList<{ id: string; firstName: string; lastName: string; email: string; phone?: string }>> {
  const response = await api.get("/groups/rms");
  return response.data;
}

export async function adminCreateGroup(body: any): Promise<PropertyGroup> {
  const response = await api.post("/groups", body);
  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to create group");
  }
  return response.data.data;
}

export async function adminUpdateGroup(id: string, body: any): Promise<PropertyGroup> {
  const response = await api.patch(`/groups/${id}`, body);
  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to update group");
  }
  return response.data.data;
}

export async function adminDeleteGroup(id: string): Promise<boolean> {
  const response = await api.delete(`/groups/${id}`);
  return response.data?.success || false;
}

export async function adminListUnassignedProperties(): Promise<ApiList<Property>> {
  const response = await api.get("/groups/unassigned-properties");
  return response.data;
}

export async function adminListAssignedProperties(): Promise<ApiList<Property>> {
  const response = await api.get("/groups/assigned-properties");
  return response.data;
}

export type SubscriptionPlan = {
  id: string;
  type: "MONTHLY" | "QUARTERLY" | "YEARLY" | "LIFE_TIME";
  price: number;
  createdAt: string;
  updatedAt: string;
};

export async function adminListSubscriptionPlans(): Promise<ApiList<SubscriptionPlan>> {
  const response = await api.get("/subscription-plans");
  return response.data;
}

export async function adminGetSubscriptionPlan(id: string): Promise<ApiItem<SubscriptionPlan>> {
  const response = await api.get(`/subscription-plans/${id}`);
  return response.data;
}

export async function adminCreateSubscriptionPlan(body: any): Promise<SubscriptionPlan> {
  const response = await api.post("/subscription-plans", body);
  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to create subscription plan");
  }
  return response.data.data;
}

export async function adminUpdateSubscriptionPlan(id: string, body: any): Promise<SubscriptionPlan> {
  const response = await api.patch(`/subscription-plans/${id}`, body);
  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to update subscription plan");
  }
  return response.data.data;
}

export async function adminDeleteSubscriptionPlan(id: string): Promise<boolean> {
  const response = await api.delete(`/subscription-plans/${id}`);
  return response.data?.success || false;
}

export async function checkoutSubscriptionPlan(planId: string): Promise<any> {
  const response = await api.post("/subscriptions/checkout", { planId });
  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to initiate checkout");
  }
  return response.data.data;
}

export async function mockCompleteSubscriptionPlan(planId: string): Promise<any> {
  const response = await api.post("/subscriptions/mock-complete", { planId });
  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to complete mock subscription");
  }
  return response.data;
}

export async function verifySubscriptionPaymentPlan(body: {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  planId: string;
}): Promise<any> {
  const response = await api.post("/subscriptions/verify", body);
  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to verify subscription payment");
  }
  return response.data;
}






