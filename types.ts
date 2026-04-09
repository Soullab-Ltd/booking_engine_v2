
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

export interface Guest {
  id: string;
  name: string;
  phone: string;
  email: string;
  age: number;
  isKidsPlanOpted: boolean;
  foodPreference: FoodPreference;
  travelAssistance: boolean;
  addOns: {
    foodPass: boolean;
    adventurePass: boolean;
    extraStay: {
      enabled: boolean;
      days: number;
      type: string;
      startDate: string;
    };
  };
  remark: string;

  gender: 'Male' | 'Female' | 'Prefer not to say' | ''; 
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
  title?: string;
  PlanTitle?: string;
  thumbnail?: string;
  banner: string | null;
  description?: string;
  stayRoomType?: string;
  PlanDescription?: string;
  fullDescription?: string;
  PlanPrice: number;
  OfferPrice: number;
  discountedPrice?: number;
  finalPrice?: number;
  gstDetails?: string;
  amenities?: PlanIcon[];
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
  time: string;
  venue: string;
  description: string;
  schedules?: any[];
  plans?: any[];
  addons?: any[]; // ✅ add this
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