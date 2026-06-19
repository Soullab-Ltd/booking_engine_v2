import React, { useMemo, useState } from 'react';
import { Plan } from '../types';
import { sanitizeEnglishRichText, stripHtml } from '../src/utils/richText';
import {
  CheckCircle,
  ArrowRight,
  Wifi,
  Sun,
  Wind,
  Bed,
  ConciergeBell,
  DoorOpen,
  Utensils,
  UtensilsCrossed,
  ChevronLeft,
  Heart,
  Flower2,
  ChevronRight,
  Users,
  Bath,
  Ruler,
  Home,
  CircleParking,
  Building2,
  WavesLadder,
} from 'lucide-react';

interface PlanDetailProps {
  plan: Plan;
  onProceed: (apiGuests?: any) => void;
  onBack: () => void;
}

const PLAN_FEATURE_KEYS = [
  'planFeatures',
  'plan_features',
  'PlanFeatures',
  'PlanFeature',
  'featureList',
  'feature_list',
  'features',
] as const;

const FEATURE_LABEL_KEYS = [
  'label',
  'Label',
  'title',
  'Title',
  'name',
  'Name',
  'feature',
  'Feature',
  'featureName',
  'FeatureName',
  'feature_name',
  'displayLabel',
  'display_label',
  'heading',
  'Heading',
] as const;

const FEATURE_VALUE_KEYS = [
  'value',
  'Value',
  'description',
  'Description',
  'desc',
  'Desc',
  'featureValue',
  'FeatureValue',
  'feature_value',
  'displayValue',
  'display_value',
  'count',
  'Count',
  'quantity',
  'Quantity',
  'qty',
  'Qty',
] as const;

const FEATURE_ICON_KEYS = [
  'icon',
  'Icon',
  'iconName',
  'IconName',
  'icon_name',
  'iconKey',
  'IconKey',
  'type',
  'Type',
] as const;

const getFirstFeatureValue = (feature: any, keys: readonly string[]): string => {
  for (const key of keys) {
    const value = feature?.[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }

  return '';
};

const looksLikePlanFeature = (value: any): boolean => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;

  return [...FEATURE_LABEL_KEYS, ...FEATURE_VALUE_KEYS, ...FEATURE_ICON_KEYS].some(
    (key) => value?.[key] !== undefined && value?.[key] !== null && String(value[key]).trim()
  );
};

const getPriceTypeLabel = (priceType?: string) => {
  const normalized = String(priceType || '').trim().toLowerCase();
  const raw = String(priceType || '').trim();

  if (normalized === 'per_room') return 'per room';
  if (normalized === 'per_night') return 'per night';
  if (normalized === 'per_person_per_night') return 'per person / night';
  if (normalized === 'per_person') return 'per person';
  if (raw) return raw.replace(/_/g, ' ');

  return 'per person';
};

const getNightlyDisplayPrice = (plan: any) => {
  const nightlyPrice = Number(plan?.pricePerNight || 0);
  return Number.isFinite(nightlyPrice) && nightlyPrice > 0 ? nightlyPrice : 0;
};

