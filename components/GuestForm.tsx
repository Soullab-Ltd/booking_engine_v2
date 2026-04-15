import React, { useEffect, useMemo, useState } from 'react';
import { Guest, FoodPreference } from '../types';
import { createEmptyGuest } from '../constants';
import {
  Trash2,
  Info,
  X,
  ChevronRight,
  PlusCircle,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Minus,
  Globe,
  Search,
  ChevronDown,
  Wind,
  Sun,
  Flower2,
  Utensils,
  AlertCircle,
} from 'lucide-react';

const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli',
  'Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia',
  'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia',
  'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
  'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt',
  'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon',
  'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti',
  'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan',
  'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Korea, North', 'Korea, South', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos',
  'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi',
  'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova',
  'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands',
  'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine',
  'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia',
  'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent', 'Samoa', 'San Marino', 'Sao Tome and Principe',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands',
  'Somalia', 'South Africa', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey',
  'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay',
  'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
];

const normalizePhoneInput = (value: string) => {
  const trimmed = value.trim();
  const hasLeadingPlus = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/\D/g, '');

  return `${hasLeadingPlus ? '+' : ''}${digitsOnly}`;
};

const getPhoneDigits = (value: string) => String(value || '').replace(/\D/g, '');
const OTHER_STATE_OPTION = '__OTHER_STATE__';

interface StayAddonMapping {
  planId?: number | string;
  pricePerNight?: number | string;
}

interface AddonItem {
  id?: number | string;
  AddonID?: number | string;
  title?: string;
  AddonTitle?: string;
  description?: string;
  AddonDescription?: string;
  type?: string;
  adultPrice?: number | string;
  kidPrice?: number | string;
  AdultsperDay?: number | string;
  KidsperDay?: number | string;
  AdultSeasonAmt?: number | string;
  KidsSeasonAmt?: number | string;
  price?: number | string;
  bannerImage?: string;
  eventIds?: number[] | string | number;
  EventID?: number[] | string | number;
  planIds?: number[] | string | number;
  planID?: number[] | string | number;
  targetPlanIds?: number[] | string | number;
  isVisible?: boolean;
  isActive?: boolean | number;
  stayAddonMappings?: StayAddonMapping[];
}

interface StayPlan {
  id?: number | string;
  planID?: number | string;
  PlanID?: number | string;
  name?: string;
  PlanName?: string;
  PlanTitle?: string;
  PlanDescription?: string;
  stayRoomType?: string;
  price?: number | string;
  OfferPrice?: number | string;
  PlanPrice?: number | string;
  pricePerNight?: number | string;
  img?: string;
  image?: string;
  thumbnail?: string;
  images?: Array<{
    imageUrl?: string;
    isThumbnail?: boolean;
    isMain?: boolean;
  }>;
}

interface RelatedStayPlan {
  id: number;
  name: string;
  pricePerNight: number;
  description?: string;
  image?: string;
}

interface GuestFormProps {
  guests: Guest[];
  setGuests: (guests: Guest[]) => void;
  ui: any;
  roomTypes: StayPlan[];
  addons?: AddonItem[];
  selectedEventId?: number;
  selectedPlanId?: number;
  eventEndDate?: string; // pass event last day here
  onProceed: () => void;
  onBack: () => void;
}

const ErrorLabel = ({ message }: { message?: string }) => {
  if (!message) return null;

  return (
    <span className="mt-1 flex items-center gap-1 text-[9px] font-bold text-red-500 animate-fadeIn">
      <AlertCircle className="h-3 w-3" /> {message}
    </span>
  );
};

