
import { EventData, Plan } from '../../types';

export interface UIContent {
  landingPage: any;
  planSelection: any;
  guestForm: any;
  bookingSummary: any;
}

export interface AppConfig {
  TAX_RATE: number;
  STUDENT_DISCOUNT_PERCENT: number;
  SERVICE_DISCOUNT_PERCENT: number;
  KIDS_DISCOUNT_PERCENT: number;
  ADDONS: {
    FOOD_PASS: number;
    ADVENTURE_PASS: number;
    EXTRA_STAY_BASE: number;
  };
  COUPONS: any[];
  ROOM_TYPES: any[];
}

export interface EventResponse {
  event: EventData;
  schedules: any[];
  mentors: any;
  insights: any[];
  addons?: any[]; // ✅ add this
}

const EVENT_BANNER_FALLBACK =
  'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=1600&auto=format&fit=crop';
const EVENT_DESCRIPTION_FALLBACK =
  'Event details will be updated soon. Please continue to explore plans and booking options for this retreat at Pyramid Valley International.';

const normalizeVenueText = (value: unknown): string => {
  if (typeof value !== 'string') return '';

  return value
    .replace(/Soul fuel Cafe/gi, 'Pyramid Valley International dining hall')
    .replace(/Soul Nest In/gi, 'Pyramid Valley International')
    .replace(/Soul Nest dining/gi, 'Pyramid Valley International dining hall')
    .replace(/Meals at Soul Nest/gi, 'Meals at Pyramid Valley International')
    .replace(/Meals at Annadana/gi, 'Meals at Pyramid Valley International')
    .replace(/Annadana hall/gi, 'Pyramid Valley International dining hall')
    .replace(/\bAnnadana\b/gi, 'Pyramid Valley International')
    .replace(/\bSoul Nest\b/gi, 'Pyramid Valley International');
};

const getNormalizedGstFields = (item: any) => {
  const rawType = String(item?.gstType || '').trim().toLowerCase();
  const gstType =
    rawType === 'inclusive' || rawType === 'exclusive' ? rawType : '';
  const gstRate = Number(item?.gstRate ?? 0);

  if (!Number.isFinite(gstRate) || gstRate <= 0) {
    return {
      gstType,
      gstRate: 0,
      gstDetails: '',
    };
  }

  if (gstType === 'inclusive') {
    return {
      gstType,
      gstRate,
      gstDetails: 'Inclusive of GST',
    };
  }

  if (gstType === 'exclusive') {
    return {
      gstType,
      gstRate,
      gstDetails: `+ ${gstRate}% GST`,
    };
  }

  return {
    gstType: '',
    gstRate,
    gstDetails: item?.gstDetails || '',
  };
};

const PLAN_IMAGE_FALLBACK = 'https://placehold.co/400';
const DEFAULT_PLAN_COLOR = '#0f766e';
const REQUIRED_ADMIN_PLAN_FIELDS = [
  'PlanName',
  'PlanSubtitle',
  'planColor',
  'banner',
  'bannerImage',
  'fullDescription',
  'maxPax',
] as const;

type RequiredAdminPlanField = (typeof REQUIRED_ADMIN_PLAN_FIELDS)[number];

const isBlankAdminValue = (value: unknown) =>
  value === null || value === undefined || value === '';

const normalizeOptionalText = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return normalizeVenueText(value).trim();
};

const getPrimaryPlanImage = (plan: any): string => {
  return (
    plan.bannerImage ||
    plan.banner ||
    plan.images?.find((img: any) => img.isMain)?.imageUrl ||
    plan.images?.find((img: any) => img.isThumbnail)?.imageUrl ||
    plan.images?.[0]?.imageUrl ||
    PLAN_IMAGE_FALLBACK
  );
};

const getPlanSubtitle = (plan: any): string => {
  return normalizeOptionalText(
    plan.PlanSubtitle ||
      plan.stayRoomType ||
      plan.subtitle ||
      plan.roomType ||
      ''
  );
};

const getPlanDescription = (plan: any): string => {
  return normalizeOptionalText(
    plan.PlanDescription ||
      plan.description ||
      plan.shortDescription ||
      ''
  );
};

const getPlanFullDescription = (plan: any, fallbackDescription: string): string => {
  return normalizeOptionalText(
    plan.fullDescription ||
      plan.longDescription ||
      plan.PlanDescription ||
      plan.description ||
      fallbackDescription
  );
};

