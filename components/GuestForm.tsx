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
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli', 'Daman and Diu', 'Delhi',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand',
  'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
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
  'Lotvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi',
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
  eventIds?: number[] | string;
  EventID?: number[] | string;
  planIds?: number[] | string;
  planID?: number[] | string | number;
  isVisible?: boolean;
  isActive?: boolean | number;
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
  id: number | string;
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

  const filteredCountries = useMemo(
    () => COUNTRIES.filter((c) => c.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-[42px] w-full items-center justify-between rounded-xl border-2 px-4 py-2 text-sm font-bold text-stone-900 transition-all ${
          hasError ? 'border-red-200 bg-red-50' : 'border-stone-100 bg-stone-50 hover:border-stone-200'
        }`}
      >
        <span className="flex items-center gap-2 truncate">
          <Globe className={`h-3.5 w-3.5 shrink-0 ${hasError ? 'text-red-500' : 'text-teal-700'}`} />
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
                  className="w-full rounded-lg border border-stone-200 bg-white py-2 pl-9 pr-4 text-xs font-bold focus:border-teal-500 focus:outline-none"
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
                    className={`w-full px-4 py-2.5 text-left text-xs font-bold transition-all hover:bg-teal-50 ${
                      value === country ? 'bg-teal-50 text-teal-700' : 'text-stone-700'
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
  onProceed,
  onBack,
}) => {
  const [showAddOnInfo, setShowAddOnInfo] = useState<string | null>(null);
  const [showKidsModal, setShowKidsModal] = useState(false);
  const [touched, setTouched] = useState(false);

  const parseIds = (value: any): number[] => {
    if (Array.isArray(value)) {
      return value.map(Number).filter((n) => !isNaN(n));
    }

    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => Number(item.trim()))
        .filter((n) => !isNaN(n));
    }

    if (value !== null && value !== undefined && value !== '') {
      const num = Number(value);
      return isNaN(num) ? [] : [num];
    }

    return [];
  };

 const normalizeStayPlan = (room: any): RelatedStayPlan => {
  const planId = Number(room.planID ?? room.PlanID ?? room.id);

  const pricePerNight = Number(
    room.pricePerNight ??
    room.price ??
    room.OfferPrice ??
    room.PlanPrice ??
    0
  );

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
    image:
      room.image ??
      room.img ??
      room.thumbnail ??
      room.images?.find((img: any) => img?.isThumbnail)?.imageUrl ??
      room.images?.find((img: any) => img?.isMain)?.imageUrl ??
      '',
  };
};

// Logic for dynamic stay addon title
const stayAddonFromDb = useMemo(() => {
    return addons?.find(a => String(a.type).toLowerCase() === 'stay');
}, [addons]);

const stayAddonTitle = useMemo(() => {
    return stayAddonFromDb?.title || stayAddonFromDb?.AddonTitle || ui.guestCard.addons.extraStay;
}, [stayAddonFromDb, ui]);

// ✅ Logic for dynamic Kids Plan content from backend
const kidsAddonFromDb = useMemo(() => {
    // Looks for an addon marked as 'Kid' type or contains 'Kid' in the title
    return addons?.find(a => 
        String(a.type).toLowerCase() === 'kid' || 
        String(a.title || a.AddonTitle).toLowerCase().includes('kid')
    );
}, [addons]);

 const stayAddons = useMemo(() => {
  return (addons || []).filter((addon: any) => {
    const addonEventIds = parseIds(addon.eventIds ?? addon.EventID);
    const addonPlanIds = parseIds(addon.planIds ?? addon.planID);
    const normalizedType = String(addon.type || '').trim().toLowerCase();

    const eventMatch =
      addonEventIds.length === 0 || addonEventIds.includes(Number(selectedEventId));

    const planMatch =
      addonPlanIds.length === 0 || addonPlanIds.includes(Number(selectedPlanId));

    const visibleMatch =
      addon.isVisible === undefined ||
      addon.isVisible === null ||
      addon.isVisible !== false;

    const activeMatch =
      addon.isActive === undefined ||
      addon.isActive === null ||
      Number(addon.isActive) !== 0;

    const typeMatch = normalizedType === 'stay';

    return eventMatch && planMatch && visibleMatch && activeMatch && typeMatch;
  });
}, [addons, selectedEventId, selectedPlanId]);

  const fallbackStayPlans = useMemo(() => {
    return (roomTypes || [])
      .map(normalizeStayPlan)
      .filter(
        (room: any) =>
          !isNaN(Number(room.id)) &&
          Number(room.pricePerNight) > 0
      );
  }, [roomTypes]);