const AmenityIcon = ({ name }: { name: string }) => {
  const n = name.toLowerCase();

  if (n.includes('wifi')) return <Wifi className="h-9 w-9" strokeWidth={2.2} />;
  if (n.includes('parking')) return <CircleParking className="h-9 w-9" strokeWidth={2.2} />;
  if (n.includes('elevator') || n.includes('lift')) {
    return <Building2 className="h-9 w-9" strokeWidth={2.2} />;
  }
  if (n.includes('swimming') || n.includes('pool')) {
    return <WavesLadder className="h-9 w-9" strokeWidth={2.2} />;
  }
  if (n.includes('heating') || n.includes('floor')) return <Sun className="h-9 w-9" strokeWidth={2.2} />;
  if (n.includes('spa')) return <Heart className="h-9 w-9" strokeWidth={2.2} />;
  if (n.includes('bed')) return <Bed className="h-9 w-9" strokeWidth={2.2} />;
  if (n.includes('meal') || n.includes('banquet') || n.includes('food')) {
    return <UtensilsCrossed className="h-9 w-9" strokeWidth={2.2} />;
  }
  if (n.includes('view') || n.includes('riverside')) return <Wind className="h-9 w-9" strokeWidth={2.2} />;
  if (n.includes('concierge') || n.includes('support')) {
    return <ConciergeBell className="h-9 w-9" strokeWidth={2.2} />;
  }
  if (n.includes('meditation') || n.includes('altar')) return <Flower2 className="h-9 w-9" strokeWidth={2.2} />;
  if (n.includes('private entry') || n.includes('deck')) {
    return <DoorOpen className="h-9 w-9" strokeWidth={2.2} />;
  }

  return <CheckCircle className="h-9 w-9" strokeWidth={2.2} />;
};

const getAmenityLabel = (name: string) => {
  const normalizedName = String(name || '').trim();
  const loweredName = normalizedName.toLowerCase();

  if (loweredName.includes('wifi')) return 'Wi‑Fi';
  if (loweredName.includes('parking')) return 'Parking';
  if (loweredName.includes('elevator') || loweredName.includes('lift')) return 'Elevator';
  if (loweredName.includes('meal') || loweredName.includes('banquet') || loweredName.includes('food')) {
    return 'Food';
  }
  if (loweredName.includes('swimming') || loweredName.includes('pool')) return 'Swimming pool';

  return normalizedName;
};

const PlanFeatureIcon = ({ iconName }: { iconName: string }) => {
  const normalizedIcon = String(iconName || '').trim().toLowerCase();

  if (normalizedIcon.includes('bed')) return <Bed className="h-5 w-5 text-[var(--theme)]" />;
  if (
    normalizedIcon.includes('bath') ||
    normalizedIcon.includes('toilet') ||
    normalizedIcon.includes('wash')
  ) {
    return <Bath className="h-5 w-5 text-[var(--theme)]" />;
  }
  if (
    normalizedIcon.includes('guest') ||
    normalizedIcon.includes('people') ||
    normalizedIcon.includes('user')
  ) {
    return <Users className="h-5 w-5 text-[var(--theme)]" />;
  }
  if (
    normalizedIcon.includes('sq') ||
    normalizedIcon.includes('area') ||
    normalizedIcon.includes('size')
  ) {
    return <Ruler className="h-5 w-5 text-[var(--theme)]" />;
  }
  if (
    normalizedIcon.includes('room') ||
    normalizedIcon.includes('home') ||
    normalizedIcon.includes('house')
  ) {
    return <Home className="h-5 w-5 text-[var(--theme)]" />;
  }

  return <CheckCircle className="h-5 w-5 text-[var(--theme)]" />;
};

