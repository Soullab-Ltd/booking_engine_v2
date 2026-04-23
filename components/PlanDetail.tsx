import React, { useMemo, useState } from 'react';
import { Plan } from '../types';
import {
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Wifi,
  Sun,
  Wind,
  Bed,
  ConciergeBell,
  DoorOpen,
  Utensils,
  ChevronLeft,
  Heart,
  Flower2,
  ChevronRight,
  Users,
  Bath,
  Ruler,
  Home,
} from 'lucide-react';

interface PlanDetailProps {
  plan: Plan;
  onProceed: () => void;
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
  if (n.includes('wifi')) return <Wifi className="w-6 h-6" />;
  if (n.includes('heating') || n.includes('floor')) return <Sun className="w-6 h-6" />;
  if (n.includes('spa')) return <Heart className="w-6 h-6" />;
  if (n.includes('bed')) return <Bed className="w-6 h-6" />;
  if (n.includes('meal') || n.includes('banquet') || n.includes('food')) return <Utensils className="w-6 h-6" />;
  if (n.includes('view') || n.includes('riverside')) return <Wind className="w-6 h-6" />;
  if (n.includes('concierge') || n.includes('support')) return <ConciergeBell className="w-6 h-6" />;
  if (n.includes('meditation') || n.includes('altar')) return <Flower2 className="w-6 h-6" />;
  if (n.includes('private entry') || n.includes('deck')) return <DoorOpen className="w-6 h-6" />;
  return <CheckCircle className="w-6 h-6" />;
};

const PlanFeatureIcon = ({ iconName }: { iconName: string }) => {
  const normalizedIcon = String(iconName || '').trim().toLowerCase();

  if (normalizedIcon.includes('bed')) return <Bed className="w-8 h-8 text-[var(--theme)]" />;
  if (normalizedIcon.includes('bath') || normalizedIcon.includes('toilet') || normalizedIcon.includes('wash')) {
    return <Bath className="w-8 h-8 text-[var(--theme)]" />;
  }
  if (normalizedIcon.includes('guest') || normalizedIcon.includes('people') || normalizedIcon.includes('user')) {
    return <Users className="w-8 h-8 text-[var(--theme)]" />;
  }
  if (normalizedIcon.includes('sq') || normalizedIcon.includes('area') || normalizedIcon.includes('size')) {
    return <Ruler className="w-8 h-8 text-[var(--theme)]" />;
  }
  if (normalizedIcon.includes('room') || normalizedIcon.includes('home') || normalizedIcon.includes('house')) {
    return <Home className="w-8 h-8 text-[var(--theme)]" />;
  }

  return <CheckCircle className="w-8 h-8 text-[var(--theme)]" />;
};

const getPlanGuestCapacity = (plan: any): string => {
  const description = String(
    plan?.PlanDescription || plan?.description || ''
  ).trim();

  const guestMatch =
    description.match(/(?:upto|up to)\s+(\d+)\s+guests?/i) ||
    description.match(/\b(\d+)\s+guests?\b/i);

  if (guestMatch?.[1]) {
    return guestMatch[1];
  }

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

const parseFeatureCollection = (rawValue: any): any[] => {
  let parsedValue = rawValue;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (Array.isArray(parsedValue)) {
      return parsedValue;
    }

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

      return Object.values(parsedValue);
    }

    return [];
  }

  if (Array.isArray(parsedValue)) {
    return parsedValue;
  }

  if (parsedValue && typeof parsedValue === 'object') {
    return Object.values(parsedValue);
  }

  return [];
};

const isPlanSoldOut = (plan: any) => {
  if (plan?.isSoldOut === true) return true;
  if (plan?.isSoldOut === false) return false;

  const availableRooms = Number(
    plan?.availableRooms ?? plan?.inventory?.availableRooms
  );

  if (!Number.isNaN(availableRooms)) {
    return availableRooms <= 0;
  }

  return Number(plan?.remainingInventory ?? 0) <= 0;
};

