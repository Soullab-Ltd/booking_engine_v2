
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
}

export const fetchData = async <T>(path: string): Promise<T> => {
  const response = await fetch(`http://localhost:3000/data/${path}`);
  if (!response.ok) throw new Error(`Failed to fetch ${path}`);
  return response.json();
};

export const getAllData = async (eventId: string | number) => {
  const apiResponse = await fetch(`https://bookingapi.thriive.in/events/${eventId}`);
  
  if (!apiResponse.ok) throw new Error('Event not found or API down');
  const apiData = await apiResponse.json();

  const [uiContent, config] = await Promise.all([
    fetchData<UIContent>('ui-content.json'),
    fetchData<AppConfig>('config.json')
  ]);
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
const mappedPlans: Plan[] = (apiData.plans || []).map((plan: any) => {
  console.log("RAW PLAN:", plan);
  console.log("RAW ICONS:", plan.amenities);

  return {
    id: String(plan.planID),
    title: plan.PlanTitle || "",
    thumbnail:
      plan.banner ||
      plan.images?.find((img: any) => img.isMain)?.imageUrl ||
      plan.images?.find((img: any) => img.isThumbnail)?.imageUrl ||
      "https://placehold.co/400",
    description: plan.PlanDescription || "",
    fullDescription: plan.fullDescription || "",
    discountedPrice: Number(plan.OfferPrice || 0),
    finalPrice: Number(plan.PlanPrice || 0),
    gstDetails: plan.gstDetails || "",

    amenities: (plan.amenities || []).map((icon: any) => ({
      id: icon.id,
      title: icon.title || "",
      iconUrl: encodeURI(icon.iconUrl || ""),
      type: icon.type || "",
      planID: icon.planID,
    })),
   /*  icons: (plan.icons || []).map((icon: any) => ({
      id: icon.id,
      title: icon.title || "",
      iconUrl: encodeURI(icon.iconUrl || ""),
      type: icon.type || "",
      planID: icon.planID,
    })), */
  };
});
const eventData: EventResponse = {
  event: {
    id: apiData.EventID,
    title: apiData.EventName,
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
  },
  schedules: apiData.schedules || [],
  mentors: mappedMentors,
  insights: apiData.insights || []
};

  const plans: Plan[] = apiData.plans.map((p: any) => ({
    ...p,
    id: p.planID.toString(),
    thumbnail: p.bannerImage,
    finalPrice: p.PlanPrice,
   amenities: (p.amenities || []).map((icon: any) => ({
      id: icon.id,
      title: icon.title || "",
      iconUrl: encodeURI(icon.iconUrl || ""),
      type: icon.type || "",
      planID: icon.planID,
    })), }));

  return {
    eventData,
    plans,
    uiContent,
    config
  };
};

export const createBooking = async (bookingData: any) => {
  const response = await fetch('https://bookingapi.thriive.in/bookings', { 
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