const isValidEmail = (value?: string) => {
  const email = String(value || '').trim();
  if (!email) return false;

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const CountrySelector = ({
  value,
  onChange,
  hasError,
}: {
  value: string;
  onChange: (val: string) => void;
  hasError?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredCountries = useMemo(() => {
    return COUNTRIES.filter((country) =>
      country.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex h-[42px] w-full items-center justify-between rounded-xl border-2 px-4 py-2 text-sm font-bold text-stone-900 transition-all ${
          hasError
            ? 'border-red-200 bg-red-50'
            : 'border-stone-100 bg-stone-50 hover:border-stone-200'
        }`}
      >
        <span className="flex items-center gap-2 truncate">
          <Globe
            className={`h-3.5 w-3.5 shrink-0 ${
              hasError ? 'text-red-500' : 'text-[var(--theme)]'
            }`}
          />
          {value || 'Select Country'}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-stone-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[140]" onClick={() => setIsOpen(false)} />
          <div className="absolute z-[150] mt-2 w-full overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl animate-fadeIn">
            <div className="border-b border-stone-100 bg-stone-50 p-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search countries..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 bg-white py-2 pl-9 pr-4 text-xs font-bold focus:border-[var(--theme)] focus:outline-none"
                />
              </div>
            </div>

            <div className="custom-scrollbar max-h-60 overflow-y-auto">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    key={country}
                    type="button"
                    onClick={() => {
                      onChange(country);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full px-4 py-2.5 text-left text-xs font-bold transition-all hover:bg-[var(--theme-light)] ${
                      value === country ? 'bg-teal-50 text-[var(--theme)]' : 'text-stone-700'
                    }`}
                  >
                    {country}
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-[10px] font-black uppercase text-stone-400">
                  No results found
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const GuestForm: React.FC<GuestFormProps> = ({
  guests,
  setGuests,
  ui,
  roomTypes = [],
  addons = [],
  selectedEventId = 0,
  selectedPlanId = 0,
  eventEndDate = '',
  onProceed,
  onBack,
}) => {
  const [showAddOnInfo, setShowAddOnInfo] = useState<string | null>(null);
  const [showKidsModal, setShowKidsModal] = useState(false);
  const [touched, setTouched] = useState(false);
  const [customIndianStateGuests, setCustomIndianStateGuests] = useState<Record<string, boolean>>({});

  const parseIds = (value: any): number[] => {
    if (!value) return [];

    if (Array.isArray(value)) {
      return value.map(Number).filter((n) => !isNaN(n));
    }

    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => Number(String(item).trim()))
        .filter((n) => !isNaN(n));
    }

    const num = Number(value);
    return isNaN(num) ? [] : [num];
  };

  const normalizeStayPlan = (room: StayPlan): RelatedStayPlan => {
    const planId = Number(room.planID ?? room.PlanID ?? room.id ?? 0);

    const pricePerNight = Number(
      room.pricePerNight ??
        room.price ??
        room.OfferPrice ??
        room.PlanPrice ??
        0
    );

    const image =
      room.image ??
      room.img ??
      room.thumbnail ??
      room.images?.find((img) => img?.isThumbnail)?.imageUrl ??
      room.images?.find((img) => img?.isMain)?.imageUrl ??
      '';

    return {
      id: planId,
      name:
        room.stayRoomType ??
        room.PlanTitle ??
        room.PlanName ??
        room.name ??
        '',
      pricePerNight,
      description: room.PlanDescription ?? '',
      image,
    };
  };

  const normalizeDateInput = (value?: string) => {
  if (!value) return '';

  // ✅ already correct format
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  // ✅ handle DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split('/');
    return `${year}-${month}-${day}`;
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) return '';

  return date.toISOString().split('T')[0];
};

  const getMinExtraStayStartDate = () => {
  if (!eventEndDate) return '';

  const date = new Date(eventEndDate);
  if (isNaN(date.getTime())) return '';

  date.setDate(date.getDate() + 1);

  return date.toISOString().split('T')[0];
};

  const minExtraStayStartDate = useMemo(
    () => getMinExtraStayStartDate(),
    [eventEndDate]
  );
console.log('eventEndDate', eventEndDate);
console.log('minExtraStayStartDate', minExtraStayStartDate);
const getStayEndDate = (startDate: string, days: number) => {
    if (!startDate) return '';
    const safeDays = Math.max(1, Number(days || 1));
    const date = new Date(startDate);
    date.setDate(date.getDate() + (safeDays - 1));
    return date.toISOString().split('T')[0];
  };

  const formatDateShort = (dateStr: string) => {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  const stayAddonFromDb = useMemo(() => {
    return (addons || []).find((addon: any) => {
      const normalizedType = String(addon.type || '').trim().toLowerCase();
      const addonEventIds = parseIds(addon.eventIds ?? addon.EventID);
      const targetPlanIds = parseIds(
        addon.targetPlanIds ?? addon.planIds ?? addon.planID
      );

      const eventMatch =
        addonEventIds.length === 0 ||
        addonEventIds.includes(Number(selectedEventId));

      const planMatch =
        targetPlanIds.length === 0 ||
        targetPlanIds.includes(Number(selectedPlanId));

      const visibleMatch =
        addon.isVisible === undefined ||
        addon.isVisible === null ||
        addon.isVisible !== false;

      const activeMatch =
        addon.isActive === undefined ||
        addon.isActive === null ||
        Number(addon.isActive) !== 0;

      return (
        normalizedType === 'stay' &&
        eventMatch &&
        planMatch &&
        visibleMatch &&
        activeMatch
      );
    });
  }, [addons, selectedEventId, selectedPlanId]);

  const kidsAddonFromDb = useMemo(() => {
    return addons.find(
      (a) => String(a.type || '').trim().toLowerCase() === 'kids'
    );
  }, [addons]);

  const stayAddonTitle =
    stayAddonFromDb?.title ??
    stayAddonFromDb?.AddonTitle ??
    'Extra Stay';

  const globalStayPlans = useMemo(() => {
    if (!stayAddonFromDb) return [];

    const mappings = Array.isArray(stayAddonFromDb.stayAddonMappings)
      ? stayAddonFromDb.stayAddonMappings
      : [];

    if (mappings.length === 0) {
      return (roomTypes || [])
        .map(normalizeStayPlan)
        .filter((plan) => Number(plan.pricePerNight) > 0);
    }

    return mappings
      .map((mapping) => {
        const mappingPlanId = Number(mapping.planId ?? 0);
        if (!mappingPlanId) return null;

        const matchedRoom = (roomTypes || []).find((room: any) => {
          const roomPlanId = Number(room.planID ?? room.PlanID ?? room.id ?? 0);
          return roomPlanId === mappingPlanId;
        });

        return {
          id: mappingPlanId,
          name:
            matchedRoom?.stayRoomType ??
            matchedRoom?.PlanTitle ??
            matchedRoom?.PlanName ??
            matchedRoom?.name ??
            `Plan ${mappingPlanId}`,
          pricePerNight: Number(mapping.pricePerNight ?? 0),
          description: matchedRoom?.PlanDescription ?? '',
          image:
            matchedRoom?.image ??
            matchedRoom?.img ??
            matchedRoom?.thumbnail ??
            matchedRoom?.images?.find((img: any) => img?.isThumbnail)?.imageUrl ??
            matchedRoom?.images?.find((img: any) => img?.isMain)?.imageUrl ??
            '',
        } as RelatedStayPlan;
      })
      .filter(
        (plan): plan is RelatedStayPlan =>
          !!plan && !isNaN(Number(plan.id)) && Number(plan.pricePerNight) > 0
      );
  }, [stayAddonFromDb, roomTypes]);

  const showExtraStaySection = globalStayPlans.length > 0;

  const getDefaultExtraStay = () => {
    const firstPlan = globalStayPlans[0];

    return {
      enabled: false,
      type: firstPlan?.name || '',
      planId: firstPlan?.id || '',
      price: Number(firstPlan?.pricePerNight || 0),
      startDate: minExtraStayStartDate,
      endDate: minExtraStayStartDate
        ? getStayEndDate(minExtraStayStartDate, 1)
        : '',
      days: 1,
    };
  };

  useEffect(() => {
    if (!showExtraStaySection) return;

    const normalizedGuests = guests.map((guest: any) => {
      const existingExtraStay = guest?.addOns?.extraStay || {};
      const existingPlanId = existingExtraStay?.planId;

      const matchedPlan = globalStayPlans.find(
        (plan) => String(plan.id) === String(existingPlanId)
      );

      const fallback = getDefaultExtraStay();
      const incomingStartDate = normalizeDateInput(existingExtraStay.startDate);
      
      const safeStartDate = minExtraStayStartDate;
      const safeDays = Math.min(10, Math.max(1, Number(existingExtraStay.days || 1)));

      return {
        ...guest,
        addOns: {
          ...(guest.addOns || {}),
          selectedAddons: guest.addOns?.selectedAddons || [],
          extraStay: {
            enabled: existingExtraStay.enabled ?? false,
            type: existingExtraStay.type || matchedPlan?.name || fallback.type,
            planId:
              existingExtraStay.planId || matchedPlan?.id || fallback.planId,
            price: Number(
              matchedPlan?.pricePerNight ??
                fallback.price ??
                0
            ),
            startDate: safeStartDate || '',
            endDate: safeStartDate
              ? getStayEndDate(safeStartDate, safeDays)
              : '',
            days: safeDays,
          },
        },
      };
    });

    if (JSON.stringify(normalizedGuests) !== JSON.stringify(guests)) {
      setGuests(normalizedGuests);
    }
  }, [showExtraStaySection, globalStayPlans, guests, minExtraStayStartDate]);

  const eventAddons = useMemo(() => {
    return (addons || []).filter((addon) => {
      const addonEventIds = parseIds(addon.eventIds ?? addon.EventID);
      const addonPlanIds = parseIds(addon.planIds ?? addon.planID);

      const eventMatch =
        addonEventIds.length === 0 ||
        addonEventIds.includes(Number(selectedEventId));

      const planMatch =
        addonPlanIds.length === 0 ||
        addonPlanIds.includes(Number(selectedPlanId));

      return (
        eventMatch &&
        planMatch &&
        addon.isVisible !== false &&
        Number(addon.isActive ?? 1) !== 0 &&
        String(addon.type || '').trim().toLowerCase() !== 'stay'
      );
    });
  }, [addons, selectedEventId, selectedPlanId]);

  const getGuestErrors = (guest: Guest | any) => {
    const errors: Record<string, string> = {};

    const trimmedName = String(guest.name || '').trim();

    if (!trimmedName) {
      errors.name = 'Name is required';
    } else if (trimmedName.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!guest.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(guest.email)) {
      errors.email = 'Invalid email format';
    }

    if (!guest.phone?.trim()) {
      errors.phone = 'Phone is required';
    } else {
      const phoneDigits = getPhoneDigits(guest.phone);
      const isIndianGuest = String(guest.country || '').trim().toLowerCase() === 'india';

      if (isIndianGuest) {
        if (phoneDigits.length !== 10) {
          errors.phone = 'Enter a valid 10-digit phone number';
        }
      } else if (phoneDigits.length < 8 || phoneDigits.length > 15) {
        errors.phone = 'Enter a valid international phone number';
      }
    }
    const age = Number(guest.age);

      if (!guest.age && guest.age !== 0) {
        errors.age = 'Age is required';
      } else if (isNaN(age)) {
        errors.age = 'Invalid age';
      } else if (age < 1 || age > 120) {
        errors.age = 'Age must be between 1 and 120';
      }
    if (!guest.gender) {
      errors.gender = 'Gender is required';
    }  
    if (!guest.country) errors.country = 'Country is required';
    if (!guest.state) errors.state = 'State is required';
    if (!guest.city?.trim()) errors.city = 'City is required';

    return errors;
  };

  const allGuestsValid = useMemo(() => {
    return guests.every(
      (guest: any) => Object.keys(getGuestErrors(guest)).length === 0
    );
  }, [guests]);

  const eligibleKids = useMemo(() => {
    return guests.filter((guest: any) => {
      const age = Number(guest.age);
      return age >= 4 && age <= 17;
    });
  }, [guests]);

  const updateGuest = (id: string, updates: any) => {
    const updatedGuests = guests.map((guest: any) => {
      if (String(guest.id) !== String(id)) return guest;

      if (updates.addOns) {
        return {
          ...guest,
          addOns: {
            ...(guest.addOns || {}),
            ...updates.addOns,
            selectedAddons:
              updates.addOns.selectedAddons ??
              guest.addOns?.selectedAddons ??
              [],
            extraStay: {
              ...(guest.addOns?.extraStay || getDefaultExtraStay()),
              ...(updates.addOns.extraStay || {}),
            },
          },
        };
      }

      return { ...guest, ...updates };
    });

    setGuests(updatedGuests);
  };

  const handleCountryChange = (guestId: string, country: string) => {
    setCustomIndianStateGuests((prev) => ({
      ...prev,
      [String(guestId)]: false,
    }));

    updateGuest(guestId, {
      country,
      state: '',
      city: '',
    });
  };

  const addGuest = () => {
    const guest = createEmptyGuest() as any;

    const normalizedGuest = {
      ...guest,
      addOns: {
        ...(guest.addOns || {}),
        selectedAddons: guest.addOns?.selectedAddons || [],
        extraStay: showExtraStaySection
          ? getDefaultExtraStay()
          : {
              enabled: false,
              type: '',
              planId: '',
              price: 0,
              startDate: '',
              endDate: '',
              days: 1,
            },
      },
    };

    setGuests([...guests, normalizedGuest]);
  };

  const removeGuest = (id: string) => {
    if (guests.length <= 1) return;
    setGuests(guests.filter((guest: any) => String(guest.id) !== String(id)));
  };

  const toggleKidsPlan = (guestId: string, opted: boolean) => {
    setGuests(
      guests.map((guest: any) =>
        String(guest.id) === String(guestId)
          ? { ...guest, isKidsPlanOpted: opted }
          : guest
      )
    );
  };

  const getAddonPriceForGuest = (addon: AddonItem, guest: any) => {
    const age = Number(guest?.age || 0);
    const isKid = age > 0 && age < 18;

    return Number(
      isKid
        ? addon.kidPrice ??
            addon.KidsperDay ??
            addon.KidsSeasonAmt ??
            addon.price ??
            0
        : addon.adultPrice ??
            addon.AdultsperDay ??
            addon.AdultSeasonAmt ??
            addon.price ??
            0
    );
  };

  const toggleGuestAddon = (guestId: string, addon: AddonItem) => {
    const guest = guests.find((item: any) => String(item.id) === String(guestId));
    if (!guest) return;

    const currentSelections = guest.addOns?.selectedAddons || [];
    const addonId = String(addon.id ?? addon.AddonID ?? '');

    const exists = currentSelections.find(
      (item: any) => String(item.addonId) === addonId
    );

    const updatedSelections = exists
      ? currentSelections.filter((item: any) => String(item.addonId) !== addonId)
      : [
          ...currentSelections,
          {
            addonId,
            title: addon.title ?? addon.AddonTitle ?? '',
            description: addon.description ?? addon.AddonDescription ?? '',
            type: addon.type ?? '',
            price: getAddonPriceForGuest(addon, guest),
            quantity: 1,
            isPricePerNight: false,
            bannerImage: addon.bannerImage ?? '',
          },
        ];

    updateGuest(guestId, {
      addOns: {
        ...guest.addOns,
        selectedAddons: updatedSelections,
      },
    });
  };

  const updateExtraStayPlan = (guestId: string, planId: number | string) => {
    const selectedStayPlan = globalStayPlans.find(
      (plan) => String(plan.id) === String(planId)
    );

    if (!selectedStayPlan) return;

    const guest = guests.find((g: any) => String(g.id) === String(guestId));
    const currentExtraStay = guest?.addOns?.extraStay || getDefaultExtraStay();
    const safeStartDate = minExtraStayStartDate;

    updateGuest(guestId, {
      addOns: {
        extraStay: {
          ...currentExtraStay,
          enabled: true,
          planId: selectedStayPlan.id,
          type: selectedStayPlan.name,
          price: Number(selectedStayPlan.pricePerNight || 0),
          startDate: safeStartDate || '',
          endDate: safeStartDate
            ? getStayEndDate(safeStartDate, Number(currentExtraStay.days || 1))
            : '',
        },
      },
    });
  };

  const updateExtraStayDays = (guestId: string, days: number) => {
    const guest = guests.find((g: any) => String(g.id) === String(guestId));
    if (!guest) return;

    const extraStay = guest.addOns?.extraStay || getDefaultExtraStay();
    const safeDays = Math.min(10, Math.max(1, Number(days || 1)));
    const safeStartDate = minExtraStayStartDate;

    updateGuest(guestId, {
      addOns: {
        extraStay: {
          ...extraStay,
          days: safeDays,
          startDate: safeStartDate || '',
          endDate: safeStartDate ? getStayEndDate(safeStartDate, safeDays) : '',
        },
      },
    });
  };

  const updateExtraStayStartDate = (guestId: string, startDate: string) => {
    const guest = guests.find((g: any) => String(g.id) === String(guestId));
    if (!guest) return;

    const extraStay = guest.addOns?.extraStay || getDefaultExtraStay();
    const safeStartDate = minExtraStayStartDate;

    updateGuest(guestId, {
      addOns: {
        extraStay: {
          ...extraStay,
          startDate: safeStartDate || '',
          endDate: safeStartDate
            ? getStayEndDate(safeStartDate, Number(extraStay.days || 1))
            : '',
        },
      },
    });
  };

  const getInfoContent = (type: string) => {
    if (ui?.modals?.[type]) return ui.modals[type];

    const matchedAddon = addons.find(
      (addon) => String(addon.id ?? addon.AddonID) === String(type)
    );

    if (matchedAddon) {
      return {
        title: matchedAddon.title ?? matchedAddon.AddonTitle ?? 'Add-on',
        desc:
          matchedAddon.description ??
          matchedAddon.AddonDescription ??
          matchedAddon.type ??
          'Add-on details',
        img: matchedAddon.bannerImage ?? '',
      };
    }

    if (type === 'extraStay' || type === 'stay') {
      return {
        title: stayAddonTitle,
        desc:
          stayAddonFromDb?.description ??
          stayAddonFromDb?.AddonDescription ??
          'Add stay before or after the event.',
        img: stayAddonFromDb?.bannerImage ?? '',
      };
    }

    return null;
  };

  const handleProceedClick = () => {
    setTouched(true);

      if (!allGuestsValid) {
        return; // ✅ already exists
      }

    if (showExtraStaySection) {
      const invalidExtraStayGuest = guests.find((guest: any) => {
        const extraStay = guest.addOns?.extraStay;
        if (!extraStay?.enabled) return false;

        const noPlan = !extraStay.planId;
        const noStartDate = !extraStay.startDate;
        const beforeMinDate =
          !!minExtraStayStartDate &&
          !!extraStay.startDate &&
          extraStay.startDate < minExtraStayStartDate;

        return noPlan || noStartDate || beforeMinDate;
      });

      if (invalidExtraStayGuest) return;
    }

    if (eligibleKids.length > 0) {
      setShowKidsModal(true);
    } else {
      onProceed();
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl animate-fadeIn px-4 py-8 pb-52 sm:pb-16">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-stone-900">
            {ui.header.title}
          </h2>
          <p className="flex items-center gap-2 text-sm font-medium text-stone-600">
            <Sparkles className="h-4 w-4 text-[var(--theme)]" /> {ui.header.subtitle}
          </p>
        </div>

        <button
          onClick={addGuest}
          className="flex items-center gap-2 rounded-xl bg-[var(--theme)] px-5 py-2 text-xs font-bold text-white shadow-md transition-all active:scale-95 hover:bg-[var(--theme-dark)]"
        >
          <PlusCircle className="h-4 w-4" /> {ui.header.addGuest}
        </button>
      </div>

      <div className="space-y-6">
        {guests.map((guest: any, index) => {
          const errors = getGuestErrors(guest);
          const hasTypedEmail = String(guest.email || '').trim().length > 0;
          const emailLooksValid = isValidEmail(guest.email);
          const showRealtimeEmailError = hasTypedEmail && !emailLooksValid;

          return (
            <div
              key={guest.id}
              className={`relative rounded-3xl border bg-white p-6 shadow-sm transition-all ${
                touched && Object.keys(errors).length > 0
                  ? 'border-red-200 bg-red-50/20'
                  : 'border-stone-200'
              }`}
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black ${
                      touched && Object.keys(errors).length > 0
                        ? 'bg-red-500 text-white'
                        : 'bg-stone-900 text-white'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-800">
                    {ui.guestCard.label} {index + 1}
                  </h3>
                </div>

                {guests.length > 1 && (
                  <button
                    onClick={() => removeGuest(guest.id)}
                    className="rounded-lg p-2 text-stone-400 transition-all hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="ml-0.5 text-[10px] font-black uppercase tracking-widest text-stone-700">
                    {ui.guestCard.fields.name} <span className="ml-0.5 font-black text-[var(--theme)]">#</span>
                  </label>
                  <input
                    type="text"
                    value={guest.name}
                    onChange={(e) => updateGuest(guest.id, { name: e.target.value })}
                    minLength={2}
                    placeholder={ui.guestCard.fields.namePlaceholder}
                    className={`h-[42px] w-full rounded-xl border-2 px-4 py-2 text-sm font-bold text-stone-900 outline-none transition-all placeholder:text-stone-300 ${
                      touched && errors.name
                        ? 'border-red-200 bg-white'
                        : 'border-stone-100 bg-stone-50 focus:border-[var(--theme)] focus:bg-white'
                    }`}
                  />
                  {touched && <ErrorLabel message={errors.name} />}
                </div>

                <div className="space-y-1">
                  <label className="ml-0.5 text-[10px] font-black uppercase tracking-widest text-stone-700">
                    {ui.guestCard.fields.phone} <span className="ml-0.5 font-black text-[var(--theme)]">#</span>
                  </label>
                  <input
                    type="tel"
                    value={guest.phone}
                    onChange={(e) => {
                        const val = normalizePhoneInput(e.target.value);
                        updateGuest(guest.id, { phone: val });
                      }}
                    placeholder={
                      guest.country === 'India'
                        ? 'Enter 10-digit mobile number'
                        : '+12345678901'
                    }
                    className={`h-[42px] w-full rounded-xl border-2 px-4 py-2 text-sm font-bold text-stone-900 outline-none transition-all placeholder:text-stone-300 ${
                      touched && errors.phone
                        ? 'border-red-200 bg-white'
                        : 'border-stone-100 bg-stone-50 focus:border-[var(--theme)] focus:bg-white'
                    }`}
                  />
                  {touched && <ErrorLabel message={errors.phone} />}
                </div>

                <div className="space-y-1">
                  <label className="ml-0.5 text-[10px] font-black uppercase tracking-widest text-stone-700">
                    {ui.guestCard.fields.email} <span className="ml-0.5 font-black text-[var(--theme)]">#</span>
                  </label>
                  <input
                    type="email"
                    value={guest.email}
                    onChange={(e) => updateGuest(guest.id, { email: e.target.value })}
                    placeholder={ui.guestCard.fields.emailPlaceholder}
                    className={`h-[42px] w-full rounded-xl border-2 px-4 py-2 text-sm font-bold text-stone-900 outline-none transition-all placeholder:text-stone-300 ${
                      touched && errors.email
                        ? 'border-red-200 bg-white'
                        : showRealtimeEmailError
                        ? 'border-red-200 bg-red-50'
                        : hasTypedEmail && emailLooksValid
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-stone-100 bg-stone-50 focus:border-[var(--theme)] focus:bg-white'
                    }`}
                  />
                  {showRealtimeEmailError ? (
                    <ErrorLabel message="Enter a valid email address" />
                  ) : null}
                  {!showRealtimeEmailError && hasTypedEmail && emailLooksValid ? (
                    <span className="mt-1 flex items-center gap-1 text-[9px] font-bold text-emerald-600 animate-fadeIn">
                      <CheckCircle2 className="h-3 w-3" /> Email looks valid
                    </span>
                  ) : null}
                  {touched && !hasTypedEmail && <ErrorLabel message={errors.email} />}
                </div>

                <div className="space-y-1">
                  <label className="ml-0.5 text-[10px] font-black uppercase tracking-widest text-stone-700">
                    {ui.guestCard.fields.age} <span className="ml-0.5 font-black text-[var(--theme)]">#</span>
                  </label>
                  <input
                    type="text"
                    value={guest.age || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      updateGuest(guest.id, { age: parseInt(val, 10) || 0 });
                    }}
                    placeholder={ui.guestCard.fields.agePlaceholder}
                    className={`h-[42px] w-full rounded-xl border-2 px-4 py-2 text-sm font-bold text-stone-900 outline-none transition-all placeholder:text-stone-300 ${
                      touched && errors.age
                        ? 'border-red-200 bg-white'
                        : 'border-stone-100 bg-stone-50 focus:border-[var(--theme)] focus:bg-white'
                    }`}
                  />
                  {touched && <ErrorLabel message={errors.age} />}
                </div>

              <div className="space-y-1">
                  <label className="ml-0.5 text-[10px] font-black uppercase tracking-widest text-stone-700">
                    Gender <span className="ml-0.5 font-black text-[var(--theme)]">#</span>
                  </label>

                  <div className="flex gap-2">
                    {['Male', 'Female', 'Prefer not to say'].map((gender) => (
                      <label
                        key={gender}
                        className={`flex h-[42px] flex-1 cursor-pointer items-center justify-center rounded-xl border-2 p-2 text-center text-[10px] font-bold transition-all ${
                          guest.gender === gender
                            ? 'border-[var(--theme)] bg-[var(--theme)] text-white shadow-sm'
                            : 'border-stone-100 bg-stone-100 text-stone-600 hover:border-stone-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`gender-${guest.id}`}
                          checked={guest.gender === gender}
                          onChange={() => updateGuest(guest.id, { gender })}
                          className="hidden"
                        />
                        {gender}
                      </label>
                    ))}
                  </div>

                  {/* ✅ ADD THIS */}
                  {touched && <ErrorLabel message={errors.gender} />}
                </div>

                <div className="space-y-1">
                  <label className="ml-0.5 text-[10px] font-black uppercase tracking-widest text-stone-700">
                    {ui.guestCard.fields.food}
                  </label>
                  <div className="flex gap-2">
                    {[FoodPreference.REGULAR, FoodPreference.JAIN].map((pref) => (
                      <label
                        key={pref}
                        className={`flex h-[42px] flex-1 cursor-pointer items-center justify-center rounded-xl border-2 p-2 text-[11px] font-bold transition-all ${
                          guest.foodPreference === pref
                            ? 'border-[var(--theme)] bg-[var(--theme)] text-white shadow-sm'
                            : 'border-stone-100 bg-stone-100 text-stone-600 hover:border-stone-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`food-${guest.id}`}
                          checked={guest.foodPreference === pref}
                          onChange={() =>
                            updateGuest(guest.id, { foodPreference: pref })
                          }
                          className="hidden"
                        />
                        {pref}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="ml-0.5 text-[10px] font-black uppercase tracking-widest text-stone-700">
                    Country <span className="ml-0.5 font-black text-[var(--theme)]">#</span>
                  </label>
                  <CountrySelector
                    value={guest.country || ''}
                    onChange={(val) => handleCountryChange(guest.id, val)}
                    hasError={touched && !!errors.country}
                  />
                  {touched && <ErrorLabel message={errors.country} />}
                </div>

                <div className="space-y-1">
                  <label className="ml-0.5 text-[10px] font-black uppercase tracking-widest text-stone-700">
                    State / Province <span className="ml-0.5 font-black text-[var(--theme)]">#</span>
                  </label>

                  {guest.country === 'India' ? (
                    <div className="relative">
                      <select
                        value={
                          customIndianStateGuests[String(guest.id)]
                            ? OTHER_STATE_OPTION
                            : guest.state || ''
                        }
                        onChange={(e) => {
                          const selectedValue = e.target.value;
                          const isOtherSelected = selectedValue === OTHER_STATE_OPTION;

                          setCustomIndianStateGuests((prev) => ({
                            ...prev,
                            [String(guest.id)]: isOtherSelected,
                          }));

                          updateGuest(guest.id, {
                            state: isOtherSelected ? '' : selectedValue,
                          });
                        }}
                        className={`h-[42px] w-full cursor-pointer appearance-none rounded-xl border-2 px-4 py-2 text-sm font-bold text-stone-900 outline-none ${
                          touched && errors.state
                            ? 'border-red-200 bg-white'
                            : 'border-stone-100 bg-stone-50 focus:border-[var(--theme)]'
                        }`}
                      >
                        <option value="" disabled>
                          Select State
                        </option>
                        {INDIAN_STATES.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                        <option value={OTHER_STATE_OPTION}>Other</option>
                      </select>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={guest.state || ''}
                      onChange={(e) => updateGuest(guest.id, { state: e.target.value })}
                      placeholder="Enter state / province"
                      className={`h-[42px] w-full rounded-xl border-2 px-4 py-2 text-sm font-bold text-stone-900 outline-none transition-all placeholder:text-stone-300 ${
                        touched && errors.state
                          ? 'border-red-200 bg-white'
                          : 'border-stone-100 bg-stone-50 focus:border-[var(--theme)] focus:bg-white'
                      }`}
                    />
                  )}
                  {guest.country === 'India' &&
                  customIndianStateGuests[String(guest.id)] ? (
                    <input
                      type="text"
                      value={guest.state || ''}
                      onChange={(e) => updateGuest(guest.id, { state: e.target.value })}
                      placeholder="Enter other state"
                      className={`mt-2 h-[42px] w-full rounded-xl border-2 px-4 py-2 text-sm font-bold text-stone-900 outline-none transition-all placeholder:text-stone-300 ${
                        touched && errors.state
                          ? 'border-red-200 bg-white'
                          : 'border-stone-100 bg-stone-50 focus:border-[var(--theme)] focus:bg-white'
                      }`}
                    />
                  ) : null}
                  {touched && <ErrorLabel message={errors.state} />}
                </div>

                <div className="space-y-1">
                  <label className="ml-0.5 text-[10px] font-black uppercase tracking-widest text-stone-700">
                    City <span className="ml-0.5 font-black text-[var(--theme)]">#</span>
                  </label>
                  <input
                    type="text"
                    value={guest.city || ''}
                    onChange={(e) => updateGuest(guest.id, { city: e.target.value })}
                    placeholder="Enter city"
                    className={`h-[42px] w-full rounded-xl border-2 px-4 py-2 text-sm font-bold text-stone-900 outline-none transition-all placeholder:text-stone-300 ${
                      touched && errors.city
                        ? 'border-red-200 bg-white'
                        : 'border-stone-100 bg-stone-50 focus:border-[var(--theme)] focus:bg-white'
                    }`}
                  />
                  {touched && <ErrorLabel message={errors.city} />}
                </div>
              </div>

              {!!eventAddons.length && (
                <div className="mt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-800">
                      {ui.guestCard.addons?.title || 'Add-ons'}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {eventAddons.map((addon) => {
                      const addonId = String(addon.id ?? addon.AddonID ?? '');
                      const guestSelections = guest.addOns?.selectedAddons || [];
                      const isSelected = guestSelections.some(
                        (item: any) => String(item.addonId) === addonId
                      );
                      const guestPrice = getAddonPriceForGuest(addon, guest);

                      return (
                        <label
                          key={addonId}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                            isSelected
                              ? 'border-[var(--theme)] bg-teal-50'
                              : 'border-stone-100 bg-white hover:border-teal-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleGuestAddon(String(guest.id), addon)}
                            className="h-4 w-4 rounded-md accent-[var(--theme)]"
                          />

                          <div className="flex-1">
                            <p className="flex items-center justify-between text-xs font-bold text-stone-900">
                              {addon.title ?? addon.AddonTitle}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setShowAddOnInfo(addonId);
                                }}
                              >
                                <Info className="h-3.5 w-3.5 text-teal-500" />
                              </button>
                            </p>
                            <p className="text-[9px] font-bold uppercase text-emerald-600">
                              ₹{guestPrice} per person
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {showExtraStaySection && (
                <div className="mt-6 rounded-2xl border border-stone-100 bg-stone-50 p-4">
                  <label className="group mb-4 flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={guest.addOns?.extraStay?.enabled || false}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        const defaultStay = getDefaultExtraStay();

                        updateGuest(guest.id, {
                          addOns: {
                            ...guest.addOns,
                            extraStay: checked
                              ? {
                                  ...(guest.addOns?.extraStay || defaultStay),
                                  enabled: true,
                                  startDate: minExtraStayStartDate,
                                  endDate:
                                    minExtraStayStartDate
                                      ? getStayEndDate(
                                            minExtraStayStartDate,
                                          Number(
                                            guest.addOns?.extraStay?.days || 1
                                          )
                                        )
                                      : '',
                                }
                              : {
                                  ...(guest.addOns?.extraStay || defaultStay),
                                  enabled: false,
                                  startDate: '',
                                  endDate: '',
                                  days: 1,
                                },
                          },
                        });
                      }}
                      className="h-5 w-5 rounded-md accent-[var(--theme)]"
                    />
                    <div className="flex-1">
                      <span className="block text-sm font-black text-stone-900">
                       {stayAddonTitle || ui.guestCard.addons?.extraStay || 'Extra Stay'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowAddOnInfo('extraStay');
                      }}
                      className="rounded-lg p-1 hover:bg-stone-200"
                    >
                      <Info className="h-4 w-4 text-teal-500" />
                    </button>
                  </label>

                  {guest.addOns?.extraStay?.enabled && (
                    <div className="animate-slideUp space-y-4 pt-2">
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {globalStayPlans.map((room) => (
                          <label
                            key={String(room.id)}
                            className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 p-2 transition-all ${
                              String(guest.addOns?.extraStay?.planId) === String(room.id)
                                ? 'border-[var(--theme)] bg-teal-50'
                                : 'border-stone-100 bg-white hover:border-teal-100'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`extra-stay-plan-${guest.id}`}
                              value={String(room.id)}
                              checked={
                                String(guest.addOns?.extraStay?.planId) === String(room.id)
                              }
                              onChange={() => updateExtraStayPlan(guest.id, room.id)}
                              className="hidden"
                            />

                            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg">
                              {room.image ? (
                                <img
                                  src={room.image}
                                  className="h-full w-full object-cover"
                                  alt={room.name}
                                />
                              ) : (
                                <div className="h-full w-full bg-stone-100" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <h5 className="truncate text-[9px] font-bold text-stone-900">
                                {room.name}
                              </h5>
                              <p className="text-[8px] font-black text-[var(--theme)]">
                                ₹{room.pricePerNight}/nt
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>

                      <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="flex-1 space-y-1">
                          <label className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-stone-500">
                            <Calendar className="h-3 w-3 text-[var(--theme)]" />
                            {ui.guestCard.extraStay?.startDate || 'Start Date'}
                          </label>
                          <input
                            type="date"
                            readOnly
                            min={minExtraStayStartDate || undefined}
                            value={guest.addOns?.extraStay?.startDate || minExtraStayStartDate}
                            onChange={(e) =>
                              updateExtraStayStartDate(guest.id, e.target.value)
                            }
                            className="w-full rounded-lg border-2 border-stone-100 bg-stone-100 px-3 py-2 text-xs font-bold text-stone-500 outline-none cursor-not-allowed"
                          />
                          {minExtraStayStartDate && (
                            <p className="text-[9px] font-bold text-stone-500">
                              Starts exactly from {formatDateShort(minExtraStayStartDate)}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1 sm:w-32">
                          <label className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-stone-500">
                            <Clock className="h-3 w-3 text-[var(--theme)]" />
                            {ui.guestCard.extraStay?.duration || 'Duration'}
                          </label>
                          <div className="flex items-center justify-between rounded-lg border-2 border-stone-100 bg-white px-2 py-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                updateExtraStayDays(
                                  guest.id,
                                  Math.max(
                                    1,
                                    Number(guest.addOns?.extraStay?.days || 1) - 1
                                  )
                                )
                              }
                              className="font-black text-stone-400 hover:text-[var(--theme)]"
                            >
                              <Minus className="h-4 w-4" />
                            </button>

                            <span className="text-xs font-black text-stone-900">
                              {guest.addOns?.extraStay?.days || 1}nt
                            </span>

                            <button
                              type="button"
                              disabled={Number(guest.addOns?.extraStay?.days || 1) >= 10}
                              onClick={() =>
                                updateExtraStayDays(
                                  guest.id,
                                  Number(guest.addOns?.extraStay?.days || 1) + 1
                                )
                              }
                              className={`font-black transition-all ${
                                Number(guest.addOns?.extraStay?.days || 1) >= 10 
                                  ? 'text-stone-200 cursor-not-allowed' 
                                  : 'text-stone-400 hover:text-[var(--theme)]'
                              }`}
                            >
                              <PlusCircle className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-[8px] font-bold text-stone-400 uppercase text-center mt-1">Max 10 days</p>
                        </div>

                        <div className="flex-1 space-y-1">
                          <label className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-stone-500">
                            <Calendar className="h-3 w-3 text-[var(--theme)]" />
                            {ui.guestCard.extraStay?.endDate || 'End Date'}
                          </label>
                          <div className="flex h-[38px] items-center rounded-lg border-2 border-stone-100 bg-white px-3 text-xs font-bold text-stone-900">
                            {guest.addOns?.extraStay?.endDate
                              ? formatDateShort(guest.addOns.extraStay.endDate)
                              : 'TBD'}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-teal-100 bg-white p-3">
                        <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                          <span>Rate</span>
                          <span>₹{Number(guest.addOns?.extraStay?.price || 0)}/night</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-xs font-black text-stone-900">
                          <span>Total</span>
                          <span>
                            ₹
                            {Number(guest.addOns?.extraStay?.price || 0) *
                              Number(guest.addOns?.extraStay?.days || 1)}
                          </span>
                        </div>
                      </div>

                      {minExtraStayStartDate &&
                        guest.addOns?.extraStay?.startDate &&
                        guest.addOns.extraStay.startDate < minExtraStayStartDate && (
                          <ErrorLabel
                            message={`Start date must be after event end date. Minimum allowed: ${formatDateShort(
                              minExtraStayStartDate
                            )}`}
                          />
                        )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-0 mt-8 flex items-center justify-between gap-3 border-t border-stone-200 bg-white/95 px-2 py-4 backdrop-blur">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-stone-200 px-5 py-3 text-xs font-black text-stone-700 transition-all hover:bg-stone-50"
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleProceedClick}
          className="flex items-center gap-2 rounded-xl bg-[var(--theme)] px-5 py-3 text-xs font-black text-white transition-all hover:bg-[var(--theme-dark)]"
        >
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {showAddOnInfo && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
              <h3 className="text-sm font-black text-stone-900">
                {getInfoContent(showAddOnInfo)?.title || 'Add-on Info'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddOnInfo(null)}
                className="rounded-lg p-2 hover:bg-stone-100"
              >
                <X className="h-4 w-4 text-stone-500" />
              </button>
            </div>

            {getInfoContent(showAddOnInfo)?.img && (
              <img
                src={getInfoContent(showAddOnInfo)?.img}
                alt={getInfoContent(showAddOnInfo)?.title}
                className="h-44 w-full object-cover"
              />
            )}

            <div className="px-5 py-4">
              <p className="whitespace-pre-line text-sm leading-6 text-stone-700">
                {getInfoContent(showAddOnInfo)?.desc || 'No details available.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {showKidsModal && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-black text-stone-900">
              Kids Plan Confirmation
            </h3>
            <p className="mt-2 text-sm text-stone-600">
              We found guest(s) aged between 4 and 17. Please confirm if they should be considered under the kids plan.
            </p>

            <div className="mt-5 space-y-3">
              {eligibleKids.map((guest: any) => (
                <div
                  key={guest.id}
                  className="flex items-center justify-between rounded-2xl border border-stone-200 p-4"
                >
                  <div>
                    <p className="text-sm font-black text-stone-900">{guest.name || 'Guest'}</p>
                    <p className="text-xs font-medium text-stone-500">Age: {guest.age}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => toggleKidsPlan(String(guest.id), true)}
                      className={`rounded-xl px-4 py-2 text-xs font-black ${
                        guest.isKidsPlanOpted
                          ? 'bg-stone-900 text-white'
                          : 'border border-stone-200 text-stone-700'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleKidsPlan(String(guest.id), false)}
                      className={`rounded-xl px-4 py-2 text-xs font-black ${
                        guest.isKidsPlanOpted === false
                          ? 'bg-stone-900 text-white'
                          : 'border border-stone-200 text-stone-700'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowKidsModal(false)}
                className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-black text-stone-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowKidsModal(false);
                  onProceed();
                }}
                className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-black text-white"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestForm;
