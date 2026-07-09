import { api } from "@/lib/axios";
import { citiesMatch } from "@/lib/locations";

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

export type UnitImage = {
  id?: string;
  unitId?: string;
  imageUrl?: string | null;
  caption?: string | null;
  imageType?: string | null;
  sortOrder?: number | null;
};

export type PropertyUnit = {
  id?: string;
  unitId?: string;
  unitType?: string | null;
  carpetAreaSqft?: number | null;
  superAreaSqft?: number | null;
  price?: string | number | null;
  availableUnits?: number | null;
  images?: UnitImage[];
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
  isFastSelling?: boolean;
  isPromising?: boolean;
  developer?: Partial<Developer> | null;
  images?: PropertyImage[];
  units?: PropertyUnit[];
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  groups?: PropertyGroup[];
  isLockedPlaceholder?: boolean;
  views?: number;
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
  members?: {
    id: string;
    createdAt: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    };
  }[];
};

export type ApiList<T> = { success?: boolean; meta?: { total?: number; page?: number; limit?: number; totalPages?: number }; data?: T[] };
export type ApiItem<T> = { success?: boolean; data?: T };

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api").replace(/\/$/, "");
const ASSET_BASE = API_BASE.replace(/\/api$/, "");

const FALLBACK_IMAGE_SET = [
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",
];

