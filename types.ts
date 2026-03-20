
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
  planID?: number;

  // Core fields
  PlanTitle: string;
  stayRoomType: string;
  PlanPrice: number;
  eventIds: number[];

  // Relations
  parentPlans?: {
    planID: number;
    PlanTitle?: string;
  }[];

  childPlans?: {
    planID: number;
    PlanTitle?: string;
  }[];

  // Optional fields
  OfferPrice?: number;
  Duration?: number;
  PlanDescription?: string;
 // PlanName?: string;
  PlanSubtitle?: string;
  bannerImage?: string | null;
  planColor?: string | null;
  isPureVeg?: boolean;
  isActive: boolean;
  tag?: 'Adult' | 'Kid' | string;

  parentPlanIds?: number[];
  iconIds?: number[];

  // Special plan logic
  isSpecialPlan?: boolean;
  applyToAllPlans?: boolean;
  specialCriteriaAgeMin?: number;
  specialCriteriaAgeMax?: number;

  // Inventory
  inventory: {
    totalRooms: number;
    totalBeds: number;
    maxQuantity?: number;
    remainingInventory?: number;
  };

  remainingInventory?: number;
  maxPax?: number | null;

  // Age range
  ageRangeMin?: number;
  ageRangeMax?: number;

  // Pricing / GST
  discountedPrice?: number;
  gstType?: 'inclusive' | 'exclusive';
  gstRate?: number;
  gstDetails?: string;

  // Descriptions
  fullDescription?: string | null;

  // Icons
  icons?: {
    id: number;
    Title: string;
    IconUrl?: string;
    Type?: string;
    selected?: boolean;
    PlanID?: number;
  }[];

  customIcons?: {
    id: number;
    Title: string;
    IconUrl?: string;
    Type?: string;
  }[];

  // Images
  images?: {
    id: number;
    planID?: number;
    imageUrl?: string;
    url?: string;
    isMain?: boolean | number;
    isThumbnail?: boolean | number;
  }[];
}

export interface EventData {
  title: string;
  bannerImage: string | null;
  date: string;
  time: string;
  venue: string;
  description: string;
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
