import React, { useEffect, useState } from 'react';
import { Plan } from '../types';
import {
  Check,
  Loader2,
  Wifi,
  Sun,
  Wind,
  Bed,
  ConciergeBell,
  DoorOpen,
  Utensils,
  Heart,
  Flower2,
  Car,
} from 'lucide-react';

const loadedPlanImageCache = new Set<string>();
const pendingPlanImageCache = new Map<string, Promise<void>>();

interface PlanSelectionProps {
  plans: Plan[];
  ui: any;
  onSelect: (plan: Plan) => void;
  onBack: () => void;
  isLoading?: boolean;
}

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

const getThumbnailImage = (plan: any) => {
  return (
    plan.images?.find((img: any) => Number(img.isThumbnail) === 1)?.imageUrl ||
    plan.images?.find((img: any) => Number(img.isMain) === 1)?.imageUrl ||
    plan.images?.[0]?.imageUrl ||
    plan.thumbnail ||
    plan.bannerImage ||
    'https://via.placeholder.com/1200x600?text=No+Image'
  );
};

const primePlanImage = (src: string) => {
  if (!src || loadedPlanImageCache.has(src)) {
    return Promise.resolve();
  }

  const existingRequest = pendingPlanImageCache.get(src);
  if (existingRequest) {
    return existingRequest;
  }

  const request = new Promise<void>((resolve) => {
    const image = new Image();

    const finish = () => {
      loadedPlanImageCache.add(src);
      pendingPlanImageCache.delete(src);
      resolve();
    };

    image.onload = finish;
    image.onerror = finish;
    image.src = src;

    if (image.complete) {
      finish();
    }
  });

  pendingPlanImageCache.set(src, request);
  return request;
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

const AmenityFallbackIcon = ({ name }: { name: string }) => {
  const normalizedName = String(name || '').toLowerCase();

  if (normalizedName.includes('wifi')) return <Wifi className="h-4 w-4 text-[var(--theme)]" />;
  if (normalizedName.includes('heating') || normalizedName.includes('floor') || normalizedName.includes('ac')) {
    return <Sun className="h-4 w-4 text-[var(--theme)]" />;
  }
  if (normalizedName.includes('spa')) return <Heart className="h-4 w-4 text-[var(--theme)]" />;
  if (normalizedName.includes('bed') || normalizedName.includes('stay') || normalizedName.includes('room')) {
    return <Bed className="h-4 w-4 text-[var(--theme)]" />;
  }
  if (normalizedName.includes('meal') || normalizedName.includes('banquet') || normalizedName.includes('food')) {
    return <Utensils className="h-4 w-4 text-[var(--theme)]" />;
  }
  if (normalizedName.includes('view') || normalizedName.includes('riverside') || normalizedName.includes('air')) {
    return <Wind className="h-4 w-4 text-[var(--theme)]" />;
  }
  if (normalizedName.includes('concierge') || normalizedName.includes('support')) {
    return <ConciergeBell className="h-4 w-4 text-[var(--theme)]" />;
  }
  if (normalizedName.includes('meditation') || normalizedName.includes('altar')) {
    return <Flower2 className="h-4 w-4 text-[var(--theme)]" />;
  }
  if (normalizedName.includes('private entry') || normalizedName.includes('deck')) {
    return <DoorOpen className="h-4 w-4 text-[var(--theme)]" />;
  }
  if (normalizedName.includes('parking') || normalizedName.includes('car')) {
    return <Car className="h-4 w-4 text-[var(--theme)]" />;
  }

  return <Check className="h-4 w-4 text-[var(--theme)]" />;
};

const AmenityVisual = ({
  name,
  iconUrl,
}: {
  name: string;
  iconUrl?: string;
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  if (iconUrl && !imageFailed) {
    return (
      <img
        src={iconUrl}
        alt={name}
        className="h-4 w-4 object-contain"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return <AmenityFallbackIcon name={name} />;
};

const PlanCardImage = ({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) => {
  const [isReady, setIsReady] = useState(() => loadedPlanImageCache.has(src));

  useEffect(() => {
    let isMounted = true;
    setIsReady(loadedPlanImageCache.has(src));

    primePlanImage(src).then(() => {
      if (isMounted) {
        setIsReady(true);
      }
    });

    return () => {
      isMounted = false;
    }
  }, [src]);

  return (
    <div className="w-full md:w-72 h-56 md:h-auto overflow-hidden rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none relative bg-stone-100">
      {!isReady ? (
        <div className="absolute inset-0 bg-stone-100" />
      ) : null}
      <img
        src={src}
        alt={alt}
        className={`block w-full h-full object-cover transition-opacity duration-200 ${
          isReady ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};

const PlanSelection: React.FC<PlanSelectionProps> = ({
  plans,
  ui,
  onSelect,
  onBack,
  isLoading = false,
}) => {
  useEffect(() => {
    plans.forEach((plan: any) => {
      void primePlanImage(getThumbnailImage(plan));
    });
  }, [plans]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 w-full">
        <div className="rounded-[32px] border border-stone-100 bg-white p-12 text-center shadow-sm">
          <Loader2 className="w-10 h-10 text-[var(--theme)] animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-black text-stone-900">Loading Plans</h2>
          <p className="mt-2 text-sm font-medium text-stone-500">
            We are fetching the latest pricing and availability for this event.
          </p>
        </div>
      </div>
    );
  }

  if (!plans.length) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 w-full">
        <div className="rounded-[32px] border-2 border-dashed border-stone-200 bg-white p-12 text-center">
          <h2 className="text-2xl font-black text-stone-900">No Plans Available</h2>
          <p className="mt-2 text-sm font-medium text-stone-500">
            Plans for this event have not been published yet. Please check back shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 w-full animate-fadeIn">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-stone-900 mb-2">{ui.title}</h2>
        <p className="text-stone-600"></p>
      </div>

      <div className="grid gap-8">
        {plans.map((plan: any, index: number) => {
          const amenities = plan.amenities || plan.icons || [];
          const planTitle = plan.PlanTitle || plan.title || plan.PlanName || 'Plan';
          const planSubtitle = plan.stayRoomType || plan.PlanSubtitle || '';
          const planDescription = plan.PlanDescription || plan.description || '';
          const soldOut = isPlanSoldOut(plan);
          const finalPrice = Number(plan.finalPrice || plan.PlanPrice || 0);
          const discountedPrice = Number(
            plan.discountedPrice || plan.OfferPrice || plan.finalPrice || plan.PlanPrice || 0
          );
          const priceTypeLabel = getPriceTypeLabel(plan.priceType);
          const gstLabel =
            plan.gstType === 'exclusive' && Number(plan.gstRate || 0) > 0
              ? `+ ${Number(plan.gstRate).toLocaleString()}% GST`
              : plan.gstDetails || '';

          return (
            <div
              key={plan.planID || plan.id}
              className="relative w-full max-w-3xl mx-auto bg-white rounded-3xl shadow-md border border-stone-100 flex flex-col md:flex-row hover:shadow-2xl transition-all duration-500 group"
            >
              {soldOut ? (
                <div className="pointer-events-none absolute -left-2 top-4 z-20 rotate-[-16deg]">
                  <div className="rounded-md border-[5px] border-rose-700 bg-rose-50/85 px-5 py-3 shadow-xl">
                    <div className="rounded-sm border-2 border-dashed border-rose-700/70 px-4 py-2">
                      <span className="block text-center text-lg font-black uppercase tracking-[0.35em] text-rose-700">
                        Sold Out
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
              <PlanCardImage
                src={getThumbnailImage(plan)}
                alt={planTitle}
              />

              <div className="flex-1 p-6 md:p-8 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl font-black text-stone-900">{planTitle}</h3>
                    </div>

                    {planSubtitle ? (
                      <p className="text-stone-500 text-sm font-medium whitespace-pre-line mb-2">
                        {planSubtitle}
                      </p>
                    ) : null}

                    <p className="text-stone-500 text-sm font-medium whitespace-pre-line">
                      {planDescription}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-3 mb-6">
                  {amenities.slice(0, 4).map((amenity: any) => {
                    const amenityTitle = amenity.Title || amenity.title || '';
                    const amenityIcon = amenity.IconUrl || amenity.iconUrl || '';

                    return (
                      <div
                        key={amenity.id}
                        className="flex items-center gap-2 text-sm text-stone-600 font-medium"
                      >
                        <AmenityVisual name={amenityTitle} iconUrl={amenityIcon} />
                        <span>{amenityTitle}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-auto flex items-end justify-between pt-6 border-t border-stone-50">
                  <div>
                    <span className="text-stone-400 line-through text-sm font-bold">
                      ₹{finalPrice.toLocaleString()}
                    </span>

                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-3xl font-black text-stone-900">
                        ₹{discountedPrice.toLocaleString()}
                      </span>

                      <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                        / {priceTypeLabel}
                      </span>

                      {gstLabel ? (
                        <span className="text-xs text-[var(--theme)] font-bold">
                          {gstLabel}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!soldOut) onSelect(plan);
                    }}
                    disabled={soldOut}
                    className={`px-8 py-3 rounded-2xl font-black transition-all shadow-lg ${
                      soldOut
                        ? 'cursor-not-allowed bg-stone-200 text-stone-500 shadow-none'
                        : 'bg-[var(--theme)] text-white hover:bg-[var(--theme-dark)] hover:scale-105 shadow-[var(--theme-light)]'
                    }`}
                  >
                    {soldOut ? 'Sold Out' : ui.cta}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlanSelection;