const getPlanMaxPax = (plan: any): number => {
  const rawMaxPax =
    plan.maxPax ??
    plan.maxOccupancy ??
    plan.maxGuests ??
    plan.capacity ??
    plan.occupancy;

  const maxPax = Number(rawMaxPax ?? 0);
  return Number.isFinite(maxPax) && maxPax > 0 ? maxPax : 1;
};

const PLAN_FEATURE_KEYS = [
  'planFeatures',
  'plan_features',
  'PlanFeatures',
  'PlanFeature',
  'featureList',
  'feature_list',
  'features',
] as const;

const parseFeatureCollection = (rawValue: any): any[] => {
  let parsedValue = rawValue;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (Array.isArray(parsedValue)) {
      return parsedValue;
    }

    if (typeof parsedValue === 'string') {
      const trimmedValue = parsedValue.trim();
      if (!trimmedValue) return [];

      try {
        parsedValue = JSON.parse(trimmedValue);
        continue;
      } catch {
        return [];
      }
    }

    if (parsedValue && typeof parsedValue === 'object') {
      if (Array.isArray(parsedValue.items)) {
        parsedValue = parsedValue.items;
        continue;
      }

      return Object.values(parsedValue);
    }

    return [];
  }

  if (Array.isArray(parsedValue)) {
    return parsedValue;
  }

  if (parsedValue && typeof parsedValue === 'object') {
    return Object.values(parsedValue);
  }

  return [];
};

const getRawPlanFeatures = (plan: any): any[] => {
  for (const key of PLAN_FEATURE_KEYS) {
    const parsedFeatures = parseFeatureCollection(plan?.[key]);
    if (parsedFeatures.length > 0) {
      return parsedFeatures;
    }
  }

  return [];
};

const getPlanLabel = (normalizedPlan: Partial<Plan>) =>
  normalizedPlan.PlanTitle ||
  normalizedPlan.PlanName ||
  `Plan ${normalizedPlan.planID ?? ''}`.trim();

const getMissingAdminPlanFields = (plan: any): RequiredAdminPlanField[] =>
  REQUIRED_ADMIN_PLAN_FIELDS.filter((fieldName) => isBlankAdminValue(plan?.[fieldName]));

const validateAdminPlanData = (plan: any, normalizedPlan: Partial<Plan>) => {
  const missingFields = getMissingAdminPlanFields(plan);

  if (missingFields.length > 0) {
    console.warn(
      `[plan-admin-validation] ${getPlanLabel(normalizedPlan)} is missing admin fields: ${missingFields.join(', ')}`
    );
  }

  return missingFields;
};

const logAdminPlanValidationSummary = (rawPlans: any[], normalizedPlans: Plan[]) => {
  const planIssues = rawPlans
    .map((plan, index) => ({
      planLabel: getPlanLabel(normalizedPlans[index] || {}),
      missingFields: getMissingAdminPlanFields(plan),
    }))
    .filter((entry) => entry.missingFields.length > 0);

  if (!planIssues.length) return;

  const missingFieldCounts = REQUIRED_ADMIN_PLAN_FIELDS.reduce(
    (acc, fieldName) => {
      acc[fieldName] = planIssues.filter((entry) =>
        entry.missingFields.includes(fieldName)
      ).length;
      return acc;
    },
    {} as Record<RequiredAdminPlanField, number>
  );

  const totalPlans = rawPlans.length;
  const fieldsMissingForAllPlans = REQUIRED_ADMIN_PLAN_FIELDS.filter(
    (fieldName) => totalPlans > 0 && missingFieldCounts[fieldName] === totalPlans
  );

  if (fieldsMissingForAllPlans.length > 0) {
    console.error(
      `[plan-admin-validation] Admin data is incomplete for all ${totalPlans} plans. Populate these fields in admin: ${fieldsMissingForAllPlans.join(', ')}`
    );
  }

  console.warn(
    '[plan-admin-validation] Missing field counts by admin field:',
    missingFieldCounts
  );
};

