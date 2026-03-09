
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
}

export interface Plan {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  fullDescription: string;
  discountedPrice: number;
  finalPrice: number;
  gstDetails: string;
  amenities: string[];
}

export interface EventData {
  title: string;
  banner: string;
  date: string;
  time: string;
  venue: string;
  description: string;
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
}