export const fallbackProperties: Property[] = [
  { id: "godrej-miraya", title: "Godrej Miraya", slug: "godrej-miraya", description: "Premium residences with group buying benefits.", propertyType: "Apartment", possessionStatus: "New Launch", city: "Gurugram", locality: "Sector 43", minPrice: "52500000", maxPrice: "90000000", isFeatured: true, isFastSelling: true, developer: { companyName: "Godrej Properties" }, images: FALLBACK_IMAGE_SET.map((url, i) => ({ imageUrl: url, sortOrder: i })), units: [{ unitType: "3 BHK", superAreaSqft: 2800, price: "52500000" }, { unitType: "4 BHK", superAreaSqft: 3900, price: "74000000" }] },
  { id: "dlf-privana-west", title: "DLF Privana West", slug: "dlf-privana-west", description: "Luxury high-rise community with strong location fundamentals.", propertyType: "Luxury Apartment", possessionStatus: "Under Construction", city: "Gurugram", locality: "Sector 76", minPrice: "62000000", maxPrice: "115000000", isFeatured: true, isPromising: true, developer: { companyName: "DLF Limited" }, images: FALLBACK_IMAGE_SET.map((url, i) => ({ imageUrl: url, sortOrder: i })), units: [{ unitType: "4 BHK", superAreaSqft: 3577, price: "62000000" }] },
  { id: "m3m-altitude", title: "M3M Altitude", slug: "m3m-altitude", description: "Signature apartments with premium amenities.", propertyType: "Apartment", possessionStatus: "Pre Launch", city: "Gurugram", locality: "Sector 65", minPrice: "41000000", maxPrice: "78000000", isFeatured: true, isPreLaunch: true, isFastSelling: true, developer: { companyName: "M3M India" }, images: FALLBACK_IMAGE_SET.map((url, i) => ({ imageUrl: url, sortOrder: i })), units: [{ unitType: "3.5 BHK", superAreaSqft: 2500, price: "41000000" }] },
  { id: "emaar-urban-ascent", title: "Emaar Urban Ascent", slug: "emaar-urban-ascent", description: "Golf course extension living with pre-launch potential.", propertyType: "Apartment", possessionStatus: "New Launch", city: "Gurugram", locality: "Golf Course Extension", minPrice: "33500000", maxPrice: "68000000", isFeatured: true, isPreLaunch: true, isPromising: true, developer: { companyName: "Emaar India" }, images: FALLBACK_IMAGE_SET.map((url, i) => ({ imageUrl: url, sortOrder: i })), units: [{ unitType: "3 BHK", superAreaSqft: 2100, price: "33500000" }] },
  { id: "trehan-iris-broadway", title: "Trehan Iris Broadway", slug: "trehan-iris-broadway", description: "Fast-selling mixed-use destination.", propertyType: "Commercial", possessionStatus: "Ready To Move", city: "Noida", locality: "Sector 85", minPrice: "18000000", maxPrice: "35000000", isFastSelling: true, developer: { companyName: "Trehan Iris" }, images: FALLBACK_IMAGE_SET.map((url, i) => ({ imageUrl: url, sortOrder: i })), units: [{ unitType: "Retail", superAreaSqft: 850, price: "18000000" }] },
  { id: "signature-titanium-spr", title: "Signature Titanium SPR", slug: "signature-titanium-spr", description: "SPR corridor apartments with group discount scope.", propertyType: "Apartment", possessionStatus: "Under Construction", city: "Gurugram", locality: "SPR", minPrice: "28500000", maxPrice: "52000000", isFeatured: true, developer: { companyName: "Signature Global" }, images: FALLBACK_IMAGE_SET.map((url, i) => ({ imageUrl: url, sortOrder: i })), units: [{ unitType: "3 BHK", superAreaSqft: 1900, price: "28500000" }] },
  { id: "whiteland-blissville", title: "Whiteland Blissville", slug: "whiteland-blissville", description: "Ready-to-move homes in Sector 76.", propertyType: "Apartment", possessionStatus: "Ready To Move", city: "Gurugram", locality: "Sector 76", minPrice: "22500000", maxPrice: "43000000", isPromising: true, developer: { companyName: "Whiteland Corporation" }, images: FALLBACK_IMAGE_SET.map((url, i) => ({ imageUrl: url, sortOrder: i })), units: [{ unitType: "2 BHK", superAreaSqft: 1400, price: "22500000" }, { unitType: "3 BHK", superAreaSqft: 2050, price: "33000000" }] },
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

const PROPERTY_CAROUSEL_FALLBACKS = [
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",
];

export function getPropertyCarouselImages(property: Property): string[] {
  const urls = [
    ...(property.images || []).map((img) => getAssetUrl(img.imageUrl)),
    ...(property.units || []).flatMap((unit) => (unit.images || []).map((img) => getAssetUrl(img.imageUrl))),
  ].filter((url): url is string => Boolean(url));

  const unique = [...new Set(urls)];
  if (unique.length >= 2) return unique;
  if (unique.length === 1) {
    return [unique[0], ...PROPERTY_CAROUSEL_FALLBACKS.filter((url) => url !== unique[0]).slice(0, 2)];
  }
  return PROPERTY_CAROUSEL_FALLBACKS;
}

function filterFallbackProperties(params?: Record<string, string | number | boolean | undefined>) {
  const city = String(params?.city || "");
  const locality = String(params?.locality || "").toLowerCase();
  const propertyType = String(params?.propertyType || "").toUpperCase();
  const maxPrice = Number(params?.maxPrice || 0);
  const search = String(params?.search || "").toLowerCase();
  const isFeatured = params?.isFeatured === true || params?.isFeatured === "true";
  const isPreLaunch = params?.isPreLaunch === true || params?.isPreLaunch === "true";
  const isFastSelling = params?.isFastSelling === true || params?.isFastSelling === "true";
  const isPromising = params?.isPromising === true || params?.isPromising === "true";

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
    const propType = (property.propertyType || "").toLowerCase();

    if (city && !citiesMatch(property.city, city)) return false;
    if (locality && !property.locality?.toLowerCase().includes(locality)) return false;
    if (propertyType === "COMMERCIAL" && propType !== "commercial") return false;
    if (propertyType === "RESIDENTIAL" && propType === "commercial") return false;
    if (maxPrice && price > maxPrice) return false;
    if (search && !text.includes(search)) return false;
    if (isFeatured && !property.isFeatured) return false;
    if (isPreLaunch && !property.isPreLaunch) return false;
    if (isFastSelling && !property.isFastSelling) return false;
    if (isPromising && !property.isPromising) return false;
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
  return result?.data?.length ? result.data : fallbackProperties.filter((item) => item.isFeatured).slice(0, 3);
}

export async function getHomeSectionProperties(flag: "isFastSelling" | "isPreLaunch" | "isFeatured" | "isPromising", limit = 10) {
  const result = await getProperties({ [flag]: true, limit });
  return result.properties.slice(0, limit);
}

export async function getProperty(idOrSlug: string, cookieHeader?: string, skipViewIncrement = false) {
  try {
    const headers = cookieHeader ? { Cookie: cookieHeader } : undefined;
    const url = `/properties/${idOrSlug}${skipViewIncrement ? "?skipViewIncrement=true" : ""}`;
    const response = await api.get(url, { headers });
    return response.data?.data || fallbackProperties.find((item) => item.slug === idOrSlug || item.id === idOrSlug) || null;
  } catch (error: any) {
    console.warn(`getProperty API call failed for ${idOrSlug}:`, error.response?.status || error.message);
    if (error.response?.status === 403 || error.response?.status === 401) {
      const parsedTitle = idOrSlug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      return {
        id: idOrSlug,
        title: parsedTitle,
        slug: idOrSlug,
        isLockedPlaceholder: true,
      } as any;
    }
    return fallbackProperties.find((item) => item.slug === idOrSlug || item.id === idOrSlug) || null;
  }
}

export async function getDevelopers() {
  const result = await safeFetch<ApiList<Developer>>("/developers?limit=30&status=ACTIVE");
  return result?.data?.length ? result.data : fallbackDevelopers;
}

export async function getPartnerDevelopers() {
  const developers = await getDevelopers();
  return developers.filter((item) => item.partnershipStatus !== "TERMINATED" && item.partnershipStatus !== "SUSPENDED");
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

export async function updateUserProfile(body: any) {
  try {
    const response = await api.patch("/auth/profile", body);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update profile");
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

export type Subscription = {
  id: string;
  userId: string;
  amount: number;
  status: "ACTIVE" | "INACTIVE";
  planId: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  plan?: SubscriptionPlan | null;
};

export async function getUserSubscriptions(): Promise<ApiList<Subscription>> {
  const response = await api.get("/subscriptions/my-subscriptions");
  return response.data;
}

export type Transection = {
  id: string;
  userId: string;
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED";
  createdAt: string;
  updatedAt: string;
};

export async function getUserTransections(): Promise<ApiList<Transection>> {
  const response = await api.get("/transections");
  return response.data;
}

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

export async function adminCreatePropertyUnit(propertyId: string, body: any): Promise<PropertyUnit> {
  const response = await api.post(`/properties/${propertyId}/units`, body);
  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to create property unit");
  }
  return response.data.data;
}

export async function adminUpdatePropertyUnit(unitId: string, body: any): Promise<PropertyUnit> {
  const response = await api.patch(`/properties/units/${unitId}`, body);
  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to update property unit");
  }
  return response.data.data;
}

export async function adminDeletePropertyUnit(unitId: string): Promise<boolean> {
  const response = await api.delete(`/properties/units/${unitId}`);
  return response.data?.success || false;
}

export async function adminUploadPropertyUnitImage(unitId: string, formData: FormData): Promise<UnitImage[]> {
  const response = await api.post(`/properties/units/${unitId}/images`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to upload unit images");
  }
  return response.data.data;
}

export async function adminDeletePropertyUnitImage(imageId: string): Promise<boolean> {
  const response = await api.delete(`/properties/units/images/${imageId}`);
  return response.data?.success || false;
}

export async function joinGroup(groupId: string): Promise<any> {
  const response = await api.post(`/groups/${groupId}/join`);
  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to join group");
  }
  return response.data;
}

export async function leaveGroup(groupId: string): Promise<any> {
  const response = await api.post(`/groups/${groupId}/leave`);
  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to leave group");
  }
  return response.data;
}

export async function getGroupMembershipStatus(groupId: string): Promise<any> {
  const response = await api.get(`/groups/${groupId}/membership-status`);
  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to fetch membership status");
  }
  return response.data.data;
}

export async function getRmGroups(params?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: "asc" | "desc";
}): Promise<ApiList<PropertyGroup>> {
  const response = await api.get("/rm/groups", { params });
  return response.data;
}

export type RmGroupsSummary = {
  totalGroups: number;
  activeGroups: number;
  formingGroups: number;
  developerAgreedGroups: number;
  totalCustomers: number;
};

export async function getRmGroupsSummary(): Promise<{ data: RmGroupsSummary }> {
  const response = await api.get("/rm/groups/summary");
  return response.data;
}

export async function updateRmGroupStatus(groupId: string, status: string): Promise<{ data: PropertyGroup }> {
  const response = await api.patch(`/rm/groups/${groupId}/status`, { status });
  return response.data;
}

export async function getUserGroups(): Promise<ApiList<PropertyGroup>> {
  const response = await api.get("/groups/user/my-groups");
  return response.data;
}

export type HeroSlide = {
  id: string;
  imageUrl: string;
  caption?: string | null;
  tagLabel?: string;
  tagAmount?: string;
  tagSubtext?: string;
  sortOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type HeroSlideTags = {
  tagLabel?: string;
  tagAmount?: string;
  tagSubtext?: string;
};

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const payload = await safeFetch<ApiItem<HeroSlide[]>>("/hero-slides");
  return (payload?.data || []).map((slide) => ({
    ...slide,
    imageUrl: getAssetUrl(slide.imageUrl) || slide.imageUrl,
  }));
}

export async function getHeroSlidesAdmin(): Promise<HeroSlide[]> {
  const response = await api.get("/hero-slides/admin");
  return response.data?.data || [];
}

