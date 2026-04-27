import React, { useEffect, useState } from 'react';
import { Plan } from '../types';
import {
  Loader2,
  ArrowRight,
  Sparkles,
  BadgeCheck,
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

const getNightlyDisplayPrice = (plan: any) => {
  const nightlyPrice = Number(plan?.pricePerNight || 0);
  return Number.isFinite(nightlyPrice) && nightlyPrice > 0 ? nightlyPrice : 0;
};

const getPlanCapacityLabel = (plan: any) => {
  const maxPax = Number(plan?.maxPax || plan?.maxGuests || plan?.maxOccupancy || 0);
  if (Number.isFinite(maxPax) && maxPax > 1) {
    return `Up to ${maxPax} guest${maxPax > 1 ? 's' : ''}`;
  }

  return '';
};

const getPlanRecommendation = (plan: any, index: number) => {
  if (plan?.tag === 'Recommended' || index === 0) {
    return 'Recommended';
  }

  if (String(plan?.priceType || '').toLowerCase().includes('room')) {
    return 'Best For Sharing';
  }

  return 'Popular Choice';
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

const PlanCardImage = ({
  src,
  alt,
  badge,
}: {
  src: string;
  alt: string;
  badge?: string;
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
    };
  }, [src]);

  return (
    <div className="w-full md:w-[13.5rem] lg:w-[14.5rem] h-44 md:h-auto overflow-hidden rounded-t-[24px] md:rounded-l-[24px] md:rounded-tr-none relative bg-stone-100">
      {!isReady ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[linear-gradient(180deg,_#f4f4f2_0%,_#ecece7_100%)]">
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-stone-200 bg-white/85 px-4 py-3 shadow-sm backdrop-blur-sm">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--theme)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">
              Loading Stay
            </span>
          </div>
        </div>
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/45 via-stone-900/10 to-transparent z-10" />
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.10),_transparent_38%)]" />

      {badge ? (
        <div className="absolute left-4 top-4 z-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3.5 py-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-white backdrop-blur-md shadow-md">
            <Sparkles className="h-3 w-3" />
            {badge}
          </span>
        </div>
      ) : null}

      <img
        src={src}
        alt={alt}
        className={`block w-full h-full object-cover transition duration-700 group-hover:scale-[1.03] ${
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
      <div className="max-w-5xl mx-auto px-6 py-20 w-full">
        <div className="rounded-[28px] border border-stone-100 bg-white p-10 text-center shadow-sm">
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
      <div className="max-w-5xl mx-auto px-6 py-20 w-full">
        <div className="rounded-[28px] border-2 border-dashed border-stone-200 bg-white p-10 text-center">
          <h2 className="text-2xl font-black text-stone-900">No Plans Available</h2>
          <p className="mt-2 text-sm font-medium text-stone-500">
            Plans for this event have not been published yet. Please check back shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 w-full animate-fadeIn">
      <div className="mb-10 rounded-[32px] border border-stone-200 bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.10),_transparent_42%),linear-gradient(180deg,_#ffffff_0%,_#f8f8f5_100%)] p-7 md:p-8 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div className="max-w-2xl">
            <p className="text-[11px] font-black uppercase tracking-[0.30em] text-[var(--theme)] mb-3">
              Stay Options
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-[-0.03em] text-stone-900 mb-3">
              {ui.title}
            </h2>
            <p className="text-stone-600 text-sm md:text-base leading-relaxed">
              Choose the stay that fits your comfort, budget, and travel style. Every option is curated for a smoother retreat experience.
            </p>
          </div>

          <div className="md:min-w-[145px]">
            <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3.5">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-stone-400">
                Available Plans
              </p>
              <p className="mt-1.5 text-xl font-black text-stone-900">{plans.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {plans.map((plan: any, index: number) => {
          const planTitle = plan.PlanTitle || plan.title || plan.PlanName || 'Plan';
          const planSubtitle = plan.stayRoomType || plan.PlanSubtitle || '';
          const planDescription = plan.PlanDescription || plan.description || '';
          const soldOut = isPlanSoldOut(plan);
          const finalPrice = Number(plan.finalPrice || plan.PlanPrice || 0);
          const rawOfferPrice = Number(plan.OfferPrice || 0);
          const displayPrice = Number(
            plan.discountedPrice || (rawOfferPrice > 0 ? rawOfferPrice : finalPrice || plan.PlanPrice || 0)
          );
          const nightlyDisplayPrice = getNightlyDisplayPrice(plan);
          const hasValidOffer = rawOfferPrice > 0 && rawOfferPrice < finalPrice;
          const rawPriceTypeLabel = getPriceTypeLabel(plan.priceType);
          const nightlyPriceTypeLabel =
            rawPriceTypeLabel.includes('night') && nightlyDisplayPrice <= 0
              ? ''
              : rawPriceTypeLabel;
          const isFeatured = index === 0;
          const recommendation = getPlanRecommendation(plan, index);
          const capacityLabel = getPlanCapacityLabel(plan);
          const gstLabel =
            plan.gstType === 'exclusive' && Number(plan.gstRate || 0) > 0
              ? `+ ${Number(plan.gstRate).toLocaleString()}% GST`
              : plan.gstDetails || '';

          return (
            <div
              key={plan.planID || plan.id}
              className={`relative mx-auto w-full max-w-5xl overflow-hidden rounded-[24px] border flex flex-col md:flex-row transition-all duration-400 group ${
                isFeatured
                  ? 'border-teal-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#f9fcfb_100%)] shadow-[0_22px_70px_rgba(15,118,110,0.08)]'
                  : 'border-stone-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#fcfcfa_100%)] shadow-[0_18px_55px_rgba(15,23,42,0.05)] hover:shadow-[0_24px_70px_rgba(15,23,42,0.08)]'
              }`}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--theme)] via-teal-300 to-transparent" />

              {soldOut ? (
                <div className="pointer-events-none absolute -left-2 top-4 z-[60] rotate-[-14deg]">
                  <div className="rounded-md border-[4px] border-rose-700 bg-rose-50/85 px-4 py-2.5 shadow-lg">
                    <div className="rounded-sm border-2 border-dashed border-rose-700/70 px-3 py-1.5">
                      <span className="block text-center text-sm font-black uppercase tracking-[0.30em] text-rose-700">
                        Sold Out
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}

              <PlanCardImage
                src={getThumbnailImage(plan)}
                alt={planTitle}
                badge={recommendation}
              />

              <div className="flex-1 p-5 md:p-6 lg:p-6 flex flex-col relative">
                <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[radial-gradient(circle,_rgba(15,118,110,0.06),_transparent_68%)]" />

                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 mb-5 relative z-10">
                  <div className="max-w-2xl">
                    <div className="mb-2.5 flex flex-wrap items-center gap-2">
                      <h3 className="text-lg md:text-xl font-black tracking-[-0.03em] text-stone-900">
                        {planTitle}
                      </h3>

                      {isFeatured ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--theme-light)] px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-[var(--theme)]">
                          <BadgeCheck className="h-3.5 w-3.5" />
                          Featured
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {planSubtitle ? (
                        <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-stone-500">
                          {planSubtitle}
                        </span>
                      ) : null}

                      {capacityLabel ? (
                        <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-stone-500">
                          {capacityLabel}
                        </span>
                      ) : null}
                    </div>

                    <p className="text-stone-600 text-sm md:text-[15px] font-medium leading-relaxed whitespace-pre-line max-w-lg line-clamp-4">
                      {planDescription}
                    </p>
                  </div>

                  <div className="rounded-[20px] border border-stone-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#fafaf8_100%)] px-4 py-4 min-w-[200px] max-w-[220px] shadow-[0_10px_26px_rgba(15,23,42,0.05)] shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-stone-400">
                      {hasValidOffer ? 'Now Booking At' : 'Price'}
                    </p>

                    <div className="mt-2 flex flex-wrap items-end gap-2">
                      <span className="text-lg md:text-xl font-black text-stone-900">
                        ₹{displayPrice.toLocaleString()}
                      </span>

                      {hasValidOffer ? (
                        <span className="text-[11px] font-bold text-stone-400 line-through">
                          ₹{finalPrice.toLocaleString()}
                        </span>
                      ) : null}
                    </div>

                    {nightlyDisplayPrice > 0 ? (
                      <p className="mt-1.5 text-[11px] font-semibold text-stone-600 leading-snug">
                        Per Day: ₹{nightlyDisplayPrice.toLocaleString()}
                        {nightlyPriceTypeLabel ? ` / ${nightlyPriceTypeLabel}` : ''}
                      </p>
                    ) : null}

                    {gstLabel ? (
                      <p className="mt-2 text-[9px] font-black uppercase tracking-[0.14em] text-[var(--theme)]">
                        {gstLabel}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-stone-200 relative z-10">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3 text-sm text-stone-500">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-[var(--theme-light)] text-[var(--theme)] shrink-0">
                      <BadgeCheck className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <p className="font-black text-sm text-stone-800">
                        Thoughtfully curated stay option
                      </p>
                      <p className="text-[11px] font-semibold text-stone-500">
                        Smooth check-in and retreat-friendly accommodation
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!soldOut) onSelect(plan);
                    }}
                    disabled={soldOut}
                    className={`group relative inline-flex min-w-[148px] whitespace-nowrap items-center justify-center gap-3 px-6 py-3.5 rounded-[22px] font-black transition-all duration-200 overflow-hidden ${
                      soldOut
                        ? 'cursor-not-allowed bg-stone-200 text-stone-500 shadow-none'
                        : `
                          bg-[linear-gradient(135deg,_var(--theme)_0%,_#0f766e_100%)]
                          text-white
                          shadow-[0_10px_24px_rgba(15,118,110,0.28)]
                          hover:shadow-[0_16px_30px_rgba(15,118,110,0.35)]
                          hover:-translate-y-[2px]
                          active:translate-y-[1px]
                          active:shadow-[0_6px_14px_rgba(15,118,110,0.28)]
                        `
                    }`}
                  >
                    {!soldOut && (
                      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                    )}

                    <span className="relative z-10">{soldOut ? 'Sold Out' : ui.cta}</span>
                    {!soldOut ? (
                      <ArrowRight className="relative z-10 h-5 w-5 transition-all duration-300 group-hover:translate-x-1.5 group-hover:scale-110" />
                    ) : null}
                  </button>
                </div>
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