const getDisplayFeatureText = (plan: any, feature: any): string => {
  const rawLabel = String(
    feature?.label || feature?.Label || feature?.title || feature?.Title || 'Feature'
  ).trim();
  const rawValue = String(feature?.value || feature?.Value || feature?.description || '').trim();
  const normalizedLabel = rawLabel.toLowerCase();
  const amenityTitles = (plan?.amenities || plan?.icons || [])
    .map((item: any) => String(item?.Title || item?.title || item || '').toLowerCase());
  const planTitle = String(plan?.PlanTitle || plan?.title || plan?.PlanName || '').toLowerCase();

  if (!rawValue && rawLabel) {
    return rawLabel;
  }

  if (normalizedLabel.includes('bath')) {
    const hasCommonBath = amenityTitles.some((item: string) =>
      item.includes('common bathroom') || item.includes('shared bathroom')
    );
    if (hasCommonBath) return 'Common';
    if (rawValue === '1') return '1 bathroom';
    return `${rawValue} ${rawLabel}`.trim();
  }

  if (normalizedLabel.includes('bed')) {
    const isDormPlan =
      planTitle.includes('dorm') ||
      amenityTitles.some((item: string) => item.includes('bunk bed'));
    const hasKingBed = amenityTitles.some((item: string) => item.includes('king size bed') || item.includes('private king bed'));
    const bedLabel = isDormPlan
      ? 'Bunk-bed'
      : hasKingBed
        ? 'bed (king size)'
        : Number(rawValue) === 1
          ? 'Bed'
          : 'beds';
    return `${rawValue} ${bedLabel}`.trim();
  }

  if (normalizedLabel.includes('guest')) {
    if (/^up to\s+\d+/i.test(rawValue)) {
      return `${rawValue} ${/up to\s+1\b/i.test(rawValue) ? 'guest' : 'guests'}`.trim();
    }
    return `${rawValue} ${Number(rawValue) === 1 ? 'Guest' : 'Guests'}`.trim();
  }

  if (normalizedLabel.includes('sq') || normalizedLabel.includes('area') || normalizedLabel.includes('size')) {
    return `${rawValue} sq. ft.`.trim();
  }

  return `${rawValue} ${rawLabel}`.trim() || rawLabel || '-';
};

const getPlanGuestCapacity = (plan: any): string => {
  const description = stripHtml(plan?.PlanDescription || plan?.description || '');

  const guestMatch =
    description.match(/(?:upto|up to)\s+(\d+)\s+guests?/i) ||
    description.match(/\b(\d+)\s+guests?\b/i);

  if (guestMatch?.[1]) return guestMatch[1];

  const capacityCandidates = [
    plan?.maxPax,
    plan?.maxGuests,
    plan?.maxOccupancy,
    plan?.capacity,
  ];

  for (const candidate of capacityCandidates) {
    const parsed = Number(candidate);
    if (Number.isFinite(parsed) && parsed > 0) {
      return String(parsed);
    }
  }

  return '';
};

const getPlanBathroomCount = (plan: any): string => {
  const description = stripHtml(
    plan?.fullDescription || plan?.longDescription || plan?.PlanDescription || plan?.description || ''
  );

  const bathroomMatch =
    description.match(/\b(\d+)\s*bathrooms?\b/i) ||
    description.match(/\battached\s+bathroom\b/i);

  if (bathroomMatch?.[1]) return bathroomMatch[1];
  if (bathroomMatch) return '1';

  return '';
};

const getPlanBedCount = (plan: any): string => {
  const description = stripHtml(
    plan?.fullDescription || plan?.longDescription || plan?.PlanDescription || plan?.description || ''
  );

  const digitMatch = description.match(/\b(\d+)\s+(?:single\s+)?beds?\b/i);
  if (digitMatch?.[1]) return digitMatch[1];

  const wordToNumber: Record<string, string> = {
    single: '1',
    one: '1',
    twin: '2',
    double: '2',
    two: '2',
    triple: '3',
    three: '3',
    quadruple: '4',
    four: '4',
  };

  const wordMatch = description.match(/\b(single|one|twin|double|two|triple|three|quadruple|four)\s+(?:occupancy|beds?)\b/i);
  if (wordMatch?.[1]) {
    return wordToNumber[wordMatch[1].toLowerCase()] || '';
  }

  return '';
};

const getPlanArea = (plan: any): string => {
  const description = stripHtml(
    plan?.fullDescription || plan?.longDescription || plan?.PlanDescription || plan?.description || ''
  );

  const areaMatch = description.match(/\b(\d+(?:\.\d+)?)\s*(?:sq\.?\s*ft\.?|square\s*feet)\b/i);
  if (areaMatch?.[1]) {
    const areaValue = Number(areaMatch[1]);
    return Number.isFinite(areaValue) ? areaValue.toLocaleString() : areaMatch[1];
  }

  return '';
};

