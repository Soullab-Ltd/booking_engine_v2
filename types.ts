
export enum FoodPreference {
  REGULAR = 'Regular',
  JAIN = 'Jain'
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface SelectedAddon {
  addonId: string;
  title: string;
  description?: string;
  type?: string;
  price?: number;
  quantity?: number;
  isPricePerNight?: boolean;
  bannerImage?: string;
}

export interface Guest {
  id: string;
  name: string;
  phone: string;
  phoneNumber?: string;
  email: string;
  age?: number;
  isKidsPlanOpted: boolean;
  foodPreference: FoodPreference;
  travelAssistance: boolean;

  addOns: {
    foodPass: boolean;
    adventurePass: boolean;
    selectedAddons?: SelectedAddon[];
    extraStay: {
      enabled: boolean;
      days: number;
      type: string;
      startDate: string;
    };
  };
  remark: string;

  gender: string | null;
  city: string;  
  state: string; 
  country: string;
}



export interface PlanIcon {
  id?: number | string;
  title?: string;
  Title?: string;
  iconUrl?: string;
  type?: string;
  planID?: number | string;
}

export type PlanAmenity = PlanIcon | string;

export interface ScheduleSlot {
  time: string;
  title: string;
  description: string;
}

export interface ScheduleDay {
  day: string;
  date: string;
  slots: ScheduleSlot[];
}

export interface Plan {
  id?: string;
  planID?: number;
  PlanID?: number;
  PlanName?: string;
  priceType?: string;
  remainingInventory?: number;
  title?: string;
  sequence?: number;
  PlanTitle?: string;
  PlanSubtitle?: string;
  thumbnail?: string;
  banner?: string | null;
  bannerImage?: string;
  description?: string;
  stayRoomType?: string;
  PlanDescription?: string;
  fullDescription?: string;
  longDescription?: string;
  planColor?: string;
  maxPax?: number;
  PlanPrice?: number;
  OfferPrice?: number;
  discountedPrice?: number;
  finalPrice?: number;
  gstDetails?: string;
  amenities?: PlanAmenity[];
  icons?: PlanAmenity[];
  isSpecialPlan?: boolean | number;
  isSoldOut?: boolean;
  availableRooms?: number;
  inventory?: {
    availableRooms?: number;
  };
  tag?: string;
  images?: {
    id: number;
    imageUrl: string;
    isMain: boolean;
    isThumbnail: boolean;
  }[];
}

export interface EventData {
  id?: number | string;
  EventID?: number | string;
  title: string;
  slug?: string;
  EventName?: string;
  banner?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  EndDate?: string;
  eventEndDate?: string;
  EventEndDate?: string;
  EventStartDate?: string;
  displayDate?: string;
  time?: string;
  venue?: string;
  Venue?: string;
  location?: string;
  description?: string;
  schedules?: any[];
  plans?: any[];
  addons?: any[];
  mentors?: any;
  insights?: any[];
  otherInfoLinks?: Array<{
    title?: string;
    label?: string;
    url?: string;
    link?: string;
  }>;
  additionalLinks?: Array<{
    title?: string;
    label?: string;
    url?: string;
    link?: string;
  }>;
  termsUrl?: string;
  refundPolicyUrl?: string;
  faqsUrl?: string;
  codeOfConductUrl?: string;
}

export interface DiscountInfo {
  type: 'STUDENT' | 'SERVICE' | 'COUPON' | 'NONE';
  amount: number;
  idProofName?: string;
  couponCode?: string;
}

export interface BookingState {
  currentStep: number;
  selectedPlan: Plan | null;
  plan?: Plan | null;
  guests: Guest[];
  discounts: DiscountInfo;
  is80GRequired: boolean;
  guestsPayload?: any;
  taxInfo: {
    panNumber: string;
    fullName: string;
    address: string;
    panFile?: string;
    aadharFile?: string;
  };
  bookingId?: string | number;
  ticketUrl?: string;
  ticket_url?: string;
  invoiceUrl?: string;
  invoice_url?: string;
  completionCertificateUrl?: string;
  completion_certificate_url?: string;
  additionalAssets?: Array<{
    title?: string;
    status?: string;
    size?: string;
    description?: string;
    url?: string;
  }>;
  otherInfoLinks?: Array<{
    title?: string;
    label?: string;
    url?: string;
    link?: string;
  }>;
}
