import { EventData, Plan } from '../../types';

// 1. Locally extend EventData so TypeScript knows about 'id'
// without having to modify the external types file.
type EventDataWithId = EventData & { id: number | string };

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
  event: EventDataWithId; // Use our local type here
  schedule: any[];
  mentors: any;
  insights: any[];
}

export const fetchData = async <T>(path: string): Promise<T> => {
  const response = await fetch(`/data/${path}`);
  if (!response.ok) throw new Error(`Failed to fetch ${path}`);
  return response.json();
};

export const getAllData = async (eventId: string | number) => {
  const apiResponse = await fetch(`https://bookingapi.thriive.in/events/${eventId}/details`);
  
  if (!apiResponse.ok) throw new Error('Event not found or API down');
  const apiData = await apiResponse.json();

  const [uiContent, config] = await Promise.all([
    fetchData<UIContent>('ui-content.json'),
    fetchData<AppConfig>('config.json')
  ]);

  // Transform Event Data safely
  const eventData: EventResponse = {
    event: {
      id: apiData.EventID,
      title: apiData.EventName || "Untitled Event",
      banner: apiData.bannerImage || "https://picsum.photos/seed/event/1200/600",
      date: apiData.EventStartDate && apiData.EventEndDate 
            ? `${apiData.EventStartDate} to ${apiData.EventEndDate}` 
            : "Dates TBD",
      time: apiData.time || "06:00 AM Daily",
      venue: apiData.venue || apiData.Location || "Venue TBD",
      description: apiData.description || ""
    },
    // Ensure schedule is parsed if it comes as a JSON string from MySQL
    schedule: (apiData.schedules || []).map((s: any) => ({
      ...s,
      slots: typeof s.slots === 'string' ? JSON.parse(s.slots) : (s.slots || [])
    })),
    // Safe parse for mentors and insights
    mentors: typeof apiData.mentors === 'string' ? JSON.parse(apiData.mentors) : (apiData.mentors || { main: {}, others: [] }),
    insights: typeof apiData.insights === 'string' ? JSON.parse(apiData.insights) : (apiData.insights || [])
  };

  // Transform Plans safely to avoid .toLocaleString() null errors
  const plans: Plan[] = (apiData.plans || []).map((p: any) => {
    // Logic: If OfferPrice exists and isn't 0, that's our final price. 
    // Otherwise, use the base PlanPrice.
    const hasOffer = p.OfferPrice !== null && p.OfferPrice !== undefined && p.OfferPrice > 0;
    
    return {
      id: p.planID.toString(),
      title: p.PlanTitle || "Standard Plan",
      thumbnail: p.bannerImage || "https://picsum.photos/seed/plan/800/600",
      description: p.PlanSubtitle || p.PlanDescription?.substring(0, 100) || "",
      fullDescription: p.PlanDescription || p.fullDescription || "",
      // Fixes the crash: ensure these are always valid numbers
      discountedPrice: Number(p.PlanPrice) || 0,
      finalPrice: hasOffer ? Number(p.OfferPrice) : Number(p.PlanPrice),
      gstDetails: p.gstType === 'inclusive' ? 'Inclusive of GST' : `+ ${p.gstRate || 0}% GST`,
      amenities: p.icons ? p.icons.map((i: any) => i.Title) : ["Standard Amenities"]
    };
  });

  return {
    eventData,
    plans,
    uiContent,
    config
  };
};


export const getApplicableCoupons = async (eventId: string | number, planId: string | number) => {
  try {
    const response = await fetch(`http://localhost:8081/coupons/applicable?eventId=${eventId}&planId=${planId}`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return [];
  }
};





export const createBooking = async (bookingData: any) => {
  const response = await fetch('https://bookingapi.thriive.in/bookings', { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData),
  });

  // We must await the json() here so the component gets the actual data
  const result = await response.json(); 
  
  if (!response.ok) {
    throw new Error(result.message || 'Failed to create booking');
  }

  return result; // This now contains { bookingId: "BK..." }
};



export const fetchActiveEvents = async () => {
  try {
    const response = await fetch('http://localhost:8081/events');
    if (!response.ok) throw new Error('Failed to fetch events list');
    const data = await response.json();
    
    return data.filter((event: any) => event.isActive !== false);
  } catch (error) {
    console.error("Discovery Fetch Error:", error);
    return [];
  }
};