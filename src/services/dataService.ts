
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

export const fetchData = async <T>(path: string): Promise<T> => {
  const response = await fetch(`http://localhost:3000/data/${path}`);
  if (!response.ok) throw new Error(`Failed to fetch ${path}`);
  return response.json();
};

export const getAllData = async (
  eventId: string | number,
  bookingId?: string | null
) => {
  const apiResponse = await fetch(`http://localhost:8081/events/${eventId}`);

  if (!apiResponse.ok) throw new Error("Event not found or API down");
  const apiData = await apiResponse.json();

  const [uiContent, config] = await Promise.all([
    fetchData<UIContent>("ui-content.json"),
    fetchData<AppConfig>("config.json"),
  ]);

  let bookingData = null;

  if (bookingId) {
    try {
      const bookingResponse = await fetch(`http://localhost:8081/bookings/${bookingId}`);
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

  const mappedPlans: Plan[] = (apiData.plans || []).map((plan: any) => ({
    ...plan,
    id: String(plan.planID ?? plan.PlanID ?? ""),
    planID: plan.planID ?? plan.PlanID,
    PlanID: plan.PlanID ?? plan.planID,
    title: plan.PlanTitle || "",
    PlanTitle: plan.PlanTitle || "",
    thumbnail:
      plan.bannerImage ||
      plan.banner ||
      plan.images?.find((img: any) => img.isMain)?.imageUrl ||
      plan.images?.find((img: any) => img.isThumbnail)?.imageUrl ||
      "https://placehold.co/400",
    description: plan.PlanDescription || "",
    PlanDescription: plan.PlanDescription || "",
    fullDescription: plan.fullDescription || "",
    discountedPrice: Number(plan.OfferPrice || 0),
    OfferPrice: Number(plan.OfferPrice || 0),
    finalPrice: Number(plan.PlanPrice || 0),
    PlanPrice: Number(plan.PlanPrice || 0),
    gstDetails: plan.gstDetails || "",
    amenities: (plan.amenities || []).map((icon: any) => ({
      id: icon.id,
      title: icon.title || "",
      iconUrl: encodeURI(icon.iconUrl || ""),
      type: icon.type || "",
      planID: icon.planID,
    })),
    images: plan.images || [],
  }));

  const mappedAddons = (apiData.addons || []).map((addon: any) => ({
    ...addon,
    id: addon.id ?? addon.AddonID,
    AddonID: addon.AddonID ?? addon.id,
    title: addon.title ?? addon.AddonTitle ?? "",
    AddonTitle: addon.AddonTitle ?? addon.title ?? "",
    description: addon.description ?? addon.AddonDescription ?? "",
    AddonDescription: addon.AddonDescription ?? addon.description ?? "",
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
      "",
    date: `${apiData.startDate} to ${apiData.endDate}`,
    time: apiData.time || "06:00 AM",
    venue: apiData.venue || "PVI Bengaluru",
    description: apiData.description,
    schedules: apiData.schedules || [],
    plans: mappedPlans || [],
    addons: mappedAddons || [],
  },
  schedules: apiData.schedules || [],
  mentors: mappedMentors,
  insights: apiData.insights || [],
  addons: mappedAddons || [],
};

  const plans: Plan[] = (apiData.plans || []).map((p: any) => ({
    ...p,
    id: String(p.planID ?? p.PlanID ?? ""),
    planID: p.planID ?? p.PlanID,
    PlanID: p.PlanID ?? p.planID,
    title: p.PlanTitle || "",
    PlanTitle: p.PlanTitle || "",
    thumbnail:
      p.bannerImage ||
      p.banner ||
      p.images?.find((img: any) => img.isMain)?.imageUrl ||
      p.images?.find((img: any) => img.isThumbnail)?.imageUrl ||
      "https://placehold.co/400",
    description: p.PlanDescription || "",
    PlanDescription: p.PlanDescription || "",
    finalPrice: Number(p.PlanPrice || 0),
    PlanPrice: Number(p.PlanPrice || 0),
    discountedPrice: Number(p.OfferPrice || 0),
    OfferPrice: Number(p.OfferPrice || 0),
    pricePerNight: Number(p.pricePerNight || 0),
    amenities: (p.amenities || []).map((icon: any) => ({
      id: icon.id,
      title: icon.title || "",
      iconUrl: encodeURI(icon.iconUrl || ""),
      type: icon.type || "",
      planID: icon.planID,
    })),
    images: p.images || [],
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

  const mappedPlans: Plan[] = (apiData.plans || []).map((plan: any) => ({
    ...plan,
    id: String(plan.planID ?? plan.PlanID ?? ""),
    planID: plan.planID ?? plan.PlanID,
    PlanID: plan.PlanID ?? plan.planID,
    title: plan.PlanTitle || "",
    PlanTitle: plan.PlanTitle || "",
    thumbnail:
      plan.bannerImage ||
      plan.banner ||
      plan.images?.find((img: any) => img.isMain)?.imageUrl ||
      plan.images?.find((img: any) => img.isThumbnail)?.imageUrl ||
      "https://placehold.co/400",
    description: plan.PlanDescription || "",
    PlanDescription: plan.PlanDescription || "",
    fullDescription: plan.fullDescription || "",
    discountedPrice: Number(plan.OfferPrice || 0),
    OfferPrice: Number(plan.OfferPrice || 0),
    finalPrice: Number(plan.PlanPrice || 0),
    PlanPrice: Number(plan.PlanPrice || 0),
    gstDetails: plan.gstDetails || "",
    amenities: (plan.amenities || []).map((icon: any) => ({
      id: icon.id,
      title: icon.title || "",
      iconUrl: encodeURI(icon.iconUrl || ""),
      type: icon.type || "",
      planID: icon.planID,
    })),
    images: plan.images || [],
  }));

  const mappedAddons = (apiData.addons || []).map((addon: any) => ({
    ...addon,
    id: addon.id ?? addon.AddonID,
    AddonID: addon.AddonID ?? addon.id,
    title: addon.title ?? addon.AddonTitle ?? "",
    AddonTitle: addon.AddonTitle ?? addon.title ?? "",
    description: addon.description ?? addon.AddonDescription ?? "",
    AddonDescription: addon.AddonDescription ?? addon.description ?? "",
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
      slug: apiData.slug || "",
      banner:
        apiData.banner ||
        apiData.images?.find((img: any) => img.isMain)?.url ||
        apiData.images?.find((img: any) => img.isThumbnail)?.url ||
        "",
      date: `${apiData.startDate} to ${apiData.endDate}`,
      time: apiData.time || "06:00 AM",
      venue: apiData.venue || "PVI Bengaluru",
      description: apiData.description,
      schedules: apiData.schedules || [],
      plans: mappedPlans || [],
      addons: mappedAddons || [],
    },
    schedules: apiData.schedules || [],
    mentors: mappedMentors,
    insights: apiData.insights || [],
    addons: mappedAddons || [],
  };

  const plans: Plan[] = (apiData.plans || []).map((p: any) => ({
    ...p,
    id: String(p.planID ?? p.PlanID ?? ""),
    planID: p.planID ?? p.PlanID,
    PlanID: p.PlanID ?? p.planID,
    title: p.PlanTitle || "",
    PlanTitle: p.PlanTitle || "",
    thumbnail:
      p.bannerImage ||
      p.banner ||
      p.images?.find((img: any) => img.isMain)?.imageUrl ||
      p.images?.find((img: any) => img.isThumbnail)?.imageUrl ||
      "https://placehold.co/400",
    description: p.PlanDescription || "",
    PlanDescription: p.PlanDescription || "",
    finalPrice: Number(p.PlanPrice || 0),
    PlanPrice: Number(p.PlanPrice || 0),
    discountedPrice: Number(p.OfferPrice || 0),
    OfferPrice: Number(p.OfferPrice || 0),
    pricePerNight: Number(p.pricePerNight || 0),
    amenities: (p.amenities || []).map((icon: any) => ({
      id: icon.id,
      title: icon.title || "",
      iconUrl: encodeURI(icon.iconUrl || ""),
      type: icon.type || "",
      planID: icon.planID,
    })),
    images: p.images || [],
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
  const response = await fetch('http://localhost:8081/bookings', { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create booking');
  }

  return response.json();
};