const normalizePlan = (plan: any): Plan => {
  const normalizedTitle = normalizeOptionalText(
    plan.PlanTitle || plan.PlanName || plan.title || ''
  );
  const normalizedSubtitle = getPlanSubtitle(plan);
  const normalizedDescription = getPlanDescription(plan);
  const normalizedFullDescription = getPlanFullDescription(plan, normalizedDescription);
  const primaryImage = getPrimaryPlanImage(plan);
  const planPrice = Number(plan.PlanPrice || 0);
  const offerPrice = Number(plan.OfferPrice || 0);
  const effectivePrice = offerPrice > 0 ? offerPrice : planPrice;

  const normalizedPlan: Plan = {
    ...plan,
    ...getNormalizedGstFields(plan),
    id: String(plan.planID ?? plan.PlanID ?? ''),
    planID: plan.planID ?? plan.PlanID,
    PlanID: plan.PlanID ?? plan.planID,
    PlanName: normalizeOptionalText(plan.PlanName || normalizedTitle),
    priceType: plan.priceType || '',
    remainingInventory: Number(plan.remainingInventory ?? 0),
    title: normalizedTitle,
    sequence: Number(plan.sequence ?? 0),
    PlanTitle: normalizedTitle,
    PlanSubtitle: normalizedSubtitle,
    thumbnail: primaryImage,
    banner: primaryImage,
    bannerImage: normalizeOptionalText(plan.bannerImage || primaryImage),
    description: normalizedDescription,
    stayRoomType: normalizeOptionalText(plan.stayRoomType || normalizedSubtitle),
    PlanDescription: normalizedDescription,
    fullDescription: normalizedFullDescription,
    longDescription: normalizeOptionalText(plan.longDescription || normalizedFullDescription),
    planColor: normalizeOptionalText(plan.planColor || DEFAULT_PLAN_COLOR),
    maxPax: getPlanMaxPax(plan),
    PlanPrice: planPrice,
    OfferPrice: offerPrice,
    discountedPrice: effectivePrice,
    finalPrice: planPrice,
    isSoldOut: Boolean(plan.isSoldOut),
    availableRooms: Number(
      plan.availableRooms ?? plan.inventory?.availableRooms ?? plan.remainingInventory ?? 0
    ),
    inventory: {
      ...(plan.inventory || {}),
      availableRooms: Number(
        plan.inventory?.availableRooms ?? plan.availableRooms ?? plan.remainingInventory ?? 0
      ),
    },
    amenities: (plan.amenities || []).map((icon: any) => ({
      id: icon.id,
      title: normalizeOptionalText(icon.title || icon.Title || ''),
      iconUrl: encodeURI(icon.iconUrl || icon.IconUrl || ''),
      type: icon.type || '',
      planID: icon.planID,
    })),
    planFeatures: getRawPlanFeatures(plan)
      .map((feature: any, index: number) => ({
          id: String(feature?.id || `feature-${plan.planID || plan.PlanID || 'plan'}-${index}`),
          label: normalizeOptionalText(feature?.label || feature?.Label || feature?.title || feature?.Title || ''),
          value: normalizeOptionalText(feature?.value || feature?.Value || feature?.description || ''),
          icon: normalizeOptionalText(feature?.icon || feature?.Icon || feature?.iconName || 'check'),
        }))
      .filter((feature: any) => feature?.label || feature?.value),
    images: Array.isArray(plan.images) ? plan.images : [],
  };

  validateAdminPlanData(plan, normalizedPlan);
  return normalizedPlan;
};

export const fetchData = async <T>(path: string): Promise<T> => {
  const response = await fetch(`http://localhost:3001/data/${path}`);
  if (!response.ok) throw new Error(`Failed to fetch ${path}`);
  return response.json();
};

