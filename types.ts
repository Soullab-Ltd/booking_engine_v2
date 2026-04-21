
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

export interface GuestSelectedAddon {
  addonId: string;
  title: string;
  description: string;
  type: string;
  price: number;
  quantity: number;
  isPricePerNight: boolean;
  bannerImage: string;
}

export interface GuestExtraStay {
  enabled: boolean;
  days: number;
  type: string;
  startDate: string;
  endDate: string;
  planId: string | number;
  price: number;
  pricePerNight?: number;
}

export interface GuestAddOns {
  foodPass: boolean;
  adventurePass: boolean;
  selectedAddons: GuestSelectedAddon[];
  extraStay: GuestExtraStay;
}

export interface Guest {
  id: string;
  name: string;
  phone: string;
  email: string;
  age: number;
  isKidsPlanOpted: boolean;
  foodPreference: FoodPreference;
  travelAssistance: boolean;

  addOns: GuestAddOns;
  remark: string;

  gender: string | null;
  city: string;  
  state: string; 
  country: string;
}



export interface PlanIcon {
  id: number;
  title: string;
  iconUrl: string;
  type: string;
  planID: number;
}

export interface PlanFeature {
  id: string;
  label: string;
  value: string;
  icon: string;
}


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
  planID: number;
  PlanID?: number;
  PlanName?: string;
  priceType?: string;
  remainingInventory?: number;
  title?: string;
  sequence:number;
  PlanTitle?: string;
  PlanSubtitle?: string;
  thumbnail?: string;
  banner: string | null;
  bannerImage?: string;
  description?: string;
  stayRoomType?: string;
  PlanDescription?: string;
  fullDescription?: string;
  longDescription?: string;
  planColor?: string;
  maxPax?: number;
  PlanPrice: number;
  OfferPrice: number;
  discountedPrice?: number;
  finalPrice?: number;
  gstDetails?: string;
  amenities?: PlanIcon[];
  icons?: PlanIcon[];
  planFeatures?: PlanFeature[];
  isSpecialPlan?: boolean | number; 
  tag?: string;
  images: {
    id: number;
    imageUrl: string;
    isMain: boolean;
    isThumbnail: boolean;
  }[];
}

export interface EventData {
  id: number | string;
  EventID?: number | string;
  title: string;

  slug: string;
  EventName?: string;
  banner: string;

  date: string;

  // ✅ ADD TYPES
  startDate?: string;
  endDate?: string;

  time: string;
  venue: string;
  description: string;

  schedules?: any[];
  plans?: any[];
  addons?: any[];
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
  guests: Guest[];
  discounts: DiscountInfo;
  is80GRequired: boolean;
  taxInfo: {
    panNumber: string;
    fullName: string;
    address: string;
    panFile?: string;
    aadharFile?: string;
  };
  bookingId?: string | number;
}
