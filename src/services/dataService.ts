
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
  const response = await fetch(`/data/${path}`);
  if (!response.ok) throw new Error(`Failed to fetch ${path}`);
  return response.json();
};

export const getAllData = async (eventId: string | number) => {
  const apiResponse = await fetch(`http://localhost:8081/events/${eventId}`);
  if (!apiResponse.ok) throw new Error('Event not found or API down');
  const apiData = await apiResponse.json();

  const [uiContent, config] = await Promise.all([
    fetchData<UIContent>('ui-content.json'),
    fetchData<AppConfig>('config.json')
  ]);

  // 1. Map Plans (Using the "banner" key from your JSON)
  const mappedPlans: Plan[] = (apiData.plans || []).map((plan: any) => ({
    id: String(plan.planID),
    title: plan.PlanTitle || "",
    // Your JSON uses "banner" for the Picsum link
    thumbnail: plan.banner || `https://picsum.photos/seed/plan${plan.planID}/800/600`,
    description: plan.PlanDescription || "",
    fullDescription: plan.fullDescription || "",
    discountedPrice: Number(plan.OfferPrice || 0),
    finalPrice: Number(plan.PlanPrice || 0),
    gstDetails: plan.gstDetails || "Inclusive of GST",
    amenities: (plan.amenities || []).map((icon: any) => ({
      id: icon.id,
      title: icon.title || "",
      iconUrl: encodeURI(icon.iconUrl || ""),
      type: icon.type || "",
      planID: icon.planID,
    })),
  }));

  // 2. Map Event Data (Using the top-level "banner" and "schedules")
  const eventData: EventResponse = {
    event: {
      id: apiData.EventID,
      title: apiData.EventName,
      banner: apiData.banner || "https://picsum.photos/seed/event41/1200/600",
      date: `${apiData.startDate} to ${apiData.endDate}`,
      time: apiData.time || "06:00 AM",
      venue: apiData.venue || "PVI Bengaluru",
      description: apiData.description,
      schedules: apiData.schedules || [],
      plans: mappedPlans,
    },
    schedules: apiData.schedules || [],
    mentors: {
      main: apiData.mentors?.[0] || null,
      others: apiData.mentors?.slice(1) || []
    },
    insights: apiData.insights || []
  };

  // 3. RETURN: Crucial to use mappedPlans here
  return {
    eventData,
    plans: mappedPlans, 
    uiContent,
    config
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