const globalStayPlans = useMemo(() => {
  const allowedPlanIds = Array.from(
    new Set(
      stayAddons.flatMap((addon: any) =>
        parseIds(addon.planIds ?? addon.planID).filter(
          (id) => !isNaN(id) && id > 0
        )
      )
    )
  );

  const mappedPlans = (roomTypes || []).map((room: any) => {
    const planId = Number(room.planID ?? room.PlanID ?? room.id);

    const pricePerNight = Number(
      room.pricePerNight ??
      room.price ??
      room.OfferPrice ??
      room.PlanPrice ??
      0
    );

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
      image:
        room.image ??
        room.img ??
        room.thumbnail ??
        room.images?.find((img: any) => img?.isThumbnail)?.imageUrl ??
        room.images?.find((img: any) => img?.isMain)?.imageUrl ??
        '',
    };
  });

  if (allowedPlanIds.length === 0) {
    return mappedPlans.filter(
      (room: any) =>
        !isNaN(Number(room.id)) &&
        Number(room.pricePerNight) > 0
    );
  }

  return mappedPlans.filter(
    (room: any) =>
      !isNaN(Number(room.id)) &&
      allowedPlanIds.includes(Number(room.id)) &&
      Number(room.pricePerNight) > 0
  );
}, [roomTypes, stayAddons]);
  const showExtraStaySection = globalStayPlans.length > 0;

