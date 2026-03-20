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

export interface EventImage {
  id: number;
  url: string;
  isMain: boolean;
  isThumbnail: boolean;
}

export interface EventTemplateFile {
  file: string | null;
  templateUrl: string | null;
}

export interface EventTemplates {
  invoice: EventTemplateFile;
  ticket: EventTemplateFile;
  certificate: EventTemplateFile;
}

export interface EventScheduleItem {
  id: string;
  date: string;
  time: string;
  title: string;
  description: string;
}

export interface AdditionalAsset {
  id: number;
  type: string;
  title: string;
  url: string;
}



export interface EventResponse {
  event: EventDataWithId;
  schedule: EventScheduleItem[];
  mentors: any[];
  insights: any[];
}

export const fetchData = async <T>(path: string): Promise<T> => {
  const response = await fetch(`https://booking-engine.thriive.in/data/${path}`);
  if (!response.ok) throw new Error(`Failed to fetch ${path}`);
  return response.json();
};

export const getAllData = async (eventId: string | number) => {
  const apiResponse = await fetch(`http://localhost:4000/events/${eventId}/details`);
  
  if (!apiResponse.ok) throw new Error('Event not found or API down');
  const apiData = await apiResponse.json();

  const [uiContent, config] = await Promise.all([
    fetchData<UIContent>('ui-content.json'),
    fetchData<AppConfig>('config.json')
  ]);

const eventData: EventResponse = {
  event: {
    id: apiData.EventID,
    title: apiData.EventName,
    bannerImage: apiData.bannerImage,
    date: `${apiData.EventStartDate} to ${apiData.EventEndDate}`,
    time: apiData.time || "06:00 AM",
    venue: apiData.venue || "PVI Bengaluru",
    description: apiData.description
  },
  schedule: apiData.schedules || [],
  mentors: apiData.mentors,
  insights: apiData.insights || []
};

  const plans: Plan[] = apiData.plans.map((p: any) => ({
    ...p,
    id: p.planID.toString(),
    thumbnail: p.bannerImage,
    finalPrice: p.PlanPrice,
    amenities: p.icons ? p.icons.map((i: any) => i.Title) : []
  }));

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