export const getAllData = async (
  eventId: string | number,
  bookingId?: string | null
) => {
  const apiResponse = await fetch(`https://bookingapi.thriive.in/events/${eventId}`);

  if (!apiResponse.ok) throw new Error("Event not found or API down");
  const apiData = await apiResponse.json();
console.log(
  'apiData plans sequence',
  (apiData.plans || []).map((p: any) => ({
    title: p.PlanTitle,
    sequence: p.sequence,
  }))
);
  const [uiContent, config] = await Promise.all([
    fetchData<UIContent>("ui-content.json"),
    fetchData<AppConfig>("config.json"),
  ]);

  let bookingData = null;

  if (bookingId) {
    try {
      const bookingResponse = await fetch(`https://bookingapi.thriive.in/bookings/${bookingId}`);
      if (bookingResponse.ok) {
        bookingData = await bookingResponse.json();
      } else {
        console.warn("Booking fetch failed:", bookingResponse.status);
      }
    } catch (error) {
      console.warn("Booking fetch error:", error);
    }
  }

  const mappedMentors = {
    main: apiData.mentors?.[0]
      ? {
          name: apiData.mentors[0].name || "",
          role: apiData.mentors[0].role || "",
          bio: apiData.mentors[0].bio || "",
          img: apiData.mentors[0].img || "https://placehold.co/400x500?text=Mentor",
        }
      : {
          name: "Coming Soon",
          role: "",
          bio: "",
          img: "https://placehold.co/400x500?text=Mentor",
        },

    others: (apiData.mentors || []).slice(1).map((mentor: any) => ({
      name: mentor.name || "",
      role: mentor.role || "",
      bio: mentor.bio || "",
      img: mentor.img || "https://via.placeholder.com/200x200?text=Mentor",
    })),
  };

  const rawPlans = apiData.plans || [];
  const mappedPlans: Plan[] = rawPlans.map(normalizePlan);
  logAdminPlanValidationSummary(rawPlans, mappedPlans);

  const mappedAddons = (apiData.addons || []).map((addon: any) => ({
    ...addon,
    id: addon.id ?? addon.AddonID,
    AddonID: addon.AddonID ?? addon.id,
    title: normalizeVenueText(addon.title ?? addon.AddonTitle ?? ""),
    AddonTitle: normalizeVenueText(addon.AddonTitle ?? addon.title ?? ""),
    description: normalizeVenueText(addon.description ?? addon.AddonDescription ?? ""),
    AddonDescription: normalizeVenueText(addon.AddonDescription ?? addon.description ?? ""),
    type: addon.type ?? "",
    adultPrice:
      addon.adultPrice ??
      addon.AdultsperDay ??
      addon.AdultSeasonAmt ??
      addon.price ??
      0,
    kidPrice:
      addon.kidPrice ??
      addon.KidsperDay ??
      addon.KidsSeasonAmt ??
      addon.price ??
      0,
    planIds: addon.planIds ?? addon.planID ?? [],
    eventIds: addon.eventIds ?? addon.EventID ?? [],
    bannerImage: addon.bannerImage || "",
    isActive: addon.isActive ?? 1,
    isVisible: addon.isVisible ?? true,
  }));

 const eventData: EventResponse = {
  event: {
    id: apiData.EventID,
    EventID: apiData.EventID,
    title: apiData.EventName,
  
    EventName: apiData.EventName,
    slug: apiData.slug || "", // ✅ add this
    banner:
      apiData.banner ||
      apiData.images?.find((img: any) => img.isMain)?.url ||
      apiData.images?.find((img: any) => img.isThumbnail)?.url ||
      EVENT_BANNER_FALLBACK,
    date: `${apiData.startDate} to ${apiData.endDate}`,
    startDate: apiData.startDate || '',
    endDate: apiData.endDate || '',
    time: apiData.time || "06:00 AM",
    venue: normalizeVenueText(apiData.venue || "Pyramid Valley International, Bengaluru"),
    description: normalizeVenueText(apiData.description) || EVENT_DESCRIPTION_FALLBACK,
    schedules: apiData.schedules || [],
    plans: mappedPlans || [],
    addons: mappedAddons || [],
  },
  schedules: apiData.schedules || [],
  mentors: mappedMentors,
  insights: apiData.insights || [],
  addons: mappedAddons || [],
};

  const plans: Plan[] = rawPlans
    .map(normalizePlan)
    .map((plan: Plan) => ({
      ...plan,
      pricePerNight: Number((plan as any).pricePerNight || 0),
    }))
    .sort((a: any, b: any) => Number(a.sequence || 0) - Number(b.sequence || 0));

  return {
    eventData,
    plans,
    addons: mappedAddons,
    uiContent,
    config,
    bookingData,
  };
};