const getDefaultExtraStay = () => {
  const firstPlan = globalStayPlans[0];

  return {
    enabled: false,
    type: firstPlan?.name || '',
    planId: firstPlan?.id || '',
    price: Number(firstPlan?.pricePerNight || 0),
    startDate: '',
    endDate: '',
    days: 1,
  };
};

  useEffect(() => {
    if (!showExtraStaySection) return;

    const normalizedGuests = guests.map((guest: any) => {
      const existingExtraStay = guest?.addOns?.extraStay || {};
      const matchedPlan = globalStayPlans.find(
        (plan) => String(plan.id) === String(existingExtraStay.planId)
      );

      return {
        ...guest,
        addOns: {
          ...(guest.addOns || {}),
          selectedAddons: guest.addOns?.selectedAddons || [],
          extraStay: {
  enabled: existingExtraStay.enabled ?? false, 
  type: existingExtraStay.type || matchedPlan?.name || getDefaultExtraStay().type,
  planId: existingExtraStay.planId || matchedPlan?.id || getDefaultExtraStay().planId,price: Number(
              existingExtraStay.price ??
                matchedPlan?.pricePerNight ??
                getDefaultExtraStay().price ??
                0
            ),
            startDate: existingExtraStay.startDate || '',
            endDate: existingExtraStay.endDate || '',
            days: Number(existingExtraStay.days || 1),
          },
        },
      };
    });

    const hasDiff = JSON.stringify(normalizedGuests) !== JSON.stringify(guests);
    if (hasDiff) {
      setGuests(normalizedGuests);
    }
  }, [showExtraStaySection, globalStayPlans]);

  const eventAddons = useMemo(() => {
    return (addons || []).filter((addon: any) => {
      const addonEventIds = parseIds(addon.eventIds ?? addon.EventID);
      const addonPlanIds = parseIds(addon.planIds ?? addon.planID);

      const eventMatch =
        addonEventIds.length === 0 || addonEventIds.includes(Number(selectedEventId));

      const planMatch =
        addonPlanIds.length === 0 || addonPlanIds.includes(Number(selectedPlanId));

      return (
        eventMatch &&
        planMatch &&
        addon.isVisible !== false &&
        Number(addon.isActive ?? 1) !== 0 &&
        String(addon.type || '').toLowerCase() !== 'stay'
      );
    });
  }, [addons, selectedEventId, selectedPlanId]);

  const getGuestErrors = (g: Guest | any) => {
    const errors: any = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!g.name?.trim()) errors.name = 'Name is required';
    if (!g.email?.trim()) errors.email = 'Email is required';
    else if (!emailRegex.test(g.email)) errors.email = 'Invalid email format';

    if (!g.phone?.trim()) errors.phone = 'Phone is required';
    else if (String(g.phone).length < 10) errors.phone = 'Min 10 digits required';

    if (!g.age || Number(g.age) <= 0) errors.age = 'Age is required';
    if (!g.country) errors.country = 'Country is required';
    if (!g.state) errors.state = 'State is required';
    if (!g.city?.trim()) errors.city = 'City is required';

    return errors;
  };

  const allGuestsValid = useMemo(
    () => guests.every((g: any) => Object.keys(getGuestErrors(g)).length === 0),
    [guests]
  );

  const eligibleKids = useMemo(
    () => guests.filter((g: any) => Number(g.age) >= 4 && Number(g.age) <= 17),
    [guests]
  );

  const updateGuest = (id: string, updates: any) => {
    const updatedGuests = guests.map((g: any) => {
      if (String(g.id) !== String(id)) return g;

      if (updates.addOns) {
        return {
          ...g,
          addOns: {
            ...(g.addOns || {}),
            ...updates.addOns,
            selectedAddons:
              updates.addOns.selectedAddons ??
              g.addOns?.selectedAddons ??
              [],
            extraStay: {
              ...(g.addOns?.extraStay || getDefaultExtraStay()),
              ...(updates.addOns.extraStay || {}),
            },
          },
        };
      }

      return { ...g, ...updates };
    });

    setGuests(updatedGuests);
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
    setGuests(guests.filter((g: any) => String(g.id) !== String(id)));
  };

  const toggleKidsPlan = (guestId: string, opted: boolean) => {
    setGuests(
      guests.map((g: any) =>
        String(g.id) === String(guestId) ? { ...g, isKidsPlanOpted: opted } : g
      )
    );
  };

  const getAddonPriceForGuest = (addon: any, guest: any) => {
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

  const toggleGuestAddon = (guestId: string, addon: any) => {
    const guest = guests.find((g: any) => String(g.id) === String(guestId));
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

  const calculateEndDate = (startDate: string, days: number) => {
    if (!startDate) return '';
    const date = new Date(startDate);
    date.setDate(date.getDate() + Number(days || 0));
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateShort = (dateStr: string) => {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
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
          ui?.modals?.stay?.desc ??
          'Add stay before or after the event.',
        img: stayAddonFromDb?.bannerImage ?? ui?.modals?.stay?.img ?? '',
      };
    }

    return null;
  };

  const handleProceedClick = () => {
    setTouched(true);

    if (!allGuestsValid) return;

   if (showExtraStaySection) {
  const invalidExtraStayGuest = guests.find(
    (g: any) =>
      g.addOns?.extraStay?.enabled &&
      (!g.addOns?.extraStay?.planId ||
        !g.addOns?.extraStay?.startDate)
  );

      if (invalidExtraStayGuest) {
        alert('Please select stay start date.');
        return;
      }
    }

    if (eligibleKids.length > 0) {
      setShowKidsModal(true);
    } else {
      onProceed();
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl animate-fadeIn px-4 py-8 pb-40">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-stone-900">
            {ui.header.title}
          </h2>
          <p className="flex items-center gap-2 text-sm font-medium text-stone-600">
            <Sparkles className="h-4 w-4 text-teal-700" /> {ui.header.subtitle}
          </p>
        </div>

        <button
          onClick={addGuest}
          className="flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2 text-xs font-bold text-white shadow-md transition-all active:scale-95 hover:bg-teal-800"
        >
          <PlusCircle className="h-4 w-4" /> {ui.header.addGuest}
        </button>
      </div>

      <div className="space-y-6">
        {guests.map((guest: any, index) => {
          const errors = getGuestErrors(guest);

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
                    {ui.guestCard.fields.name} <span className="text-teal-700 font-black ml-0.5">#</span>
                  </label>
                  <input
                    type="text"
                    value={guest.name}
                    onChange={(e) => updateGuest(guest.id, { name: e.target.value })}
                    placeholder={ui.guestCard.fields.namePlaceholder}
                    className={`h-[42px] w-full rounded-xl border-2 px-4 py-2 text-sm font-bold text-stone-900 outline-none transition-all placeholder:text-stone-300 ${
                      touched && errors.name
                        ? 'border-red-200 bg-white'
                        : 'border-stone-100 bg-stone-50 focus:border-teal-700 focus:bg-white'
                    }`}
                  />
                  {touched && <ErrorLabel message={errors.name} />}
                </div>

                <div className="space-y-1">
                  <label className="ml-0.5 text-[10px] font-black uppercase tracking-widest text-stone-700">
                    {ui.guestCard.fields.phone} <span className="text-teal-700 font-black ml-0.5">#</span>
                  </label>
                  <input
                    type="tel"
                    value={guest.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      updateGuest(guest.id, { phone: val });
                    }}
                    placeholder={ui.guestCard.fields.phonePlaceholder}
                    className={`h-[42px] w-full rounded-xl border-2 px-4 py-2 text-sm font-bold text-stone-900 outline-none transition-all placeholder:text-stone-300 ${
                      touched && errors.phone
                        ? 'border-red-200 bg-white'
                        : 'border-stone-100 bg-stone-50 focus:border-teal-700 focus:bg-white'
                    }`}
                  />
                  {touched && <ErrorLabel message={errors.phone} />}
                </div>

                <div className="space-y-1">
                  <label className="ml-0.5 text-[10px] font-black uppercase tracking-widest text-stone-700">
                    {ui.guestCard.fields.email} <span className="text-teal-700 font-black ml-0.5">#</span>
                  </label>
                  <input
                    type="email"
                    value={guest.email}
                    onChange={(e) => updateGuest(guest.id, { email: e.target.value })}
                    placeholder={ui.guestCard.fields.emailPlaceholder}
                    className={`h-[42px] w-full rounded-xl border-2 px-4 py-2 text-sm font-bold text-stone-900 outline-none transition-all placeholder:text-stone-300 ${
                      touched && errors.email
                        ? 'border-red-200 bg-white'
                        : 'border-stone-100 bg-stone-50 focus:border-teal-700 focus:bg-white'
                    }`}
                  />
                  {touched && <ErrorLabel message={errors.email} />}
                </div>

                <div className="space-y-1">
                  <label className="ml-0.5 text-[10px] font-black uppercase tracking-widest text-stone-700">
                    {ui.guestCard.fields.age} <span className="text-teal-700 font-black ml-0.5">#</span>
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
                        : 'border-stone-100 bg-stone-50 focus:border-teal-700 focus:bg-white'
                    }`}
                  />
                  {touched && <ErrorLabel message={errors.age} />}
                </div>

                <div className="space-y-1">
                  <label className="ml-0.5 text-[10px] font-black uppercase tracking-widest text-stone-700">
                    Gender
                  </label>
                  <div className="flex gap-2">
                    {['Male', 'Female', 'Prefer not to say'].map((gender) => (
                      <label
                        key={gender}
                        className={`flex h-[42px] flex-1 cursor-pointer items-center justify-center rounded-xl border-2 p-2 text-center text-[10px] font-bold transition-all ${
                          guest.gender === gender
                            ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
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
                            ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                            : 'border-stone-100 bg-stone-100 text-stone-600 hover:border-stone-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`food-${guest.id}`}
                          checked={guest.foodPreference === pref}
                          onChange={() => updateGuest(guest.id, { foodPreference: pref })}
                          className="hidden"
                        />
                        {pref}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="ml-0.5 text-[10px] font-black uppercase tracking-widest text-stone-700">
                    Country <span className="text-teal-700 font-black ml-0.5">#</span>
                  </label>
                  <CountrySelector
                    value={guest.country || ''}
                    onChange={(val) => updateGuest(guest.id, { country: val, state: '' })}
                    hasError={touched && !!errors.country}
                  />
                  {touched && <ErrorLabel message={errors.country} />}
                </div>

                <div className="space-y-1">
                  <label className="ml-0.5 text-[10px] font-black uppercase tracking-widest text-stone-700">
                    State / Province <span className="text-teal-700 font-black ml-0.5">#</span>
                  </label>
                  {guest.country === 'India' ? (
                    <div className="relative">
                      <select
                        value={guest.state}
                        onChange={(e) => updateGuest(guest.id, { state: e.target.value })}
                        className={`h-[42px] w-full cursor-pointer appearance-none rounded-xl border-2 px-4 py-2 text-sm font-bold text-stone-900 outline-none ${
                          touched && errors.state
                            ? 'border-red-200 bg-white'
                            : 'border-stone-100 bg-stone-50 focus:border-teal-700'
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
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={guest.state}
                      onChange={(e) => updateGuest(guest.id, { state: e.target.value })}
                      placeholder="Enter state/province"
                      className={`h-[42px] w-full rounded-xl border-2 px-4 py-2 text-sm font-bold text-stone-900 outline-none transition-all placeholder:text-stone-300 ${
                        touched && errors.state
                          ? 'border-red-200 bg-white'
                          : 'border-stone-100 bg-stone-50 focus:border-teal-700'
                      }`}
                    />
                  )}
                  {touched && <ErrorLabel message={errors.state} />}
                </div>

                <div className="space-y-1">
                  <label className="ml-0.5 text-[10px] font-black uppercase tracking-widest text-stone-700">
                    City <span className="text-teal-700 font-black ml-0.5">#</span>
                  </label>
                  <input
                    type="text"
                    value={guest.city}
                    onChange={(e) => updateGuest(guest.id, { city: e.target.value })}
                    placeholder="e.g. Mumbai"
                    className={`h-[42px] w-full rounded-xl border-2 px-4 py-2 text-sm font-bold text-stone-900 outline-none transition-all placeholder:text-stone-300 ${
                      touched && errors.city
                        ? 'border-red-200 bg-white'
                        : 'border-stone-100 bg-stone-50 focus:border-teal-700'
                    }`}
                  />
                  {touched && <ErrorLabel message={errors.city} />}
                </div>

                <div className="space-y-1">
                  <label className="ml-0.5 text-[10px] font-black uppercase tracking-widest text-stone-700">
                    {ui.guestCard.fields.travel}
                  </label>
                  <div className="flex gap-2">
                    {[true, false].map((val) => (
                      <label
                        key={val ? 'y' : 'n'}
                        className={`flex h-[42px] flex-1 cursor-pointer items-center justify-center rounded-xl border-2 p-2 text-[11px] font-bold transition-all ${
                          guest.travelAssistance === val
                            ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                            : 'border-stone-100 bg-stone-100 text-stone-600 hover:border-stone-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`assist-${guest.id}`}
                          checked={guest.travelAssistance === val}
                          onChange={() => updateGuest(guest.id, { travelAssistance: val })}
                          className="hidden"
                        />
                        {val ? 'Yes' : 'No'}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-stone-100 pt-6">
                <h4 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-teal-700">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {ui.guestCard.addons.label}
                </h4>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {eventAddons.map((addon: any) => {
                    const selectedAddons = guest.addOns?.selectedAddons || [];
                    const addonId = String(addon.id ?? addon.AddonID ?? '');
                    const isSelected = selectedAddons.some(
                      (item: any) => String(item.addonId) === addonId
                    );
                    const guestPrice = getAddonPriceForGuest(addon, guest);

                    return (
                      <label
                        key={addonId}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                          isSelected
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-stone-100 bg-white hover:border-teal-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleGuestAddon(String(guest.id), addon)}
                          className="h-4 w-4 rounded-md accent-teal-700"
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

                {eventAddons.length === 0 && (
                  <div className="mt-2 rounded-xl border border-dashed border-stone-200 bg-stone-50 p-4 text-center">
                    <p className="text-xs font-medium text-stone-500">
                      No add-ons available for this event.
                    </p>
                  </div>
                )}
              </div>

              {showExtraStaySection && (
  <div className="mt-6 bg-stone-50 rounded-2xl p-4 border border-stone-100">
    <label className="flex items-center gap-3 cursor-pointer group mb-4">
      <input
        type="checkbox"
        checked={guest.addOns?.extraStay?.enabled || false}
        onChange={(e) =>
          updateGuest(guest.id, {
            addOns: {
              ...guest.addOns,
              extraStay: {
                ...guest.addOns?.extraStay,
                enabled: e.target.checked,
                ...(e.target.checked
                  ? {}
                  : {
                      startDate: '',
                      endDate: '',
                    }),
              },
            },
          })
        }
        className="w-5 h-5 rounded-md accent-teal-700"
      />
      <div className="flex-1">
        <span className="block font-black text-sm text-stone-900">
          {stayAddonTitle}
        </span>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setShowAddOnInfo('extraStay');
        }}
        className="p-1 hover:bg-stone-200 rounded-lg"
      >
        <Info className="w-4 h-4 text-teal-500" />
      </button>
    </label>

    {guest.addOns?.extraStay?.enabled && (
      <div className="animate-slideUp space-y-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {globalStayPlans.map((room: any) => (
            <label
              key={String(room.id)}
              className={`flex items-center gap-2 p-2 rounded-xl border-2 transition-all cursor-pointer ${
                String(guest.addOns?.extraStay?.planId) === String(room.id)
                  ? 'border-teal-700 bg-white ring-2 ring-teal-50'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <input
                type="radio"
                name={`room-${guest.id}`}
                checked={String(guest.addOns?.extraStay?.planId) === String(room.id)}
                onChange={() =>
                  updateGuest(guest.id, {
                    addOns: {
                      ...guest.addOns,
                      extraStay: {
                        ...guest.addOns?.extraStay,
                        enabled: true,
                        type: room.name,
                        planId: room.id,
                        price: Number(room.pricePerNight || 0),
                      },
                    },
                  })
                }
                className="hidden"
              />

              <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                {room.image ? (
                  <img
                    src={room.image}
                    className="w-full h-full object-cover"
                    alt={room.name}
                  />
                ) : (
                  <div className="w-full h-full bg-stone-100" />
                )}
              </div>

              <div className="min-w-0">
                <h5 className="font-bold text-stone-900 text-[9px] truncate">
                  {room.name}
                </h5>
                <p className="text-teal-700 font-black text-[8px]">
                  ₹{room.pricePerNight}/nt per person
                </p>
              </div>
            </label>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-1">
            <label className="text-[9px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-teal-700" />
              {ui.guestCard.extraStay.startDate}
            </label>
            <input
              type="date"
              value={guest.addOns?.extraStay?.startDate || ''}
              onChange={(e) =>
                updateGuest(guest.id, {
                  addOns: {
                    ...guest.addOns,
                    extraStay: {
                      ...guest.addOns?.extraStay,
                      startDate: e.target.value,
                    },
                  },
                })
              }
              className="w-full bg-white border-2 border-stone-100 rounded-lg px-3 py-2 text-xs font-bold text-stone-900 focus:border-teal-700 outline-none"
            />
          </div>

          <div className="sm:w-32 space-y-1">
            <label className="text-[9px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-teal-700" />
              {ui.guestCard.extraStay.duration}
            </label>
            <div className="flex items-center justify-between bg-white border-2 border-stone-100 rounded-lg px-2 py-1.5">
              <button
                type="button"
                onClick={() =>
                  updateGuest(guest.id, {
                    addOns: {
                      ...guest.addOns,
                      extraStay: {
                        ...guest.addOns?.extraStay,
                        days: Math.max(
                          1,
                          Number(guest.addOns?.extraStay?.days || 1) - 1
                        ),
                      },
                    },
                  })
                }
                className="text-stone-400 hover:text-teal-700 font-black"
              >
                <Minus className="w-4 h-4" />
              </button>

              <span className="font-black text-xs text-stone-900">
                {guest.addOns?.extraStay?.days || 1}nt
              </span>

              <button
                type="button"
                onClick={() =>
                  updateGuest(guest.id, {
                    addOns: {
                      ...guest.addOns,
                      extraStay: {
                        ...guest.addOns?.extraStay,
                        days: Number(guest.addOns?.extraStay?.days || 1) + 1,
                      },
                    },
                  })
                }
                className="text-stone-400 hover:text-teal-700 font-black"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-[1.2] bg-teal-700 px-4 py-2.5 rounded-xl text-white flex flex-col justify-center">
            <span className="text-[8px] font-black text-teal-200 uppercase tracking-widest mb-1">
              {ui.guestCard.extraStay.periodLabel}
            </span>
            <div className="flex items-center gap-2 text-[10px] font-black">
              <span>{formatDateShort(guest.addOns?.extraStay?.startDate || '')}</span>
              <ArrowRight className="w-3 h-3 text-teal-300" />
              <span>
                {calculateEndDate(
                  guest.addOns?.extraStay?.startDate || '',
                  Number(guest.addOns?.extraStay?.days || 1)
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
)}

              <div className="mt-5">
                <label className="mb-2 ml-1 block text-[10px] font-black uppercase tracking-widest text-stone-700">
                  {ui.guestCard.remark}
                </label>
                <textarea
                  value={guest.remark}
                  onChange={(e) => updateGuest(guest.id, { remark: e.target.value })}
                  placeholder={ui.guestCard.remarkPlaceholder}
                  rows={2}
                  className="w-full resize-none rounded-xl border-2 border-stone-100 bg-stone-50 px-4 py-2.5 text-sm font-bold text-stone-900 outline-none transition-all placeholder:text-stone-300 focus:border-teal-700 focus:bg-white"
                />
              </div>
            </div>
          );
        })}

        <button
          onClick={addGuest}
          className="group flex w-full flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-stone-300 py-10 text-stone-400 transition-all hover:border-teal-400 hover:bg-stone-50 hover:text-teal-700"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 shadow-sm group-hover:bg-white">
            <PlusCircle className="h-6 w-6" />
          </div>
          <span className="text-xs font-black uppercase tracking-[0.2em]">{ui.addPartner}</span>
        </button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-[100] border-t border-stone-200 bg-white/95 p-6 shadow-2xl backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl gap-4">
          <button
            onClick={onBack}
            className="flex-1 rounded-xl border-2 border-stone-100 bg-white py-3.5 text-[11px] font-black uppercase tracking-widest text-stone-500 transition-all hover:bg-stone-50"
          >
            {ui.footer.back}
          </button>

          <button
            onClick={handleProceedClick}
            className={`group flex-[2] rounded-xl py-3.5 text-base font-black transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg ${
              !allGuestsValid && touched
                ? 'cursor-not-allowed bg-stone-200 text-stone-400'
                : 'bg-teal-700 text-white hover:bg-teal-800'
            }`}
          >
            {ui.footer.proceed}
            <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {showAddOnInfo &&
        (() => {
          const info = getInfoContent(showAddOnInfo);
          if (!info) return null;

          return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-stone-900/80 p-6 backdrop-blur-sm">
              <div className="animate-scaleUp w-full max-w-sm overflow-hidden rounded-[32px] bg-white shadow-2xl">
                <div className="relative h-40">
                  {info.img ? (
                    <img src={info.img} className="h-full w-full object-cover" alt="" />
                  ) : (
                    <div className="h-full w-full bg-stone-100" />
                  )}

                  <button
                    onClick={() => setShowAddOnInfo(null)}
                    className="absolute right-4 top-4 rounded-xl bg-white/20 p-2 text-white backdrop-blur-xl transition-all hover:bg-white/40"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                </div>

                <div className="p-8">
                  <h3 className="mb-4 text-xl font-black tracking-tighter text-stone-900">
                    {info.title}
                  </h3>
                  <p className="mb-8 text-xs font-medium leading-relaxed text-stone-500">
                    {info.desc}
                  </p>
                  <button
                    onClick={() => setShowAddOnInfo(null)}
                    className="w-full rounded-xl bg-stone-900 py-3 text-sm font-black text-white transition-all hover:bg-black"
                  >
                    Okay
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {showKidsModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-stone-900/90 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg overflow-hidden rounded-[40px] bg-white shadow-2xl animate-scaleUp">
            <div className="bg-teal-700 p-8 text-white">
              <Sparkles className="mb-4 h-10 w-10 text-teal-300 opacity-70" />
              <h3 className="text-2xl font-black uppercase leading-none tracking-tighter">
                {/* ✅ DYNAMIC TITLE FROM DB */}
                {kidsAddonFromDb?.title || kidsAddonFromDb?.AddonTitle || 'Kids Explorer Plan'}
              </h3>
              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-teal-100 opacity-80">
                Exclusive for ages 4-17 • ₹10,000 Flat
              </p>
            </div>

            <div className="space-y-6 p-8">
              {/* ✅ DYNAMIC DESCRIPTION FROM DB */}
              {kidsAddonFromDb?.description || kidsAddonFromDb?.AddonDescription ? (
                <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100">
                   <p className="text-xs text-stone-600 font-medium leading-relaxed whitespace-pre-line">
                      {kidsAddonFromDb?.description || kidsAddonFromDb?.AddonDescription}
                   </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                    {[
                    { icon: <Wind className="h-4 w-4" />, label: 'Adventure Park' },
                    { icon: <Sun className="h-4 w-4" />, label: 'Guided Sports' },
                    { icon: <Flower2 className="h-4 w-4" />, label: 'Zen Arts Craft' },
                    { icon: <Utensils className="h-4 w-4" />, label: 'Kids Buffet' },
                    ].map((item, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-2.5 rounded-2xl border border-stone-100 bg-stone-50 p-3"
                    >
                        <div className="text-teal-700">{item.icon}</div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-stone-600">
                        {item.label}
                        </span>
                    </div>
                    ))}
                </div>
              )}

              <div className="border-t border-stone-100 pt-6">
                <p className="mb-4 text-center text-[10px] font-black uppercase tracking-widest text-stone-400">
                  Opt-in for your juniors
                </p>

                <div className="custom-scrollbar max-h-40 space-y-2 overflow-y-auto pr-2">
                  {eligibleKids.map((kid: any) => (
                    <div
                      key={kid.id}
                      className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 p-4"
                    >
                      <div>
                        <p className="text-sm font-black text-stone-900">
                          {kid.name || 'Junior Guest'}
                        </p>
                        <p className="text-[10px] font-bold uppercase text-stone-400">
                          Age: {kid.age}
                        </p>
                      </div>

                      <button
                        onClick={() => toggleKidsPlan(kid.id, !kid.isKidsPlanOpted)}
                        className={`rounded-xl px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                          kid.isKidsPlanOpted
                            ? 'bg-teal-700 text-white shadow-md'
                            : 'border-2 border-stone-200 bg-white text-stone-400 hover:border-stone-300'
                        }`}
                      >
                        {kid.isKidsPlanOpted ? 'Applied' : 'Add Plan'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={onProceed}
                className="w-full rounded-2xl bg-stone-900 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all active:scale-95 hover:bg-black"
              >
                Proceed to Billing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestForm;