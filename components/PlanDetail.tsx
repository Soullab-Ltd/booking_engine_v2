import React, { useEffect, useMemo, useState } from 'react';
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
} from 'lucide-react';
import { trackCleverTapEvent } from '../src/services/cleverTap';
import {
  getEventId,
  getEventName,
  getPlanId,
  getPlanName,
} from '../src/services/cleverTapBooking';

interface PlanDetailProps {
  event?: any;
  plan: Plan;
  onProceed: () => void;
  onBack: () => void;
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

const PlanDetail: React.FC<PlanDetailProps> = ({
  event,
  plan,
  onProceed,
  onBack,
}) => {
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
  const priceTypeLabel = getPriceTypeLabel((plan as any).priceType);
  const soldOut = isPlanSoldOut(plan);
  const gstLabel =
    (plan as any).gstType === 'exclusive' && Number((plan as any).gstRate || 0) > 0
      ? `+ ${Number((plan as any).gstRate).toLocaleString()}% GST`
      : plan.gstDetails || '';

  useEffect(() => {
    trackCleverTapEvent(
      'plan_detail_viewed',
      {
        event_id: getEventId(event),
        event_name: getEventName(event),
        plan_id: getPlanId(plan),
        plan_name: getPlanName(plan),
        price_type: (plan as any).priceType || '',
        offer_price: Number(plan.discountedPrice || plan.OfferPrice || 0),
        final_price: Number(plan.finalPrice || plan.PlanPrice || 0),
        gst_type: (plan as any).gstType || '',
        gst_rate: Number((plan as any).gstRate || 0),
        amenities_count: Number((plan.amenities || plan.icons || []).length),
        image_count: carouselImages.length,
      },
      {
        dedupeKey: `plan_detail_viewed:${getEventId(event)}:${getPlanId(plan)}`,
        dedupeWindowMs: 60000,
      }
    );
  }, [carouselImages.length, event, plan]);

  return (
    <div className="animate-fadeIn pb-32 bg-white">
      <div className="relative h-[450px] w-full overflow-hidden">
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

        <div className="absolute top-8 left-8 z-20">
          <button
            onClick={onBack}
            className="bg-white/20 backdrop-blur-xl hover:bg-white/40 text-white p-3 rounded-2xl transition-all border border-white/20 flex items-center gap-2 font-black text-xs uppercase tracking-widest"
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

        <div className="absolute bottom-12 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-8">
            <span className="bg-[var(--theme)] text-white text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-lg mb-4 inline-block shadow-lg">
              Accommodation Tier
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl">
              {plan.PlanTitle}
            </h1>
            {soldOut ? (
              <span className="mt-4 inline-block rounded-full bg-rose-500/90 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-lg">
                Sold Out
              </span>
            ) : null}
          </div>
        </div>

        {carouselImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
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

      <div className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-16">
          <section className="animate-slideUp">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-1 rounded-full bg-[var(--theme)]"></div>
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--theme)]">
                Plan Details
              </h2>
            </div>
            <p className="text-2xl text-stone-700 leading-relaxed font-medium">
              {plan.fullDescription || plan.PlanDescription}
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-1 rounded-full bg-[var(--theme)]"></div>
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--theme)]">
                Amenities
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-y-3 mb-6">
              {(plan.amenities || plan.icons || []).slice(0, 4).map((amenity: any) => (
                <div
                  key={amenity.id}
                  className="flex items-center gap-2 text-sm text-stone-600 font-medium"
                >
                  <AmenityIcon name={amenity.Title || amenity.title} />
                  <span>{amenity.Title || amenity.title}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="p-10 bg-stone-900 rounded-[40px] text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-stone-100">
            <div className="w-20 h-20 bg-[var(--theme)] rounded-3xl flex items-center justify-center shrink-0 shadow-lg">
              <Heart className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-black mb-2">Customer Support</h3>
              <p className="text-teal-200 leading-relaxed font-medium">
                Please contact our customer support @{' '}
                <a
                  href="tel:987666444"
                  className="underline underline-offset-4"
                  onClick={() =>
                    trackCleverTapEvent('plan_detail_support_call_clicked', {
                      event_id: getEventId(event),
                      event_name: getEventName(event),
                      plan_id: getPlanId(plan),
                      plan_name: getPlanName(plan),
                      support_phone: '987666444',
                      placement: 'plan_detail',
                    })
                  }
                >
                  987666444
                </a>{' '}
                for any queries.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 relative">
          <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-stone-50 sticky top-24 overflow-hidden group">
            <div className="absolute top-0 right-0 -m-8 w-32 h-32 bg-stone-50 rounded-full opacity-50 transition-transform group-hover:scale-150 duration-700"></div>

            <h3 className="text-xs font-black text-stone-300 uppercase tracking-widest mb-8">
              Selected Plan
            </h3>

            <div className="space-y-6 mb-12">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-bold text-stone-400">Price</span>
                <span className="text-lg font-bold text-stone-400 line-through">
                  ₹ {Number(plan.finalPrice || plan.PlanPrice || 0).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-end">
                <span className="text-sm font-black text-[var(--theme)] uppercase tracking-tighter">
                  Retreat Offering
                </span>
                <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest mt-1">
                  {priceTypeLabel}
                </span>
                <div className="text-right">
                  <span className="text-5xl font-black text-stone-900">
                    ₹ {Number(plan.discountedPrice || plan.OfferPrice || 0).toLocaleString()}
                  </span>
                  {gstLabel ? (
                    <p className="text-[10px] font-black text-[var(--theme)] mt-1 uppercase tracking-widest">
                      {gstLabel}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-8 border-t border-stone-50 mb-12">
              {soldOut ? (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                  This plan is currently sold out. Please choose another available option.
                </div>
              ) : null}
              <div className="flex items-center gap-3 text-sm text-stone-500 font-medium">
                <ShieldCheck className="w-5 h-5 text-teal-500" />
                Flat Rs 10000 for kids aged 17 years and below!
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-500 font-medium">
                <Flower2 className="w-5 h-5 text-teal-400" />
                Pure Veg meals included
              </div>
            </div>

            <button
              onClick={() => {
                if (soldOut) return;

                trackCleverTapEvent('plan_detail_book_now_clicked', {
                  event_id: getEventId(event),
                  event_name: getEventName(event),
                  plan_id: getPlanId(plan),
                  plan_name: getPlanName(plan),
                  offer_price: Number(plan.discountedPrice || plan.OfferPrice || 0),
                  final_price: Number(plan.finalPrice || plan.PlanPrice || 0),
                  next_step: 4,
                });

                onProceed();
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