export const getAllDataBySlug = async (
  slug: string,
  bookingId?: string | null
) => {
  const apiResponse = await fetch(`https://bookingapi.thriive.in/events/slug/${slug}`);

  if (!apiResponse.ok) throw new Error("Event not found or API down");
  const apiData = await apiResponse.json();

  const [uiContent, config] = await Promise.all([
    fetchData<UIContent>("ui-content.json"),
    fetchData<AppConfig>("config.json"),
  ]);

  let bookingData = null;

  if (bookingId) {
    try {
      const bookingResponse = await fetch(`https://bookingapi.thriive.in/bookings/${bookingId}`);
      if (bookingResponse.ok) {
        bookingData = await bookingResponse.json();
      } else {
        console.warn("Booking fetch failed:", bookingResponse.status);
      }
    } catch (error) {
      console.warn("Booking fetch error:", error);
    }
  }

  const mappedMentors = {
    main: apiData.mentors?.[0]
      ? {
          name: apiData.mentors[0].name || "",
          role: apiData.mentors[0].role || "",
          bio: apiData.mentors[0].bio || "",
          img: apiData.mentors[0].img || "https://placehold.co/400x500?text=Mentor",
        }
      : {
          name: "Coming Soon",
          role: "",
          bio: "",
          img: "https://placehold.co/400x500?text=Mentor",
        },

    others: (apiData.mentors || []).slice(1).map((mentor: any) => ({
      name: mentor.name || "",
      role: mentor.role || "",
      bio: mentor.bio || "",
      img: mentor.img || "https://via.placeholder.com/200x200?text=Mentor",
    })),
  };

  const rawPlans = apiData.plans || [];
  const mappedPlans: Plan[] = rawPlans
    .map(normalizePlan)
    .sort((a: any, b: any) => Number(a.sequence || 0) - Number(b.sequence || 0));
  logAdminPlanValidationSummary(rawPlans, mappedPlans);
  const mappedAddons = (apiData.addons || []).map((addon: any) => ({
    ...addon,
    id: addon.id ?? addon.AddonID,
    AddonID: addon.AddonID ?? addon.id,
    title: normalizeVenueText(addon.title ?? addon.AddonTitle ?? ""),
    AddonTitle: normalizeVenueText(addon.AddonTitle ?? addon.title ?? ""),
    description: normalizeVenueText(addon.description ?? addon.AddonDescription ?? ""),
    AddonDescription: normalizeVenueText(addon.AddonDescription ?? addon.description ?? ""),
    type: addon.type ?? "",
    adultPrice:
      addon.adultPrice ??
      addon.AdultsperDay ??
      addon.AdultSeasonAmt ??
      addon.price ??
      0,
    kidPrice:
      addon.kidPrice ??
      addon.KidsperDay ??
      addon.KidsSeasonAmt ??
      addon.price ??
      0,
    planIds: addon.planIds ?? addon.planID ?? [],
    eventIds: addon.eventIds ?? addon.EventID ?? [],
    bannerImage: addon.bannerImage || "",
    isActive: addon.isActive ?? 1,
    isVisible: addon.isVisible ?? true,
  }));

  const eventData: EventResponse = {
    event: {
      id: apiData.EventID,
      EventID: apiData.EventID,
      title: normalizeVenueText(apiData.EventName),
      EventName: normalizeVenueText(apiData.EventName),
      slug: apiData.slug || "",
      banner:
        apiData.banner ||
        apiData.images?.find((img: any) => img.isMain)?.url ||
        apiData.images?.find((img: any) => img.isThumbnail)?.url ||
        EVENT_BANNER_FALLBACK,
      date: `${apiData.startDate} to ${apiData.endDate}`,
      time: apiData.time || "06:00 AM",
      venue: normalizeVenueText(apiData.venue || "Pyramid Valley International, Bengaluru"),
      description: normalizeVenueText(apiData.description) || EVENT_DESCRIPTION_FALLBACK,
      schedules: apiData.schedules || [],
      plans: mappedPlans || [],
      addons: mappedAddons || [],
    },
    schedules: apiData.schedules || [],
    mentors: mappedMentors,
    insights: apiData.insights || [],
    addons: mappedAddons || [],
  };

  const plans: Plan[] = rawPlans.map(normalizePlan).map((plan: Plan) => ({
    ...plan,
    pricePerNight: Number((plan as any).pricePerNight || 0),
  }));

  return {
    eventData,
    plans,
    addons: mappedAddons,
    uiContent,
    config,
    bookingData,
  };
};
export const createBooking = async (bookingData: any) => {
  const response = await fetch('https://bookingapi.thriive.in/bookings', { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    const message =
      error?.message ||
      error?.error ||
      'We could not create your booking right now. Please try again.';
    throw new Error(message);
  }

  return response.json();
};