const PlanDetail: React.FC<PlanDetailProps> = ({ plan, onProceed, onBack }) => {
  const planFeatures = useMemo(() => {
    let featureList: any[] = [];

    for (const key of PLAN_FEATURE_KEYS) {
      const parsedFeatures = parseFeatureCollection((plan as any)?.[key]);
      if (parsedFeatures.length > 0) {
        featureList = parsedFeatures;
        break;
      }
    }

    return featureList.filter(
      (feature: any) =>
        feature?.label ||
        feature?.Label ||
        feature?.title ||
        feature?.Title ||
        feature?.value ||
        feature?.Value ||
        feature?.description
    );
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

  const fallbackImage =
    'https://via.placeholder.com/1200x600?text=No+Image';

  const carouselImages = sortedImages.length
    ? sortedImages.map((img: any) => img.imageUrl).filter(Boolean)
    : [plan.thumbnail || plan.bannerImage || fallbackImage];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isHeroImageLoaded, setIsHeroImageLoaded] = useState(false);

  const goPrev = () => {
    setIsHeroImageLoaded(false);
    setActiveIndex((prev) =>
      prev === 0 ? carouselImages.length - 1 : prev - 1
    );
  };

  const goNext = () => {
    setIsHeroImageLoaded(false);
    setActiveIndex((prev) =>
      prev === carouselImages.length - 1 ? 0 : prev + 1
    );
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
    rawPriceTypeLabel.includes('night') && nightlyDisplayPrice <= 0
      ? ''
      : rawPriceTypeLabel;
  const planSubtitle = String(
    plan.PlanSubtitle || plan.stayRoomType || plan.PlanName || ''
  ).trim();
  const amenityList = (plan.amenities || plan.icons || []).slice(0, 6);
  const displayFeatures = useMemo(() => {
    if (planFeatures.length > 0) {
      return planFeatures;
    }

    const fallbackFeatures: Array<{
      id: string;
      label: string;
      value: string;
      icon: string;
    }> = [];

    const roomType = String(
      (plan as any).PlanSubtitle ||
        (plan as any).stayRoomType ||
        (plan as any).stayType ||
        ''
    ).trim();

    if (roomType) {
      fallbackFeatures.push({
        id: 'room-type',
        label: 'Room Type',
        value: roomType,
        icon: 'room',
      });
    }

    const guestCapacity = getPlanGuestCapacity(plan);
    if (guestCapacity) {
      fallbackFeatures.push({
        id: 'guest-capacity',
        label: 'Guests',
        value: guestCapacity,
        icon: 'guest',
      });
    }

    const nightlyRate = Number((plan as any).pricePerNight || 0);
    if (Number.isFinite(nightlyRate) && nightlyRate > 0) {
      fallbackFeatures.push({
        id: 'nightly-rate',
        label: 'Nightly Rate',
        value: `Rs ${nightlyRate.toLocaleString()}`,
        icon: 'rate',
      });
    }

    if (nightlyPriceTypeLabel) {
      fallbackFeatures.push({
        id: 'billing-type',
        label: 'Billing',
        value: nightlyPriceTypeLabel,
        icon: 'billing',
      });
    }

    return fallbackFeatures.slice(0, 4);
  }, [plan, planFeatures, nightlyPriceTypeLabel]);
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

        <div className="absolute top-8 left-8 z-20">
          <button
            onClick={onBack}
            className="bg-white/15 backdrop-blur-xl hover:bg-white/30 text-white px-4 py-3 rounded-2xl transition-all border border-white/20 flex items-center gap-2 font-black text-xs uppercase tracking-widest shadow-2xl"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        </div>

        {carouselImages.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-black/25 hover:bg-black/40 text-white p-3 rounded-full backdrop-blur-md transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={goNext}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-black/25 hover:bg-black/40 text-white p-3 rounded-full backdrop-blur-md transition"
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
                  <span className="rounded-full bg-rose-500/90 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-lg">
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
                <img src={image} alt={`${plan.PlanTitle} ${index + 1}`} className="h-full w-full object-cover" />
                <span className={`absolute inset-0 transition ${index === activeIndex ? 'ring-2 ring-inset ring-[var(--theme)]' : 'bg-black/10'}`} />
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
                Plan Details
              </h2>
            </div>
            <p className="text-lg md:text-2xl text-stone-700 leading-relaxed font-medium">
              {plan.fullDescription || plan.PlanDescription}
            </p>
          </section>

          <section className="rounded-[32px] border border-stone-200/80 bg-white p-8 md:p-10 shadow-[0_24px_80px_rgba(15,23,42,0.05)]">
            {displayFeatures.length > 0 ? (
              <>
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-12 h-1 rounded-full bg-[var(--theme)]"></div>
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--theme)]">
                    {planFeatures.length > 0 ? 'Features' : 'Plan Highlights'}
                  </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                  {displayFeatures.map((feature: any, index: number) => (
                    <div
                      key={feature?.id || `${feature?.label || feature?.Label || 'feature'}-${index}`}
                      className="rounded-[28px] border border-stone-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#f7f7f5_100%)] p-5 md:p-6 flex flex-col items-center text-center gap-3 shadow-sm"
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--theme-light)]">
                        <PlanFeatureIcon iconName={feature?.icon || feature?.Icon || feature?.iconName} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-black uppercase tracking-[0.16em] text-stone-400">
                          {feature?.label || feature?.Label || feature?.title || feature?.Title || 'Feature'}
                        </p>
                        <p className="text-base md:text-lg font-semibold text-stone-800">
                          {feature?.value || feature?.Value || feature?.description || '-'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-1 rounded-full bg-[var(--theme)]"></div>
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--theme)]">
                Amenities
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
              {amenityList.map((amenity: any) => (
                <div
                  key={amenity.id}
                  className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-sm text-stone-700 font-medium"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <AmenityIcon name={amenity.Title || amenity.title} />
                  </div>
                  <span>{amenity.Title || amenity.title}</span>
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
              <h3 className="text-2xl font-black mb-2">Customer Support</h3>
              <p className="text-teal-50/90 leading-relaxed font-medium">
                Please contact our customer support @{' '}
                <a href="tel:9867666444" className="underline underline-offset-4 decoration-teal-200">
                  9867666444
                </a>{' '}
                for any queries.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 relative">
          <div className="bg-[linear-gradient(180deg,_#ffffff_0%,_#fbfbf9_100%)] p-8 md:p-10 rounded-[40px] shadow-[0_28px_100px_rgba(15,23,42,0.10)] border border-stone-200 sticky top-24 overflow-hidden group">
            <div className="absolute top-0 right-0 -m-10 h-36 w-36 rounded-full bg-[var(--theme-light)] opacity-80 transition-transform group-hover:scale-150 duration-700"></div>
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--theme)] via-teal-300 to-transparent"></div>

            <h3 className="text-xs font-black text-stone-400 uppercase tracking-[0.28em] mb-8 relative z-10">
              Booking Snapshot
            </h3>

            <div className="mb-8 rounded-[30px] border border-stone-200 bg-white p-6 relative z-10 shadow-sm">
              <p className="text-sm font-semibold text-stone-500 mb-1">Retreat Offering</p>
              <h4 className="text-2xl font-black text-stone-900 tracking-tight">
                {plan.PlanTitle || plan.PlanName}
              </h4>
              {planSubtitle ? (
                <p className="mt-2 text-sm font-medium text-stone-500">
                  {planSubtitle}
                </p>
              ) : null}

              <div className="mt-5 border-t border-stone-200 pt-5 space-y-3">
                {hasValidOffer ? (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Price</span>
                    <span className="text-base font-bold text-stone-400 line-through">
                      ₹ {finalPrice.toLocaleString()}
                    </span>
                  </div>
                ) : null}

                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-black text-[var(--theme)] uppercase tracking-[0.2em]">
                      {hasValidOffer ? 'Now' : 'Price'}
                    </p>
                    <p className="text-4xl md:text-5xl font-black text-stone-900 leading-none mt-2 whitespace-nowrap">
                      ₹ {displayPrice.toLocaleString()}
                    </p>
                  </div>
                </div>

                {nightlyDisplayPrice > 0 ? (
                  <div className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3">
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                      Per Day
                    </span>
                    <span className="text-sm font-bold text-stone-700 text-right">
                      ₹ {nightlyDisplayPrice.toLocaleString()}
                      {nightlyPriceTypeLabel ? ` / ${nightlyPriceTypeLabel}` : ''}
                    </span>
                  </div>
                ) : null}

                {gstLabel ? (
                  <p className="text-[10px] font-black text-[var(--theme)] uppercase tracking-widest pt-1">
                    {gstLabel}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-4 pt-8 border-t border-stone-200 mb-10 relative z-10">
              {soldOut ? (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                  This plan is currently sold out. Please choose another available option.
                </div>
              ) : null}
              <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 text-sm text-stone-600 font-medium border border-stone-200">
                <ShieldCheck className="w-5 h-5 text-teal-500 shrink-0" />
                Flat Rs 10000 for kids aged 17 years and below!
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 text-sm text-stone-600 font-medium border border-stone-200">
                <Flower2 className="w-5 h-5 text-teal-400 shrink-0" />
                Pure Veg meals included
              </div>
            </div>

            <button
              onClick={() => {
                if (!soldOut) onProceed();
              }}
              disabled={soldOut}
              className={`w-full py-5 rounded-[24px] font-black text-lg transition-all flex items-center justify-center gap-3 ${
                soldOut
                  ? 'cursor-not-allowed bg-stone-200 text-stone-500 shadow-none'
                  : 'bg-[var(--theme)] text-white shadow-xl shadow-[var(--theme-light)] group active:scale-95 hover:bg-[var(--theme-dark)]'
              }`}
            >
              {soldOut ? 'Sold Out' : 'Book Now!'}
              <ArrowRight className={`w-6 h-6 ${soldOut ? '' : 'group-hover:translate-x-2 transition-transform'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanDetail;