const getPlanFeatureOverrides = (plan: any) => {
  const planTitle = String(plan?.PlanTitle || plan?.title || plan?.PlanName || '').toLowerCase();

  if (planTitle.includes('premium double')) {
    return [
      { id: 'override-bathroom', label: 'bathroom', value: '1', icon: 'bath' },
      { id: 'override-bed', label: 'bed (king size)', value: '1', icon: 'bed' },
      { id: 'override-area', label: 'sq. ft.', value: '250', icon: 'area' },
      { id: 'override-guests', label: 'guests', value: 'Up to 2', icon: 'guest' },
    ];
  }

  if (planTitle.includes('premium single')) {
    return [
      { id: 'override-bathroom', label: 'bathroom', value: '1', icon: 'bath' },
      { id: 'override-guests', label: 'guest', value: '1', icon: 'guest' },
      { id: 'override-area', label: 'sq. ft.', value: '400', icon: 'area' },
      { id: 'override-bed', label: 'king-size bed', value: '', icon: 'bed' },
    ];
  }

  if (planTitle.includes('pvi dorms') || planTitle.includes('dorm')) {
    return [
      { id: 'override-bed', label: 'bed', value: '1', icon: 'bed' },
      { id: 'override-guests', label: 'guest', value: '1', icon: 'guest' },
      { id: 'override-bathroom', label: 'bathroom', value: 'Common', icon: 'bath' },
    ];
  }

  return null;
};

const parseFeatureCollection = (rawValue: any): any[] => {
  let parsedValue = rawValue;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (Array.isArray(parsedValue)) return parsedValue;

    if (typeof parsedValue === 'string') {
      const trimmedValue = parsedValue.trim();
      if (!trimmedValue) return [];

      try {
        parsedValue = JSON.parse(trimmedValue);
        continue;
      } catch {
        return [];
      }
    }

    if (parsedValue && typeof parsedValue === 'object') {
      if (Array.isArray(parsedValue.items)) {
        parsedValue = parsedValue.items;
        continue;
      }

      if (looksLikePlanFeature(parsedValue)) {
        return [parsedValue];
      }

      return Object.values(parsedValue);
    }

    return [];
  }

  if (Array.isArray(parsedValue)) return parsedValue;
  if (parsedValue && typeof parsedValue === 'object') {
    return looksLikePlanFeature(parsedValue) ? [parsedValue] : Object.values(parsedValue);
  }

  return [];
};

const isPlanSoldOut = (plan: any) => {
  if (plan?.isSoldOut === true) return true;
  if (plan?.isSoldOut === false) return false;

  const availableRooms = Number(plan?.availableRooms ?? plan?.inventory?.availableRooms);

  if (!Number.isNaN(availableRooms)) {
    return availableRooms <= 0;
  }

  return Number(plan?.remainingInventory ?? 0) <= 0;
};

const PlanDetail: React.FC<PlanDetailProps> = ({ plan, onProceed }) => {
  const safeFullDescription = useMemo(
    () => sanitizeEnglishRichText(plan.fullDescription || plan.PlanDescription),
    [plan.PlanDescription, plan.fullDescription]
  );

  const planFeatures = useMemo(() => {
    let featureList: any[] = [];

    for (const key of PLAN_FEATURE_KEYS) {
      const parsedFeatures = parseFeatureCollection((plan as any)?.[key]);
      if (parsedFeatures.length > 0) {
        featureList = parsedFeatures;
        break;
      }
    }

    return featureList
      .map((feature: any, index: number) => ({
        ...feature,
        id:
          feature?.id ||
          feature?.ID ||
          feature?.featureId ||
          feature?.FeatureID ||
          `feature-${index}`,
        label: getFirstFeatureValue(feature, FEATURE_LABEL_KEYS),
        value: getFirstFeatureValue(feature, FEATURE_VALUE_KEYS),
        icon: getFirstFeatureValue(feature, FEATURE_ICON_KEYS) || 'check',
      }))
      .filter((feature: any) => feature?.label || feature?.value);
  }, [plan]);

  const sortedImages = useMemo(() => {
    const imgs = Array.isArray((plan as any)?.images) ? [...(plan as any).images] : [];

    return imgs.sort((a: any, b: any) => {
      const aMain = Number(a?.isMain) === 1 ? 1 : 0;
      const bMain = Number(b?.isMain) === 1 ? 1 : 0;

      if (bMain !== aMain) return bMain - aMain;

      const aThumb = Number(a?.isThumbnail) === 1 ? 1 : 0;
      const bThumb = Number(b?.isThumbnail) === 1 ? 1 : 0;

      if (bThumb !== aThumb) return bThumb - aThumb;

      return 0;
    });
  }, [plan]);

  const fallbackImage = '';

  const carouselImages = sortedImages.length
    ? sortedImages.map((img: any) => img.imageUrl).filter(Boolean)
    : [plan.thumbnail || plan.bannerImage || fallbackImage];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isHeroImageLoaded, setIsHeroImageLoaded] = useState(false);

  const goPrev = () => {
    setIsHeroImageLoaded(false);
    setActiveIndex((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1));
  };

  const goNext = () => {
    setIsHeroImageLoaded(false);
    setActiveIndex((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
  };

  const activeImage = carouselImages[activeIndex] || fallbackImage;
  const soldOut = isPlanSoldOut(plan);
  const finalPrice = Number(plan.finalPrice || plan.PlanPrice || 0);
  const rawOfferPrice = Number((plan as any).OfferPrice || 0);
  const displayPrice = Number(
    plan.discountedPrice || (rawOfferPrice > 0 ? rawOfferPrice : finalPrice)
  );
  const nightlyDisplayPrice = getNightlyDisplayPrice(plan);
  const hasValidOffer = rawOfferPrice > 0 && rawOfferPrice < finalPrice;
  const rawPriceTypeLabel = getPriceTypeLabel((plan as any).priceType);

  const nightlyPriceTypeLabel =
    rawPriceTypeLabel.includes('night') && nightlyDisplayPrice <= 0 ? '' : rawPriceTypeLabel;

  const planSubtitle = String(
    plan.PlanSubtitle || plan.stayRoomType || plan.PlanName || ''
  ).trim();

  const amenityList = (plan.amenities || plan.icons || []).slice(0, 6);

  const displayFeatures = useMemo(() => {
    if (planFeatures.length > 0) {
      return planFeatures;
    }

    const overriddenFeatures = getPlanFeatureOverrides(plan);
    if (overriddenFeatures?.length) {
      return overriddenFeatures;
    }

    const fallbackFeatures: Array<{
      id: string;
      label: string;
      value: string;
      icon: string;
    }> = [];

    const bathroomCount = getPlanBathroomCount(plan);
    if (bathroomCount) {
      fallbackFeatures.push({
        id: 'bathroom-count',
        label: bathroomCount === '1' ? 'bathroom' : 'bathrooms',
        value: bathroomCount,
        icon: 'bath',
      });
    }

    const area = getPlanArea(plan);
    if (area) {
      fallbackFeatures.push({
        id: 'room-area',
        label: 'sq. ft.',
        value: area,
        icon: 'area',
      });
    }

    const bedCount = getPlanBedCount(plan);
    if (bedCount) {
      fallbackFeatures.push({
        id: 'bed-count',
        label: Number(bedCount) === 1 ? 'bed' : 'beds',
        value: bedCount,
        icon: 'bed',
      });
    }

    const guestCapacity = getPlanGuestCapacity(plan);
    if (guestCapacity) {
      fallbackFeatures.push({
        id: 'guest-capacity',
        label: 'guests',
        value: `Up to ${guestCapacity}`,
        icon: 'guest',
      });
    }

    return fallbackFeatures.slice(0, 4);
  }, [plan, planFeatures]);

  const gstLabel =
    (plan as any).gstType === 'exclusive' && Number((plan as any).gstRate || 0) > 0
      ? `+ ${Number((plan as any).gstRate).toLocaleString()}% GST`
      : plan.gstDetails || '';

  return (
    <div className="animate-fadeIn pb-24 bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.12),_transparent_28%),linear-gradient(180deg,_#f7f7f4_0%,_#ffffff_28%,_#fcfcfb_100%)]">
      <div className="relative h-[380px] md:h-[430px] lg:h-[470px] w-full overflow-hidden">
        {!isHeroImageLoaded ? (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-stone-200 via-stone-300 to-stone-200" />
        ) : null}

        <img
          src={activeImage}
          alt={plan.PlanTitle || plan.PlanName || 'Plan image'}
          loading="eager"
          onLoad={() => setIsHeroImageLoaded(true)}
          onError={() => setIsHeroImageLoaded(true)}
          className={`w-full h-full object-cover brightness-75 scale-105 transition-all duration-500 ${
            isHeroImageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-white via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/65 via-stone-900/20 to-transparent" />

        {carouselImages.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-black/25 hover:bg-black/40 text-white p-3 rounded-full backdrop-blur-md transition"
              aria-label="Show previous plan image"
              title="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={goNext}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-black/25 hover:bg-black/40 text-white p-3 rounded-full backdrop-blur-md transition"
              aria-label="Show next plan image"
              title="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        <div className="absolute bottom-8 md:bottom-10 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="max-w-3xl rounded-[36px] border border-white/15 bg-white/10 p-5 md:p-7 backdrop-blur-xl shadow-2xl">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className="bg-[var(--theme)] text-white text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full shadow-lg">
                  Accommodation Tier
                </span>

                {planSubtitle ? (
                  <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-white/90">
                    {planSubtitle}
                  </span>
                ) : null}

                {soldOut ? (
                  <span className="relative z-[60] rounded-full bg-rose-500/90 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-lg">
                    Sold Out
                  </span>
                ) : null}
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-[-0.04em] drop-shadow-2xl">
                {plan.PlanTitle}
              </h1>

              <div className="mt-5 flex flex-wrap items-end gap-5 text-white">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/70">
                    {hasValidOffer ? 'Now Booking At' : 'Price'}
                  </p>
                  <p className="mt-2 text-2xl md:text-4xl lg:text-5xl font-black leading-none">
                    ₹ {displayPrice.toLocaleString()}
                  </p>
                </div>

                {hasValidOffer ? (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/60">
                      Original
                    </p>
                    <p className="mt-2 text-lg md:text-2xl font-bold text-white/65 line-through">
                      ₹ {finalPrice.toLocaleString()}
                    </p>
                  </div>
                ) : null}

                {nightlyDisplayPrice > 0 ? (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/60">
                      Per Day
                    </p>
                    <p className="mt-2 text-base md:text-xl font-bold text-white/90">
                      ₹ {nightlyDisplayPrice.toLocaleString()}
                      {nightlyPriceTypeLabel ? ` / ${nightlyPriceTypeLabel}` : ''}
                    </p>
                  </div>
                ) : null}
              </div>

              {gstLabel ? (
                <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-teal-100">
                  {gstLabel}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {carouselImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-2 backdrop-blur-md">
            {carouselImages.map((_: string, index: number) => (
              <button
                key={index}
                onClick={() => {
                  setIsHeroImageLoaded(false);
                  setActiveIndex(index);
                }}
                className={`h-2.5 w-2.5 rounded-full transition-all ${
                  index === activeIndex ? 'bg-white w-6' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {carouselImages.length > 1 ? (
        <div className="max-w-7xl mx-auto px-6 md:px-8 -mt-10 relative z-20">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {carouselImages.map((image: string, index: number) => (
              <button
                key={`${image}-${index}`}
                onClick={() => {
                  setIsHeroImageLoaded(false);
                  setActiveIndex(index);
                }}
                className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-2xl border transition-all ${
                  index === activeIndex
                    ? 'border-[var(--theme)] shadow-lg shadow-teal-100 scale-[1.02]'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <img
                  src={image}
                  alt={`${plan.PlanTitle} ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <span
                  className={`absolute inset-0 transition ${
                    index === activeIndex
                      ? 'ring-2 ring-inset ring-[var(--theme)]'
                      : 'bg-black/10'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-14 grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14">
        <div className="lg:col-span-8 space-y-10">
          <section className="animate-slideUp rounded-[32px] border border-stone-200/80 bg-white p-8 md:p-10 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-1 rounded-full bg-[var(--theme)]"></div>
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--theme)]">
                Description
              </h2>
            </div>

            <div
              className="text-[15px] md:text-[17px] text-stone-600 leading-7 font-normal space-y-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-6"
              dangerouslySetInnerHTML={{ __html: safeFullDescription }}
            />
          </section>

          <section className="rounded-[32px] border border-stone-200/80 bg-white p-8 md:p-10 shadow-[0_24px_80px_rgba(15,23,42,0.05)]">
            {displayFeatures.length > 0 ? (
              <>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-1 rounded-full bg-[var(--theme)]"></div>
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--theme)]">
                    Features
                  </h2>
                </div>

                <div className="mb-10 grid grid-cols-2 gap-x-5 gap-y-6 sm:flex sm:flex-wrap sm:items-start sm:gap-10">
                  {displayFeatures.map((feature: any, index: number) => (
                    <div
                      key={feature?.id || `${feature?.label || feature?.Label || 'feature'}-${index}`}
                      className="group flex flex-col items-center text-center"
                    >
                      <div className="flex h-11 w-11 items-center justify-center">
                        <PlanFeatureIcon
                          iconName={feature?.icon || feature?.Icon || feature?.iconName}
                        />
                      </div>

                      <span className="mt-2 text-[13px] md:text-[14px] font-medium text-stone-800 leading-snug">
                        {getDisplayFeatureText(plan, feature)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-1 rounded-full bg-[var(--theme)]"></div>
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--theme)]">
                Amenities & Comforts
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-x-6 gap-y-8 sm:flex sm:flex-wrap sm:items-start sm:gap-10">
              {amenityList.map((amenity: any) => (
                <div
                  key={amenity.id}
                  className="group flex flex-col items-center text-center"
                >
                  <div className="flex h-12 w-12 items-center justify-center text-[var(--theme)] transition-transform duration-300 group-hover:scale-110">
                    <AmenityIcon name={amenity.Title || amenity.title} />
                  </div>

                  <span className="mt-2 text-[13px] md:text-[14px] font-medium text-stone-800 leading-snug">
                    {getAmenityLabel(amenity.Title || amenity.title)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <div className="p-8 md:p-10 bg-[linear-gradient(135deg,_#10201f_0%,_#172b2a_55%,_#0f766e_100%)] rounded-[40px] text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-stone-200">
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center shrink-0 shadow-lg backdrop-blur-sm border border-white/10">
              <Heart className="w-10 h-10" />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-teal-100/70 mb-2">
                Need Help Booking?
              </p>
              <h3 className="text-2xl font-black mb-2">Need Assistance?</h3>
              <p className="text-teal-50/90 leading-relaxed font-medium">
                Please contact our customer support @{' '}
                <a
                  href="tel:9867666444"
                  className="underline underline-offset-4 decoration-teal-200"
                >
                  9867666444
                </a>{' '}
                for any queries.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 relative">
  <div className="sticky top-24 rounded-[36px] border border-stone-200/80 bg-white p-7 md:p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
    <div className="absolute inset-x-0 top-0 h-1 rounded-t-[36px] bg-gradient-to-r from-[var(--theme)] via-teal-300 to-transparent" />

    <div className="relative z-10">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[var(--theme)]/80 mb-5">
        Your Stay Summary
      </p>

      <div className="pb-6 border-b border-stone-200">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
          Selected Stay
        </p>

        <h3 className="mt-2 text-2xl md:text-[28px] leading-tight font-black text-stone-900 tracking-tight">
          {plan.PlanTitle || plan.PlanName}
        </h3>

        {planSubtitle ? (
          <p className="mt-2 text-sm text-stone-500 font-medium">
            {planSubtitle}
          </p>
        ) : null}
      </div>

      <div className="py-6 border-b border-stone-200">
        {hasValidOffer ? (
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-stone-400">
              Original Price
            </span>
            <span className="text-sm font-bold text-stone-400 line-through">
              ₹ {finalPrice.toLocaleString()}
            </span>
          </div>
        ) : null}

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--theme)]">
              {hasValidOffer ? 'Now Booking At' : 'Price'}
            </p>
            <p className="mt-2 break-words text-4xl md:text-5xl font-black leading-none text-stone-900">
              ₹ {displayPrice.toLocaleString()}
            </p>
          </div>

          {nightlyDisplayPrice > 0 ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-400">
                Per Day
              </p>
              <p className="mt-1 text-sm font-semibold text-stone-700 leading-snug break-words">
                ₹ {nightlyDisplayPrice.toLocaleString()}
                {nightlyPriceTypeLabel ? ` / ${nightlyPriceTypeLabel}` : ''}
              </p>
            </div>
          ) : null}
        </div>

        {gstLabel ? (
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--theme)]">
            {gstLabel}
          </p>
        ) : null}
      </div>

      <div className="py-6 space-y-3 border-b border-stone-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-500 font-medium">Meals</span>
          <span className="text-stone-900 font-semibold">Pure Veg Included</span>
        </div>

        {!soldOut ? (
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-500 font-medium">Availability</span>
            <span className="text-emerald-700 font-semibold">Available</span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-500 font-medium">Availability</span>
            <span className="text-rose-700 font-semibold">Sold Out</span>
          </div>
        )}
      </div>

      <div className="pt-6">
        <p className="text-sm leading-relaxed text-stone-600 mb-5">
          A शांत, comfortable stay designed to support your retreat experience.
        </p>

       <button
  onClick={() => {
    if (!soldOut) onProceed();
  }}
  disabled={soldOut}
  className={`group relative w-full overflow-hidden rounded-[26px] py-5 text-lg font-black flex items-center justify-center gap-3 transition-all duration-200 ${
    soldOut
      ? 'cursor-not-allowed bg-stone-200 text-stone-500 shadow-none'
      : `
        bg-[linear-gradient(135deg,_var(--theme)_0%,_#0f766e_100%)]
        text-white
        shadow-[0_10px_25px_rgba(15,118,110,0.35)]
        hover:shadow-[0_16px_35px_rgba(15,118,110,0.45)]
        hover:-translate-y-[2px]
        active:translate-y-[1px]
        active:shadow-[0_6px_15px_rgba(15,118,110,0.35)]
      `
  }`}
>
  {/* soft shine overlay */}
  {!soldOut && (
    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
  )}

  {/* text */}
  <span className="relative z-10 tracking-wide">
    {soldOut ? 'Sold Out' : 'Book Now'}
  </span>

  {/* arrow */}
  <ArrowRight
    className={`relative z-10 w-6 h-6 transition-all duration-300 ${
      soldOut ? '' : 'group-hover:translate-x-2 group-hover:scale-110'
    }`}
  />
</button>

        <p className="mt-4 text-xs text-stone-500 text-center leading-relaxed">
          Need help? Call{' '}
          <a
            href="tel:9867666444"
            className="font-semibold text-[var(--theme)] underline underline-offset-4"
          >
            9867666444
          </a>
        </p>
      </div>
    </div>
  </div>
</div>
      </div>
    </div>
  );
};

export default PlanDetail;
