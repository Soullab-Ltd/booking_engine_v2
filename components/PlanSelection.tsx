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
  if (Number.isFinite(maxPax) && maxPax > 0) {
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
    }
  }, [src]);

  return (
    <div className="w-full md:w-[15rem] lg:w-[16rem] h-52 md:h-auto overflow-hidden rounded-t-[28px] md:rounded-l-[28px] md:rounded-tr-none relative bg-stone-100">
      {!isReady ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[linear-gradient(180deg,_#f4f4f2_0%,_#ecece7_100%)]">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-stone-200 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-sm">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--theme)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-stone-500">
              Loading Stay
            </span>
          </div>
        </div>
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/50 via-stone-900/10 to-transparent z-10" />
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_38%)]" />
      {badge ? (
        <div className="absolute left-5 top-5 z-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-white backdrop-blur-md shadow-lg">
            <Sparkles className="h-3.5 w-3.5" />
            {badge}
          </span>
        </div>
      ) : null}
      <img
        src={src}
        alt={alt}
        className={`block w-full h-full object-cover transition duration-700 group-hover:scale-[1.04] ${
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
      <div className="max-w-5xl mx-auto px-6 py-20 w-full">
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
    <div className="max-w-5xl mx-auto px-6 py-12 w-full animate-fadeIn">
      <div className="mb-12 rounded-[36px] border border-stone-200 bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.12),_transparent_42%),linear-gradient(180deg,_#ffffff_0%,_#f7f7f4_100%)] p-8 md:p-10 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-[11px] font-black uppercase tracking-[0.32em] text-[var(--theme)] mb-3">
              Stay Options
            </p>
            <h2 className="text-3xl md:text-5xl font-black tracking-[-0.03em] text-stone-900 mb-3">
              {ui.title}
            </h2>
            <p className="text-stone-600 text-base md:text-lg leading-relaxed">
              Choose the stay that fits your comfort, budget, and travel style. Every option is curated for a smoother retreat experience.
            </p>
          </div>

          <div className="md:min-w-[160px]">
            <div className="rounded-2xl border border-stone-200 bg-white px-4 py-4">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-stone-400">Available Plans</p>
              <p className="mt-2 text-2xl font-black text-stone-900">{plans.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8">
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
              className={`relative overflow-hidden rounded-[28px] border flex flex-col md:flex-row transition-all duration-500 group ${
                isFeatured
                  ? 'border-teal-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fcfb_100%)] shadow-[0_32px_100px_rgba(15,118,110,0.10)]'
                  : 'border-stone-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#fcfcfa_100%)] shadow-[0_24px_80px_rgba(15,23,42,0.06)] hover:shadow-[0_32px_100px_rgba(15,23,42,0.10)]'
              }`}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--theme)] via-teal-300 to-transparent" />
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
                badge={recommendation}
              />

              <div className="flex-1 p-5 md:p-6 lg:p-6 flex flex-col relative">
                <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-[radial-gradient(circle,_rgba(15,118,110,0.08),_transparent_68%)]" />

                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 mb-5 relative z-10">
                  <div className="max-w-2xl">
                    <div className="mb-3 flex flex-wrap items-center gap-2.5">
                      <h3 className="text-xl md:text-2xl font-black tracking-[-0.03em] text-stone-900">
                        {planTitle}
                      </h3>
                      {isFeatured ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-[var(--theme-light)] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--theme)]">
                          <BadgeCheck className="h-3.5 w-3.5" />
                          Featured
                        </span>
                        ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {planSubtitle ? (
                        <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-stone-500">
                          {planSubtitle}
                        </span>
                      ) : null}
                      {capacityLabel ? (
                        <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-stone-500">
                          {capacityLabel}
                        </span>
                        ) : null}
                    </div>

                    <p className="text-stone-600 text-sm font-medium leading-relaxed whitespace-pre-line max-w-xl line-clamp-3">
                      {planDescription}
                    </p>
                  </div>

                  <div className="rounded-[22px] border border-stone-200 bg-white/95 backdrop-blur-sm px-3.5 py-3.5 min-w-[160px] max-w-[185px] shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-stone-400">
                      {hasValidOffer ? 'Now Booking At' : 'Price'}
                    </p>
                    <div className="mt-2.5 flex flex-wrap items-end gap-2">
                      <span className="text-xl md:text-2xl font-black text-stone-900">
                        ₹{displayPrice.toLocaleString()}
                      </span>
                      {hasValidOffer ? (
                        <span className="text-xs font-bold text-stone-400 line-through">
                          ₹{finalPrice.toLocaleString()}
                        </span>
                      ) : null}
                    </div>

                    {nightlyDisplayPrice > 0 ? (
                      <p className="mt-2 text-xs font-bold text-stone-600">
                        Per Day: ₹{nightlyDisplayPrice.toLocaleString()}
                        {nightlyPriceTypeLabel ? ` / ${nightlyPriceTypeLabel}` : ''}
                      </p>
                    ) : null}

                    {gstLabel ? (
                      <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--theme)]">
                        {gstLabel}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-stone-200 relative z-10">
                  <div className="flex items-center gap-3 text-sm text-stone-500">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--theme-light)] text-[var(--theme)]">
                      <BadgeCheck className="h-5 w-5" />
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
                    className={`inline-flex min-w-[155px] whitespace-nowrap items-center justify-center gap-3 px-6 py-3.5 rounded-2xl font-black transition-all shadow-lg ${
                      soldOut
                        ? 'cursor-not-allowed bg-stone-200 text-stone-500 shadow-none'
                        : 'bg-[var(--theme)] text-white hover:bg-[var(--theme-dark)] hover:scale-[1.02] shadow-[0_18px_40px_rgba(15,118,110,0.25)]'
                    }`}
                  >
                    {soldOut ? 'Sold Out' : ui.cta}
                    {!soldOut ? <ArrowRight className="h-5 w-5" /> : null}
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