export async function uploadHeroSlides(
  files: File[],
  options?: HeroSlideTags & { caption?: string; slideTags?: HeroSlideTags[] }
): Promise<HeroSlide[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));
  if (options?.caption) formData.append("caption", options.caption);
  if (options?.tagLabel) formData.append("tagLabel", options.tagLabel);
  if (options?.tagAmount) formData.append("tagAmount", options.tagAmount);
  if (options?.tagSubtext) formData.append("tagSubtext", options.tagSubtext);
  if (options?.slideTags?.length) formData.append("slideTags", JSON.stringify(options.slideTags));
  const response = await api.post("/hero-slides", formData);
  if (!response.data?.success) throw new Error(response.data?.message || "Upload failed");
  return response.data.data;
}

export async function updateHeroSlide(
  id: string,
  data: HeroSlideTags & { caption?: string; sortOrder?: number; isActive?: boolean; image?: File }
): Promise<HeroSlide> {
  const formData = new FormData();
  if (data.caption !== undefined) formData.append("caption", data.caption);
  if (data.tagLabel !== undefined) formData.append("tagLabel", data.tagLabel);
  if (data.tagAmount !== undefined) formData.append("tagAmount", data.tagAmount);
  if (data.tagSubtext !== undefined) formData.append("tagSubtext", data.tagSubtext);
  if (data.sortOrder !== undefined) formData.append("sortOrder", String(data.sortOrder));
  if (data.isActive !== undefined) formData.append("isActive", String(data.isActive));
  if (data.image) formData.append("image", data.image);
  const response = await api.patch(`/hero-slides/${id}`, formData);
  if (!response.data?.success) throw new Error(response.data?.message || "Update failed");
  return response.data.data;
}

export async function deleteHeroSlide(id: string): Promise<boolean> {
  const response = await api.delete(`/hero-slides/${id}`);
  return response.data?.success || false;
}

export type ShowcaseVideo = {
  id: string;
  title: string;
  subtitle: string;
  videoUrl: string;
  posterUrl: string;
  sortOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export async function getShowcaseVideos(): Promise<ShowcaseVideo[]> {
  const payload = await safeFetch<ApiItem<ShowcaseVideo[]>>("/showcase-videos");
  return (payload?.data || []).map((video) => ({
    ...video,
    videoUrl: getAssetUrl(video.videoUrl) || video.videoUrl,
    posterUrl: getAssetUrl(video.posterUrl) || video.posterUrl,
  }));
}

export async function getShowcaseVideosAdmin(): Promise<ShowcaseVideo[]> {
  const response = await api.get("/showcase-videos/admin");
  return response.data?.data || [];
}

export async function createShowcaseVideo(data: {
  title: string;
  subtitle: string;
  sortOrder?: number;
  video?: File;
  poster?: File;
  videoUrl?: string;
  posterUrl?: string;
}): Promise<ShowcaseVideo> {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("subtitle", data.subtitle);
  if (data.sortOrder !== undefined) formData.append("sortOrder", String(data.sortOrder));
  if (data.video) formData.append("video", data.video);
  if (data.poster) formData.append("poster", data.poster);
  if (data.videoUrl) formData.append("videoUrl", data.videoUrl);
  if (data.posterUrl) formData.append("posterUrl", data.posterUrl);
  const response = await api.post("/showcase-videos", formData);
  if (!response.data?.success) throw new Error(response.data?.message || "Create failed");
  return response.data.data;
}

export async function updateShowcaseVideo(
  id: string,
  data: {
    title?: string;
    subtitle?: string;
    sortOrder?: number;
    isActive?: boolean;
    video?: File;
    poster?: File;
    videoUrl?: string;
    posterUrl?: string;
  }
): Promise<ShowcaseVideo> {
  const formData = new FormData();
  if (data.title !== undefined) formData.append("title", data.title);
  if (data.subtitle !== undefined) formData.append("subtitle", data.subtitle);
  if (data.sortOrder !== undefined) formData.append("sortOrder", String(data.sortOrder));
  if (data.isActive !== undefined) formData.append("isActive", String(data.isActive));
  if (data.video) formData.append("video", data.video);
  if (data.poster) formData.append("poster", data.poster);
  if (data.videoUrl) formData.append("videoUrl", data.videoUrl);
  if (data.posterUrl) formData.append("posterUrl", data.posterUrl);
  const response = await api.patch(`/showcase-videos/${id}`, formData);
  if (!response.data?.success) throw new Error(response.data?.message || "Update failed");
  return response.data.data;
}

export async function deleteShowcaseVideo(id: string): Promise<boolean> {
  const response = await api.delete(`/showcase-videos/${id}`);
  return response.data?.success || false;
}

export type BlogAuthor = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  role?: string;
};

export type Blog = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string;
  coverImageUrl?: string | null;
  category: string;
  readTimeMin: number;
  isPublished?: boolean;
  createdAt: string;
  updatedAt?: string;
  author?: BlogAuthor;
};

function mapBlogCover(blog: Blog): Blog {
  return {
    ...blog,
    coverImageUrl: blog.coverImageUrl ? getAssetUrl(blog.coverImageUrl) || blog.coverImageUrl : null,
  };
}

export async function getBlogs(): Promise<Blog[]> {
  const payload = await safeFetch<ApiItem<Blog[]>>("/blogs");
  return (payload?.data || []).map(mapBlogCover);
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  const payload = await safeFetch<ApiItem<Blog>>(`/blogs/${slug}`);
  return payload?.data ? mapBlogCover(payload.data) : null;
}

export async function getBlogsAdmin(): Promise<Blog[]> {
  const response = await api.get("/blogs/admin");
  return response.data?.data || [];
}

export async function createBlog(data: {
  title: string;
  excerpt?: string;
  content: string;
  category?: string;
  readTimeMin?: number;
  isPublished?: boolean;
  coverImage?: File;
}): Promise<Blog> {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("content", data.content);
  if (data.excerpt) formData.append("excerpt", data.excerpt);
  if (data.category) formData.append("category", data.category);
  if (data.readTimeMin !== undefined) formData.append("readTimeMin", String(data.readTimeMin));
  if (data.isPublished !== undefined) formData.append("isPublished", String(data.isPublished));
  if (data.coverImage) formData.append("coverImage", data.coverImage);
  const response = await api.post("/blogs", formData);
  if (!response.data?.success) throw new Error(response.data?.message || "Create failed");
  return response.data.data;
}

export async function updateBlog(
  id: string,
  data: {
    title?: string;
    excerpt?: string;
    content?: string;
    category?: string;
    readTimeMin?: number;
    isPublished?: boolean;
    coverImage?: File;
  }
): Promise<Blog> {
  const formData = new FormData();
  if (data.title !== undefined) formData.append("title", data.title);
  if (data.excerpt !== undefined) formData.append("excerpt", data.excerpt);
  if (data.content !== undefined) formData.append("content", data.content);
  if (data.category !== undefined) formData.append("category", data.category);
  if (data.readTimeMin !== undefined) formData.append("readTimeMin", String(data.readTimeMin));
  if (data.isPublished !== undefined) formData.append("isPublished", String(data.isPublished));
  if (data.coverImage) formData.append("coverImage", data.coverImage);
  const response = await api.patch(`/blogs/${id}`, formData);
  if (!response.data?.success) throw new Error(response.data?.message || "Update failed");
  return response.data.data;
}

export async function deleteBlog(id: string): Promise<boolean> {
  const response = await api.delete(`/blogs/${id}`);
  return response.data?.success || false;
}

export type LeadInput = {
  name: string;
  email?: string;
  phone?: string;
  purpose?: "BUY" | "SELL";
  project?: string;
  city?: string;
};

export async function createLead(data: LeadInput): Promise<any> {
  const response = await api.post("/leads", data);
  if (!response.data?.success) throw new Error(response.data?.message || "Failed to create lead");
  return response.data.data;
}

export type LeadStatus = "NEW" | "CONTACTED" | "FOLLOW_UP" | "SITE_VISIT" | "NEGOTIATION" | "BOOKED" | "LOST" | "CLOSED";
export type LeadPriority = "HIGH" | "MEDIUM" | "LOW";

export type LeadNote = {
  id: string;
  text: string;
  createdAt: string;
  author: {
    firstName: string;
    lastName: string;
  };
};

export type Lead = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  purpose: "BUY" | "SELL" | null;
  status: LeadStatus;
  priority: LeadPriority;
  project: string | null;
  city: string | null;
  source: string | null;
  followUpDate: string | null;
  createdAt: string;
  _count?: { notes: number };
  notes?: LeadNote[];
};

export async function getMyLeads(params: any): Promise<{ leads: Lead[], pagination: any }> {
  const { data } = await api.get("/leads", { params });
  return data.data;
}

export async function getLeadDetails(id: string): Promise<Lead> {
  const { data } = await api.get(`/leads/${id}`);
  return data.data;
}

export async function updateLead(id: string, payload: Partial<Lead>): Promise<Lead> {
  const { data } = await api.patch(`/leads/${id}`, payload);
  return data.data;
}

export async function addLeadNote(id: string, text: string): Promise<LeadNote> {
  const { data } = await api.post(`/leads/${id}/notes`, { text });
  return data.data;
}
